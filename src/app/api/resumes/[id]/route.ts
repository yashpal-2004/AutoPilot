import { NextResponse } from "next/server";
import { ResumeService } from "@/server/services/resume.service";
import prisma from "@/lib/db/prisma";
import stringSimilarity from "string-similarity";
import { TECH_SKILLS } from "@/lib/constants/tech-skills";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await req.json();
    if (body.isDefault) {
      await ResumeService.setDefaultResume(user.id, params.id);
    }
    
    // Update other fields if provided
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.roleCategory) updateData.roleCategory = body.roleCategory;
    
    if (body.skillsJson && Array.isArray(body.skillsJson)) {
      // Auto-correct spelling against TECH_SKILLS
      const correctedSkills = body.skillsJson.map((skill: string) => {
        // Find best match in TECH_SKILLS
        const matches = stringSimilarity.findBestMatch(skill, TECH_SKILLS);
        const bestMatch = matches.bestMatch;
        // If similarity is above a threshold (e.g., 0.5 for misspellings like Reactt -> React)
        if (bestMatch.rating > 0.5 && bestMatch.rating < 1) {
          return bestMatch.target;
        }
        return skill; // Return original if it perfectly matches or is completely unrecognizable
      });
      // De-duplicate just in case
      updateData.skillsJson = Array.from(new Set(correctedSkills));
    }

    if (Object.keys(updateData).length > 0) {
      await ResumeService.updateResume(user.id, params.id, updateData);
    }

    return NextResponse.json({ success: true, correctedSkills: updateData.skillsJson });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    await ResumeService.deleteResume(user.id, params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
