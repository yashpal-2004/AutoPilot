import { NextResponse } from "next/server";
import { ScraperService } from "@/server/services/scraper.service";

export async function POST(req: Request) {
  try {
    const { savedJobs, skippedCount } = await ScraperService.scrapeInternshala();
    return NextResponse.json({ success: true, count: savedJobs.length, skippedCount, jobs: savedJobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
