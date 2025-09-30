import OpenAI from 'openai';

import { DEFAULT_CHAT_SYSTEM_PROMPT } from './prompt-defaults';
import { loadSystemPrompt } from './prompt-loader';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_CHAT_MODEL = process.env.OPENAI_MODEL_CHAT || 'gpt-5';
const DEFAULT_CHAT_TEMPERATURE = Number(process.env.OPENAI_CHAT_TEMPERATURE ?? 0.35);
const DEFAULT_MAX_COMPLETION_TOKENS = Number(process.env.MAX_TOKENS ?? 900);

export interface StreamChatResponseHandle {
  stream: AsyncGenerator<string, void, unknown>;
  usage: Promise<{ prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null>;
  model: string;
}

export class OpenAIService {
  // Analyze document content and suggest metadata
  static async analyzeDocument(text: string, filename: string) {
    try {
      const response = await client.responses.create({
        model: 'gpt-4o-mini', // Cost-effective model for analysis
        input: [
          {
            role: 'system',
            content: `You are an expert document analyzer for a homebuying knowledge base.
            Analyze the provided document and suggest appropriate metadata.

            Return a JSON object with these fields:
            - title: A clear, descriptive title
            - category: One of: "Legal", "Financial", "Property Assessment", "Buying Process", "General"
            - priority: One of: "low", "normal", "high", "critical"
            - source: One of: "Government", "Legal Firm", "Financial Institution", "Internal", "Manual Upload"
            - tags: Array of relevant tags (max 5)
            - summary: Brief summary of the document content

            Focus on homebuying, property, legal, and financial content.`,
          },
          {
            role: 'user',
            content: `Analyze this document:

            Filename: ${filename}
            Content: ${text.substring(0, 4000)}`,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        response_format: { type: 'json_object' },
      });

      const outputText = response.output_text?.trim()
        || response.output?.map((item) => {
          if (!('content' in item) || !Array.isArray(item.content)) {
            return '';
          }
          return item.content
            .map((part) => {
              if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
                return part.text;
              }
              return '';
            })
            .join('');
        }).join('')
        || '';

      const analysis = JSON.parse(outputText || '{}');
      return {
        success: true,
        ...analysis
      };
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze document'
      };
    }
  }

  // Fallback metadata generation when OpenAI is unavailable
  static generateFallbackMetadata(text: string, filename: string) {
    console.log('Generating fallback metadata for:', filename, 'Text length:', text.length);
    const lowerText = text.toLowerCase();
    
    // Determine category based on content keywords
    let category = "General";
    if (lowerText.includes('legal') || lowerText.includes('law') || lowerText.includes('contract') || lowerText.includes('conveyancing')) {
      category = "Legal";
    } else if (lowerText.includes('mortgage') || lowerText.includes('finance') || lowerText.includes('money') || lowerText.includes('cost') || lowerText.includes('budget')) {
      category = "Financial";
    } else if (lowerText.includes('survey') || lowerText.includes('inspection') || lowerText.includes('valuation') || lowerText.includes('property')) {
      category = "Property Assessment";
    } else if (lowerText.includes('buying') || lowerText.includes('purchase') || lowerText.includes('process') || lowerText.includes('step')) {
      category = "Buying Process";
    }

    // Determine priority based on content
    let priority = "normal";
    if (lowerText.includes('urgent') || lowerText.includes('important') || lowerText.includes('critical')) {
      priority = "high";
    } else if (lowerText.includes('optional') || lowerText.includes('additional')) {
      priority = "low";
    }

    // Determine source based on filename or content
    let source = "Manual Upload";
    if (filename.toLowerCase().includes('gov') || lowerText.includes('government')) {
      source = "Government";
    } else if (lowerText.includes('legal') || lowerText.includes('solicitor')) {
      source = "Legal Firm";
    } else if (lowerText.includes('bank') || lowerText.includes('financial')) {
      source = "Financial Institution";
    }

    // Generate tags based on content
    const tags = [];
    if (lowerText.includes('first-time') || lowerText.includes('first time')) tags.push('first-time-buyer');
    if (lowerText.includes('mortgage')) tags.push('mortgage');
    if (lowerText.includes('legal')) tags.push('legal');
    if (lowerText.includes('survey')) tags.push('survey');
    if (lowerText.includes('cost')) tags.push('costs');
    if (lowerText.includes('process')) tags.push('process');
    if (lowerText.includes('property')) tags.push('property');
    if (lowerText.includes('buying')) tags.push('buying');
    if (lowerText.includes('home')) tags.push('home');
    if (lowerText.includes('house')) tags.push('house');
    if (lowerText.includes('uk') || lowerText.includes('britain')) tags.push('uk');
    if (lowerText.includes('guide')) tags.push('guidance');
    if (lowerText.includes('step')) tags.push('process');
    
    // If no tags found, add some default ones
    if (tags.length === 0) {
      tags.push('general', 'homebuying');
    }

    // Generate title from filename or first sentence
    let title = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
    if (title.length > 50) {
      title = title.substring(0, 50) + "...";
    }

    // Generate summary
    const firstSentence = text.split('.')[0];
    const summary = firstSentence.length > 100 ? firstSentence.substring(0, 100) + "..." : firstSentence;

    const result = {
      success: true,
      title: title || "Document",
      category,
      priority,
      source,
      tags: tags.slice(0, 5), // Limit to 5 tags
      summary: summary || "Document content analysis"
    };
    
    console.log('Fallback metadata generated:', result);
    return result;
  }

