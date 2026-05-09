import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../db.js";

export class ScraperService {
  static async scrapeInternshala() {
    try {
      const user = await prisma.user.findFirst();
      if (!user) throw new Error("No user found");

      // Fetch existing companies and URLs to prevent refetching
      const existingJobs = await prisma.jobPost.findMany({
        where: { userId: user.id },
        select: { companyName: true, jobUrl: true }
      });
      const existingCompanies = new Set(existingJobs.map(j => j.companyName));
      const existingUrls = new Set(existingJobs.map(j => j.jobUrl));

      const internships: any[] = [];
      let skippedCount = 0;
      let pageNum = 1;
      const MAX_PAGES = 3; // Scrape up to 3 pages to find new jobs

      while (pageNum <= MAX_PAGES && internships.length < 15) {
        console.log(`🌐 Scraping Internshala Page ${pageNum}...`);
        
        const { data } = await axios.get(`https://internshala.com/internships/software-development-internships/page-${pageNum}/`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          }
        });

        const $ = cheerio.load(data);
        const jobCards = $(".individual_internship");
        
        if (jobCards.length === 0) break; // No more jobs found

        jobCards.each((i, el) => {
          if (internships.length >= 20) return false;

          const title = $(el).find(".job-title-href").text().trim() || $(el).find(".heading_4_5").text().trim();
          const companyName = $(el).find(".company_name").text().trim() || $(el).find(".company_and_premium").text().trim();
          const location = $(el).find(".location_link").text().trim() || $(el).find(".locations").text().trim();
          const stipend = $(el).find(".stipend").text().trim();
          const href = $(el).find(".job-title-href").attr("href") || $(el).find(".heading_4_5 a").attr("href") || "";
          const url = href.startsWith("http") ? href : `https://internshala.com${href}`;

          // Skip if we already have this job URL
          if (existingUrls.has(url)) {
            skippedCount++;
            return true; 
          }

          const skillsRequired: string[] = [];
          const titleLower = title.toLowerCase();
          if (titleLower.includes("react")) skillsRequired.push("React");
          if (titleLower.includes("node")) skillsRequired.push("Node.js");
          if (titleLower.includes("python")) skillsRequired.push("Python");
          if (titleLower.includes("full stack")) skillsRequired.push("Fullstack");
          
          if (title && companyName) {
            internships.push({
              userId: user.id,
              platform: "internshala",
              title,
              companyName,
              location,
              stipend: stipend || "Unpaid",
              description: `Software development internship at ${companyName}`,
              skillsJson: skillsRequired,
              jobUrl: url,
              deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Default 15 days
            });
          }
        });

        pageNum++;
      }

      console.log(`✅ Scrape complete. Found ${internships.length} new jobs, skipped ${skippedCount} duplicates.`);

      // Save to database
      const savedJobs = [];
      for (const job of internships) {
        // Upsert to avoid duplicates
        const saved = await prisma.jobPost.upsert({
          where: { 
            userId_jobUrl: {
              userId: job.userId,
              jobUrl: job.jobUrl
            }
          },
          update: {
            title: job.title,
            companyName: job.companyName,
            location: job.location,
            stipend: job.stipend,
            deadline: job.deadline,
          },
          create: job,
        });
        savedJobs.push(saved);
      }

      return { savedJobs, skippedCount };
    } catch (error: any) {
      console.error("Scraper Error:", error.message);
      throw new Error(`Failed to scrape Internshala: ${error.message}`);
    }
  }
}
