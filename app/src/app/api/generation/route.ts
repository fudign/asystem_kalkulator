import { NextRequest, NextResponse } from 'next/server';
import { addGenerationJob, getJobStatus, cancelJob } from '@/server/queue';
import { projectContextSchema } from '@/schemas/context.schema';
import { z } from 'zod';

// Request body schema
const startGenerationSchema = z.object({
  sessionId: z.string().min(1),
  context: z.object({
    projectName: z.string().optional(),
    businessType: z.string().optional(),
    businessDescription: z.string().optional(),
    targetAudience: z.string().optional(),
    mainFeatures: z.array(z.string()).default([]),
    budget: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
    designPreferences: z.string().optional(),
    integrations: z.array(z.string()).default([]),
    timeline: z.string().optional(),
  }),
  selectedServices: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })),
});

// POST /api/generation - Start new generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = startGenerationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { sessionId, context, selectedServices } = validationResult.data;

    // Add job to queue
    const job = await addGenerationJob({
      sessionId,
      context,
      selectedServices,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Generation started',
    });
  } catch (error) {
    console.error('[API] Error starting generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/generation?jobId=xxx - Get job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    const status = await getJobStatus(jobId);

    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Map BullMQ state to our GenerationStatus state
    const stateMap: Record<string, string> = {
      waiting: 'queued',
      active: 'processing',
      completed: 'completed',
      failed: 'failed',
      delayed: 'queued',
    };

    return NextResponse.json({
      jobId,
      state: stateMap[status.state] || status.state,
      progress: status.progress,
      result: status.result,
      error: status.failedReason,
    });
  } catch (error) {
    console.error('[API] Error getting job status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/generation?jobId=xxx - Cancel job
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    const cancelled = await cancelJob(jobId);

    if (!cancelled) {
      return NextResponse.json(
        { error: 'Job not found or cannot be cancelled' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancelled',
    });
  } catch (error) {
    console.error('[API] Error cancelling job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
