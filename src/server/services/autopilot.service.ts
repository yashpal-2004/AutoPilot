import prisma from "@/lib/db/prisma";
import { ScraperService } from "./scraper.service";
import { ScoringService } from "./scoring.service";
import { ApplyService } from "./apply.service";
import { TelegramService } from "./telegram.service";

export class AutoPilotService {
  private static isRunning = false;

  static async runCycle() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log("🚀 Starting AutoPilot Autonomous Cycle...");
    
    try {
      const user = await prisma.user.findFirst({
        include: { preferences: true, resumes: true }
      });

      if (!user || !user.preferences || !user.preferences.autopilotEnabled) {
        console.log("⚠️ AutoPilot disabled or user not configured.");
        return;
      }

      // 1. Scrape New Jobs
      console.log("🔍 Scanning for new opportunities...");
      const scrapedResult = await ScraperService.scrapeInternshala();
      
      // 2. Fetch all jobs from the latest session that aren't applied yet
      const latestJobs = await prisma.jobPost.findMany({
        where: { 
          userId: user.id,
          createdAt: { gte: new Date(Date.now() - 30 * 60000) } // Last 30 mins
        }
      });

      let appliedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const topApps: any[] = [];

      // 3. Process each job
      for (const job of latestJobs) {
        // Check if already applied
        const alreadyApplied = await prisma.application.findFirst({
          where: { jobPostId: job.id }
        });
        if (alreadyApplied) continue;

        // Score the job
        const scoring = await ScoringService.calculateScore(job, user.preferences, user.resumes);
        
        if (scoring.shouldSkip) {
          skippedCount++;
          continue;
        }

        // Apply if score is high enough (e.g. > 85)
        if (scoring.score >= user.preferences.minMatchScore) {
          console.log(`🎯 High score match (${scoring.score}%): Applying to ${job.companyName}...`);
          
          try {
            const applyResult = await ApplyService.applyToJob(job.id);
            if (applyResult.success) {
              appliedCount++;
              topApps.push({ role: job.title, company: job.companyName, score: scoring.score });
            } else {
              errorCount++;
            }
          } catch (e) {
            console.error(`❌ Failed to apply to ${job.companyName}:`, e);
            errorCount++;
          }
        } else {
          skippedCount++;
        }
      }

      // 4. Send Summary to Telegram
      if (appliedCount > 0 || errorCount > 0) {
        await TelegramService.sendDailySummary({
          target: latestJobs.length,
          applied: appliedCount,
          skipped: skippedCount,
          errors: errorCount,
          replies: 0,
          topApps: topApps.slice(0, 3)
        });
      }

      console.log(`✅ AutoPilot Cycle Complete. Applied: ${appliedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error("❌ AutoPilot Cycle Failed:", error);
      await TelegramService.sendErrorAlert("AutoPilot Cycle Failed", "Check server logs for details.");
    } finally {
      this.isRunning = false;
    }
  }

  static startScheduler() {
    // Run every 6 hours
    const INTERVAL = 6 * 60 * 60 * 1000;
    
    console.log("⏰ AutoPilot Scheduler initialized (6-hour interval).");
    
    // Initial run after a short delay
    setTimeout(() => this.runCycle(), 10000);
    
    setInterval(() => {
      this.runCycle();
    }, INTERVAL);
  }
}
