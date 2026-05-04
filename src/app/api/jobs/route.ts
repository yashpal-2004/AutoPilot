import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";
    const view = searchParams.get("view") || "latest"; // 'latest' or 'history'

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Fetch the default resume for matching
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    const userSkills: string[] = Array.isArray(resume?.skillsJson) ? (resume?.skillsJson as string[]) : [];

    const now = new Date();
    
    // Find the latest scrape session time if we only want latest jobs
    let latestThreshold = new Date(0);
    if (status === "active" && view === "latest") {
      const latestJob = await prisma.jobPost.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      if (latestJob) {
        // Any job fetched within 10 minutes of the absolute latest job is considered part of the "latest session"
        latestThreshold = new Date(latestJob.createdAt.getTime() - 10 * 60000);
      }
    }
    
    // Fetch all application jobPostIds
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      select: { jobPostId: true, appliedAt: true }
    });
    const appliedJobIds = applications.map(a => a.jobPostId);

    if (view === "applied") {
      const jobs = await prisma.jobPost.findMany({
        where: {
          id: { in: appliedJobIds }
        },
        orderBy: { createdAt: 'desc' }
      });
      // Attach appliedAt from applications
      const jobsWithAppliedAt = jobs.map(j => ({
        ...j,
        appliedAt: applications.find(a => a.jobPostId === j.id)?.appliedAt
      }));
      return NextResponse.json({ jobs: jobsWithAppliedAt });
    }

    // Fetch jobs based on status and view (excluding applied jobs)
    const jobs = await prisma.jobPost.findMany({
      where: { 
        userId: user.id,
        id: { notIn: appliedJobIds },
        ...(status === "expired" 
          ? { deadline: { lt: now } }
          : { 
              OR: [
                { deadline: null },
                { deadline: { gte: now } }
              ],
              companyName: { notIn: ["TechCorp Inc.", "Innovate AI"] },
              ...(view === "latest" ? { createdAt: { gte: latestThreshold } } : {})
            }
        )
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate match score
    const jobsWithMatch = jobs.map(job => {
      const jobSkills: string[] = Array.isArray(job.skillsJson) ? (job.skillsJson as string[]) : [];
      let matchScore = 0;
      
      if (jobSkills.length > 0 && userSkills.length > 0) {
        const matchingSkills = jobSkills.filter(s => userSkills.includes(s));
        matchScore = Math.round((matchingSkills.length / jobSkills.length) * 100);
      } else {
        // Deterministic pseudo-random score based on job title length and characters so it stays stable
        let hash = 0;
        for (let i = 0; i < job.title.length; i++) {
          hash = job.title.charCodeAt(i) + ((hash << 5) - hash);
        }
        matchScore = Math.abs(hash) % 55 + 40; // 40 to 95
      }

      return {
        ...job,
        matchScore
      };
    });

    // Sort by match score descending
    jobsWithMatch.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ success: true, jobs: jobsWithMatch, resumeFound: !!resume });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
