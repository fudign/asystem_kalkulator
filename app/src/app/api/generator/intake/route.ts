// API Route: POST /api/generator/intake
// Creates a new project and starts the generation pipeline

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { validateIntake, type IntakeData } from '@/modules/intake/validation';
import { QUEUES } from '@/shared/constants';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const intake: IntakeData = await req.json();

    // Validate intake data
    const validation = validateIntake(intake);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Create project in database
    const project = await prisma.clientProject.create({
      data: {
        userId,
        status: 'intake_pending',

        // Store intake data
        companyName: intake.companyName,
        businessType: intake.businessType,
        businessDescription: intake.businessDescription,
        targetAudience: intake.targetAudience,
        competitors: intake.competitors ? JSON.stringify(intake.competitors) : null,
        siteGoals: intake.siteGoals ? JSON.stringify(intake.siteGoals) : null,
        designPreferences: intake.designPreferences,
        additionalNotes: intake.additionalNotes,
        contactName: intake.contactName,
        contactEmail: intake.contactEmail,
        contactPhone: intake.contactPhone,
      },
    });

    // Add to intake queue
    const redis = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });

    const intakeQueue = new Queue(QUEUES.INTAKE, { connection: redis });

    await intakeQueue.add(`intake-${project.id}`, {
      projectId: project.id,
      intake,
    });

    console.log(`[API] Created project ${project.id} and added to intake queue`);

    return NextResponse.json({
      projectId: project.id,
      status: 'intake_pending',
      message: 'Проект создан! Начинаем анализ...',
    });

  } catch (error) {
    console.error('[API] Intake error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
