import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "@/lib/db/prisma";

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

      const { data } = await axios.get("https://internshala.com/internships/software-development-internships/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        }
      });

      const $ = cheerio.load(data);
      const internships: any[] = [];
      let skippedCount = 0;

      $(".individual_internship").each((i, el) => {
        // Stop after we have found enough new internships
        if (internships.length >= 20) return false;

        const title = $(el).find(".job-title-href").text().trim() || $(el).find(".heading_4_5").text().trim();
        const companyName = $(el).find(".company_name").text().trim() || $(el).find(".company_and_premium").text().trim();
        const location = $(el).find(".location_link").text().trim() || $(el).find(".locations").text().trim();
        const stipend = $(el).find(".stipend").text().trim();
        const jobId = $(el).attr("internshipid") || $(el).attr("jobid") || `is-${Date.now()}-${i}`;
        const href = $(el).find(".job-title-href").attr("href") || $(el).find(".heading_4_5 a").attr("href") || "";
        const url = href.startsWith("http") ? href : `https://internshala.com${href}`;

        // Skip if we already have this company or job URL
        if (existingCompanies.has(companyName) || existingUrls.has(url)) {
          skippedCount++;
          return true; // continue
        }

        // Basic skill extraction from title (just a mock for now until we scrape details)
        const skillsRequired: string[] = [];
        const titleLower = title.toLowerCase();
        if (titleLower.includes("react")) skillsRequired.push("React");
        if (titleLower.includes("node")) skillsRequired.push("Node.js");
        if (titleLower.includes("python")) skillsRequired.push("Python");
        if (titleLower.includes("data")) skillsRequired.push("Data Analysis");
        if (titleLower.includes("full stack") || titleLower.includes("full-stack")) {
          skillsRequired.push("React", "Node.js", "MongoDB", "Express");
        }
        
        // Extract explicit deadline if Internshala provides it in the DOM
        let explicitDeadlineText = $(el).find('#apply_by .item_body').text().trim() 
          || $(el).find('.apply_by .item_body').text().trim()
          || $(el).find('.expires, .deadline').text().trim();
          
        let explicitDeadline: Date | null = null;
        if (explicitDeadlineText && explicitDeadlineText.match(/\d{1,2}\s+[a-zA-Z]{3,}/)) {
          explicitDeadline = new Date(explicitDeadlineText);
          if (isNaN(explicitDeadline.getTime())) explicitDeadline = null;
        }

        // Parse the "Posted X days ago" text to calculate realistic deadline as fallback
        const detailRow = $(el).find('.detail-row-2').text().trim().replace(/\s+/g, ' ');
        let daysAgo = 0;
        if (detailRow.includes('Today') || detailRow.includes('Just now')) {
          daysAgo = 0;
        } else {
          const match = detailRow.match(/(\d+)\s+(day|week|month)s?\s+ago/i);
          if (match) {
            const num = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            if (unit === 'day') daysAgo = num;
            if (unit === 'week') daysAgo = num * 7;
            if (unit === 'month') daysAgo = num * 30;
          }
        }
        
        // Assume standard Internshala listings are valid for 15 days from posting
        const deadline = explicitDeadline || new Date();
        if (!explicitDeadline) {
          deadline.setDate(deadline.getDate() - daysAgo + 15);
        }

        if (title && companyName) {
          internships.push({
            userId: user.id,
            platform: "internshala",
            title,
            companyName,
            location,
            stipend: stipend || "Unpaid",
            description: "Software development internship scraped from Internshala.",
            skillsJson: skillsRequired,
            jobUrl: url,
            deadline,
          });
        }
      });

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
