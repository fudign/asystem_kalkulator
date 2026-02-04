// API endpoint to check project generation status
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectId = req.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }

    // Get project from database
    const project = await prisma.clientProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        status: true,
        companyName: true,
        deployedUrl: true,
        previewUrl: true,
        kpPdfUrl: true,
        presentationPdfUrl: true,
        lastError: true,
        failedModule: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify user owns this project
    const fullProject = await prisma.clientProject.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (fullProject?.userId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('[STATUS API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
