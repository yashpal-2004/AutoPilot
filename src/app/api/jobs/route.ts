import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { ScoringService } from "@/server/services/scoring.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";
    const view = searchParams.get("view") || "latest"; // 'latest' or 'history'

    const user = await prisma.user.findFirst({
      include: { preferences: true, resumes: true }
    });

    if (!user || !user.preferences) {
      return NextResponse.json({ error: "User or preferences not found" }, { status: 401 });
    }

    const now = new Date();
    
    // Find the latest scrape session time if we only want latest jobs
    let latestThreshold = new Date(0);
    if (status === "active" && view === "latest") {
      const latestJob = await prisma.jobPost.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      if (latestJob) {
        latestThreshold = new Date(latestJob.createdAt.getTime() - 10 * 60000);
      }
    }
    
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      select: { jobPostId: true, appliedAt: true }
    });
    const appliedJobIds = applications.map(a => a.jobPostId);

    if (view === "applied") {
      const jobs = await prisma.jobPost.findMany({
        where: { id: { in: appliedJobIds } },
        orderBy: { createdAt: 'desc' }
      });
      const jobsWithAppliedAt = jobs.map(j => ({
        ...j,
        appliedAt: applications.find(a => a.jobPostId === j.id)?.appliedAt
      }));
      return NextResponse.json({ success: true, jobs: jobsWithAppliedAt });
    }

    const rawJobs = await prisma.jobPost.findMany({
      where: { 
        userId: user.id,
        id: { notIn: appliedJobIds },
        ...(status === "expired" 
          ? { deadline: { lt: now } }
          : { 
              OR: [{ deadline: null }, { deadline: { gte: now } }],
              ...(view === "latest" ? { createdAt: { gte: latestThreshold } } : {})
            }
        )
      },
      orderBy: { createdAt: 'desc' }
    });

    // Apply Intelligent Scoring
    const scoredJobs = await Promise.all(rawJobs.map(async (job) => {
      const scoring = await ScoringService.calculateScore(job, user.preferences!, user.resumes);
      return {
        ...job,
        matchScore: scoring.score,
        reasons: scoring.reasons,
        risks: scoring.risks,
        recommendedResumeId: scoring.recommendedResumeId,
        shouldSkip: scoring.shouldSkip,
        skipReason: scoring.skipReason
      };
    }));

    // Filter out low-quality jobs for 'latest' view
    const filteredJobs = view === "latest" 
      ? scoredJobs.filter(j => !j.shouldSkip)
      : scoredJobs;

    // Sort by match score
    filteredJobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ 
      success: true, 
      jobs: filteredJobs, 
      meta: {
        totalFound: rawJobs.length,
        skipped: rawJobs.length - filteredJobs.length
      }
    });
  } catch (error: any) {
    console.error("Jobs API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
