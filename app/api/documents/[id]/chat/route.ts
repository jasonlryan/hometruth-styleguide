import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai';
import { SURVEY_REPORT_FULL_TEXT, SURVEY_REPORT_CONTENT } from '@/lib/documents/survey-report-content';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if this is the survey report document
    const isSurveyReport = documentId === "survey-report-2022" || documentId === SURVEY_REPORT_CONTENT.id;
    
    if (!isSurveyReport) {
      console.log(`Document chat requested for ID: ${documentId}, but only survey-report-2022 is supported`);
      return NextResponse.json(
        { error: 'Document not found or not supported for chat' },
        { status: 404 }
      );
    }

    // Use the survey report content
    const documentContext = SURVEY_REPORT_FULL_TEXT;
    
    // Log for debugging
    console.log(`Document chat for survey report. Content length: ${documentContext.length} characters`);
    
    const documentMetadata = `
Property: ${SURVEY_REPORT_CONTENT.propertyAddress}
Survey Date: ${SURVEY_REPORT_CONTENT.surveyDate}
Surveyor: ${SURVEY_REPORT_CONTENT.surveyor}
Survey Type: ${SURVEY_REPORT_CONTENT.surveyType}
Property Value: £${SURVEY_REPORT_CONTENT.propertyValue.toLocaleString()}
Property Type: ${SURVEY_REPORT_CONTENT.propertyType}
Total Pages: ${SURVEY_REPORT_CONTENT.pages.length}
`;

    const systemPrompt = `You are an AI assistant helping users understand their property survey report. 
You have access to the COMPLETE survey report content below. You MUST answer questions based ONLY on the information provided in this document. 
Cite specific pages and sections when relevant. Be helpful, clear, and concise.

IMPORTANT: 
- Answer questions based on the survey report content provided
- Reference specific pages when mentioning information (e.g., "According to Page 4: Structural Assessment...")
- If asked about costs or recommendations, provide the specific amounts and priorities mentioned in the report
- If information is not in the report, say so clearly
- Use the exact details from the report (dates, costs, measurements, etc.)
- ALWAYS format your responses using proper Markdown:
  * Use **bold** for section headings and important terms
  * Use numbered lists (1., 2., 3.) for sequential items - each item on a new line
  * Use bullet points (- or *) for sub-items - each bullet on a new line with proper indentation
  * Use proper line breaks (double newline) between sections
  * Use [Page X] format for page references
  * For nested lists, indent sub-items with 2 spaces
  * Ensure all list items start on a new line with proper spacing`;

    const userPrompt = `You are answering questions about a property survey report. Here is the complete report:

=== SURVEY REPORT METADATA ===
${documentMetadata}

=== COMPLETE SURVEY REPORT CONTENT ===
${documentContext}

=== USER QUESTION ===
${message}

Please answer the user's question based EXCLUSIVELY on the survey report content provided above. Reference specific pages and sections when providing information. If the information is not in the report, clearly state that.`;

    const handle = await OpenAIService.streamChatResponse({
      question: userPrompt,
      context: [], // Document context is in the prompt
      systemPrompt,
      signal: request.signal,
    });

    // Return streaming response matching the format from /api/chat
    const encoder = new TextEncoder();
    
    function createEventPayload(event: string, payload: unknown) {
      const dataString = JSON.stringify(payload ?? null);
      return `event: ${event}\ndata: ${dataString}\n\n`;
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: string, payload: unknown) => {
          controller.enqueue(encoder.encode(createEventPayload(event, payload)));
        };

        try {
          // Send sources event (empty for now, can be enhanced with document sections)
          send('sources', []);

          // Stream tokens
          for await (const token of handle.stream) {
            send('token', token);
          }

          // Send done event
          send('done', {});
        } catch (error) {
          send('error', { message: 'Failed to process request' });
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Document chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

