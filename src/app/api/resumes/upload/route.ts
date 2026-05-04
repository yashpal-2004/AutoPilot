import { NextResponse } from "next/server";
import { ResumeService } from "@/server/services/resume.service";
import prisma from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Mock auth: Get the first user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const resume = await ResumeService.uploadAndParse(file, user.id);
    return NextResponse.json(resume, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
