import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Save or update client project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await req.json();

    // Find existing project or create new
    const existingProject = await prisma.clientProject.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    let project;
    if (existingProject && !data.forceNew) {
      // Update existing
      project = await prisma.clientProject.update({
        where: { id: existingProject.id },
        data: {
          companyName: data.projectName ?? existingProject.companyName,
          businessType: data.businessType ?? existingProject.businessType,
          targetAudience: data.targetAudience ?? existingProject.targetAudience,
          // Note: mainFeatures, budget, timeline, aiSummary, services, totalPrice stored in planData JSON
          planData: data.planData ?? existingProject.planData,
          kpPdfUrl: data.pdfUrl ?? existingProject.kpPdfUrl,
          deployedUrl: data.demoUrl ?? existingProject.deployedUrl,
        },
      });
    } else {
      // Create new
      project = await prisma.clientProject.create({
        data: {
          userId,
          companyName: data.projectName,
          businessType: data.businessType,
          targetAudience: data.targetAudience,
          // Note: mainFeatures, budget, timeline, aiSummary, services, totalPrice stored in planData JSON
          planData: data.planData,
          kpPdfUrl: data.pdfUrl,
          deployedUrl: data.demoUrl,
        },
      });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Project save error:', error);
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    );
  }
}
