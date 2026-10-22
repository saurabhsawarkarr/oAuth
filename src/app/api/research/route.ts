import { NextRequest, NextResponse } from 'next/server';
import { executeOAuthResearchPipeline } from '@/lib/orchestrator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = (body.query || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'App name or website query is required.' }, { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await executeOAuthResearchPipeline(query, (event) => {
            const chunk = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const errorEvent = {
            jobId: 'error',
            stage: 'error',
            stageIndex: 7,
            message: `Research pipeline failed: ${errMsg}`,
            error: errMsg,
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