  private static composeChatPrompt(question: string, context: string[]) {
    const trimmedQuestion = question.trim();
    const safeContext = Array.isArray(context)
      ? context
          .map((entry) => entry?.trim())
          .filter((entry): entry is string => Boolean(entry))
      : [];

    const contextSection = safeContext.length > 0
      ? `Sources:\n${safeContext.join('\n\n')}`
      : 'Sources:\n- None provided. Clearly state if evidence is missing.';

    const guidanceSection = `Guidelines:\n- Cite sources using bracketed numbers like [1] that match the provided sources.\n- If information is missing or uncertain, say so and recommend next steps.\n- Keep responses structured, practical, and focused on UK homebuying.\n- Offer optional follow-up suggestions when they help the user.`;

    const questionSection = `User question:\n${trimmedQuestion}`;

    return [guidanceSection, contextSection, questionSection].join('\n\n');
  }

  static async streamChatResponse(options: {
    question: string;
    context: string[];
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
    model?: string;
  }): Promise<StreamChatResponseHandle> {
    const {
      question,
      context,
      systemPrompt,
      temperature = DEFAULT_CHAT_TEMPERATURE,
      maxTokens = DEFAULT_MAX_COMPLETION_TOKENS,
      signal,
      model = DEFAULT_CHAT_MODEL,
    } = options;

    const userContent = this.composeChatPrompt(question, context);
    const effectiveSystemPrompt = await (async () => {
      if (typeof systemPrompt === 'string' && systemPrompt.trim().length > 0) {
        return systemPrompt;
      }
      try {
        return await loadSystemPrompt();
      } catch {
        return DEFAULT_CHAT_SYSTEM_PROMPT;
      }
    })();

    const approxPromptTokens = Math.ceil(effectiveSystemPrompt.length / 4) || 0;
    const effectiveMaxTokens = (() => {
      if (approxPromptTokens <= 2000) {
        return maxTokens;
      }

      const ratio = 2000 / approxPromptTokens;
      const adjusted = Math.max(200, Math.floor(maxTokens * ratio));
      if (adjusted < maxTokens) {
        console.warn(
          `[openai] Large system prompt (~${approxPromptTokens} tokens). Reducing max_output_tokens from ${maxTokens} to ${adjusted}.`,
        );
      }
      return adjusted;
    })();

    // GPT-5 Responses API: omit unsupported params like `temperature`
    const responseStream = await client.responses.stream(
      {
        model,
        input: [
          { role: 'system', content: [{ type: 'input_text', text: effectiveSystemPrompt }] },
          { role: 'user', content: [{ type: 'input_text', text: userContent }] },
        ],
        max_output_tokens: effectiveMaxTokens,
      },
      { signal },
    );

    const usage = (async () => {
      try {
        const finalResponse = await responseStream.finalResponse();
        const usageData = finalResponse?.usage;
        if (!usageData) {
          return null;
        }
        return {
          prompt_tokens: usageData.input_tokens,
          completion_tokens: usageData.output_tokens,
          total_tokens: usageData.total_tokens,
        };
      } catch (error) {
        throw error;
      }
    })();

    const stream = (async function* (): AsyncGenerator<string, void, unknown> {
      try {
        for await (const event of responseStream) {
          if (event.type === 'response.output_text.delta' && event.delta) {
            yield event.delta;
          }

          if (event.type === 'response.refusal.delta' && event.delta) {
            yield event.delta;
          }

          if (event.type === 'response.error') {
            const message = event.error?.message || 'OpenAI streaming error';
            const err = new Error(message);
            (err as Error & { cause?: unknown }).cause = event.error;
            throw err;
          }
        }
      } catch (error) {
        throw error;
      }
    })();

    return { stream, usage, model };
  }

  // Generate chatbot responses using RAG
  static async generateResponse(query: string, context: string[]) {
    try {
      const handle = await this.streamChatResponse({
        question: query,
        context,
      });

      let fullResponse = '';
      for await (const token of handle.stream) {
        fullResponse += token;
      }

      // Ensure usage promise settles to avoid unhandled rejections
      await handle.usage.catch(() => null);

      return {
        success: true,
        response: fullResponse,
      };
    } catch (error) {
      console.error('OpenAI response error:', error);
      return {
        success: false,
        error: 'Failed to generate response'
      };
    }
  }

  // Extract text from uploaded files
  static async extractTextFromFile(file: File): Promise<string> {
    // For now, handle text files
    // Later can be extended for PDF, Word, etc.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}
