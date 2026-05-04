import { NextResponse } from "next/server";
import { ResumeService } from "@/server/services/resume.service";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const resumes = await ResumeService.getResumes(user.id);
    return NextResponse.json(resumes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
