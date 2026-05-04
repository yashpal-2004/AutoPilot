import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: "No user" }, { status: 401 });

    // Find 3 jobs and set their deadline to 3 days ago
    const jobs = await prisma.jobPost.findMany({ take: 3 });
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    for (const job of jobs) {
      await prisma.jobPost.update({
        where: { id: job.id },
        data: { deadline: pastDate }
      });
    }

    return NextResponse.json({ success: true, count: jobs.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
