// TEST ENDPOINT - No auth required
// DELETE THIS IN PRODUCTION

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { QUEUES } from '@/shared/constants';

export async function POST(req: NextRequest) {
  try {
    const intake = await req.json();

    console.log('[TEST] Starting test generation with:', intake);

    // Find admin user or first user
    let user = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: 'No users in database' }, { status: 400 });
    }

    // Create project
    const project = await prisma.clientProject.create({
      data: {
        userId: user.id,
        status: 'intake_complete',
        companyName: intake.companyName || 'Test Company',
        businessType: intake.businessType || 'Творческая студия',
        businessDescription: intake.businessDescription || '',
        targetAudience: intake.targetAudience || 'Все',
        competitors: intake.competitors ? JSON.stringify(intake.competitors) : null,
        siteGoals: intake.siteGoals ? JSON.stringify(intake.siteGoals) : '["Привлечение клиентов"]',
        designPreferences: intake.designPreferences || 'Современный',
        contactName: intake.contactName || 'Test',
        contactEmail: intake.contactEmail || user.email || 'test@test.kg',
        contactPhone: intake.contactPhone || '',
      },
    });

    console.log('[TEST] Created project:', project.id);

    // Connect to Redis and add to queue
    const redis = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });

    // Skip intake worker, go directly to researcher
    const researcherQueue = new Queue(QUEUES.RESEARCHER, { connection: redis });

    await researcherQueue.add(`research-${project.id}`, {
      projectId: project.id,
      intake: {
        companyName: project.companyName,
        businessType: project.businessType,
        businessDescription: project.businessDescription,
        targetAudience: project.targetAudience,
        competitors: project.competitors ? JSON.parse(project.competitors) : [],
        siteGoals: project.siteGoals ? JSON.parse(project.siteGoals) : [],
        designPreferences: project.designPreferences,
        contactName: project.contactName,
        contactEmail: project.contactEmail,
        contactPhone: project.contactPhone,
      },
    });

    console.log('[TEST] Added to researcher queue');

    // Close redis connection
    await redis.quit();

    return NextResponse.json({
      success: true,
      projectId: project.id,
      message: 'Pipeline started! Check worker logs.',
    });

  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT endpoint to manually approve a project
export async function PUT(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('id');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }

  const project = await prisma.clientProject.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Get plan data
  const planData = project.planData ? JSON.parse(project.planData) : null;

  if (!planData) {
    return NextResponse.json({ error: 'No plan data found' }, { status: 400 });
  }

  // Update to approved
  await prisma.clientProject.update({
    where: { id: projectId },
    data: {
      clientApproved: true,
      approvedAt: new Date(),
      status: 'approved',
    },
  });

  // Add to generator queue
  const redis = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  });

  const generatorQueue = new Queue(QUEUES.GENERATOR, { connection: redis });

  const intake = {
    companyName: project.companyName,
    businessType: project.businessType,
    businessDescription: project.businessDescription,
    targetAudience: project.targetAudience,
    competitors: project.competitors ? JSON.parse(project.competitors) : [],
    siteGoals: project.siteGoals ? JSON.parse(project.siteGoals) : [],
    designPreferences: project.designPreferences,
    contactName: project.contactName,
    contactEmail: project.contactEmail,
    contactPhone: project.contactPhone,
  };

  await generatorQueue.add(`generate-${projectId}`, {
    projectId,
    intake,
    plan: planData,
  });

  await redis.quit();

  return NextResponse.json({
    success: true,
    message: 'Project approved and sent to generator',
  });
}

// GET endpoint to check project status
export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('id');

  if (!projectId) {
    // List recent projects
    const projects = await prisma.clientProject.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        companyName: true,
        deployedUrl: true,
        createdAt: true,
        lastError: true,
        failedModule: true,
      },
    });

    return NextResponse.json({ projects });
  }

  const project = await prisma.clientProject.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project });
}
