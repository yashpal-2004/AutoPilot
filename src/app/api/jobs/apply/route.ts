import { NextResponse } from "next/server";
import { ApplyService } from "@/server/services/apply.service";

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const result = await ApplyService.applyToJob(jobId);
    
    return NextResponse.json({ 
      success: true, 
      message: "Application submitted successfully",
      details: result
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
