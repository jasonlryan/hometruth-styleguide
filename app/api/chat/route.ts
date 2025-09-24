import { NextRequest, NextResponse } from 'next/server';

import { OpenAIService } from '@/lib/openai';
import { pineconeService, type RetrievalFilters, type RetrievalMode } from '@/lib/pinecone';
import { track } from '@/lib/telemetry';

const MAX_INPUT_LENGTH = Number(process.env.CHAT_MAX_INPUT_LENGTH ?? 2000);

function sanitizeMode(value: unknown): RetrievalMode {
  if (value === 'user' || value === 'hybrid' || value === 'knowledge') {
    return value;
  }
  return 'knowledge';
}

function sanitizeFilters(value: unknown): RetrievalFilters | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const filters = value as Record<string, unknown>;
  const result: RetrievalFilters = {};

  if (Array.isArray(filters.category)) {
    const categories = filters.category
      .map((entry) => (typeof entry === 'string' ? entry.trim() : null))
      .filter((entry): entry is string => Boolean(entry));
    if (categories.length > 0) {
      result.category = categories;
    }
  }

  if (typeof filters.namespace === 'string' && filters.namespace.trim().length > 0) {
    result.namespace = filters.namespace.trim();
  }

  if (Array.isArray(filters.tags)) {
    const tags = filters.tags
      .map((entry) => (typeof entry === 'string' ? entry.trim() : null))
      .filter((entry): entry is string => Boolean(entry));
    if (tags.length > 0) {
      result.tags = tags;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function createEventPayload(event: string, payload: unknown) {
  const dataString = JSON.stringify(payload ?? null);
  return `event: ${event}\ndata: ${dataString}\n\n`;
}

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch (error) {
    console.error('Invalid chat request payload:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const messageRaw = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!messageRaw) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 });
  }

  if (messageRaw.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { error: `Message is too long. Maximum length is ${MAX_INPUT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : undefined;
  const userId = typeof body?.userId === 'string' ? body.userId : undefined;
  const mode = sanitizeMode(body?.mode);
  const filters = sanitizeFilters(body?.filters);

  const requestStartedAt = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, payload: unknown) => {
        controller.enqueue(encoder.encode(createEventPayload(event, payload)));
      };

      const abortHandler = () => {
        try {
          controller.close();
        } catch (closeError) {
          console.warn('Chat stream close error after abort:', closeError);
        }
      };

      request.signal.addEventListener('abort', abortHandler, { once: true });

      try {
        const retrievalStartedAt = Date.now();
        const retrieval = await pineconeService.retrieveChatContext({
          query: messageRaw,
          mode,
          userId,
          filters,
        });
        const retrievalMs = Date.now() - retrievalStartedAt;

        send('sources', retrieval.sources);

        const generationStartedAt = Date.now();
        const handle = await OpenAIService.streamChatResponse({
          question: messageRaw,
          context: retrieval.context,
          signal: request.signal,
        });

        let firstTokenLatency: number | undefined;

        for await (const token of handle.stream) {
          if (firstTokenLatency === undefined) {
            firstTokenLatency = Date.now() - generationStartedAt;
          }
          send('token', token);
        }

        const usage = await handle.usage.catch(() => null);
        const generationCompletedAt = Date.now();

        send('done', {
          totalTokens: usage?.total_tokens ?? null,
          promptTokens: usage?.prompt_tokens ?? null,
          completionTokens: usage?.completion_tokens ?? null,
          latencyMs: {
            total: generationCompletedAt - requestStartedAt,
            retrieval: retrievalMs,
            generation: generationCompletedAt - generationStartedAt,
            firstToken: firstTokenLatency ?? null,
          },
        });

        track({
          name: 'chat.stream.completed',
          props: {
            sessionId,
            mode,
            userId,
            sources: retrieval.sources.length,
            totalTokens: usage?.total_tokens ?? null,
            promptTokens: usage?.prompt_tokens ?? null,
            completionTokens: usage?.completion_tokens ?? null,
            retrievalMs,
            generationMs: generationCompletedAt - generationStartedAt,
            firstTokenMs: firstTokenLatency ?? null,
            totalMs: generationCompletedAt - requestStartedAt,
          },
        });
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          console.warn('Chat stream aborted by client.');
        } else {
          console.error('Chat stream error:', error);
          send('error', { message: 'Failed to generate response. Please try again.' });
          track({
            name: 'chat.stream.failed',
            props: {
              sessionId,
              mode,
              userId,
            },
          });
        }
      } finally {
        request.signal.removeEventListener('abort', abortHandler);
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
