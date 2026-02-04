import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/server/queue';
import { forwardAnswerToWorker } from '@/server/socket';
import { z } from 'zod';

// Request body schema
const answerSchema = z.object({
  jobId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

// POST /api/generation/answer - Submit answer to BMAD question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = answerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { jobId, questionId, answer } = validationResult.data;

    // Get the job
    const job = await getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check job state
    const state = await job.getState();
    if (state !== 'active' && state !== 'waiting') {
      return NextResponse.json(
        { error: 'Job is not active' },
        { status: 400 }
      );
    }

    // Update job data with the answer
    const currentData = job.data as any;
    await job.updateData({
      ...currentData,
      answers: {
        ...(currentData.answers || {}),
        [questionId]: answer,
      },
      lastAnswerAt: new Date().toISOString(),
    });

    // Forward answer to worker via Socket.IO
    const forwarded = forwardAnswerToWorker(jobId, questionId, answer);

    return NextResponse.json({
      success: true,
      message: forwarded ? 'Answer submitted and forwarded to worker' : 'Answer submitted (worker not connected)',
    });
  } catch (error) {
    console.error('[API] Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
