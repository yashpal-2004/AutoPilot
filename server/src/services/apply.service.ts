import prisma from "../db.js";
import { TelegramService } from "./telegram.service.js";
import { AiService } from "./ai.service.js";

import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const puppeteer = puppeteerExtra as any;

// Add stealth plugin to avoid Internshala bot detection and invisible Captcha blocks
puppeteer.use(StealthPlugin());

export class ApplyService {
  private static readonly GENERIC_PITCHES: Record<string, string> = {
    "Frontend Developer": "I am a skilled Frontend Developer with strong expertise in React, Next.js, and modern CSS frameworks like Tailwind. I have a keen eye for design and performance. My ability to build responsive, accessible, and fast web applications makes me an excellent fit for this role.",
    "Fullstack Developer": "I am a Fullstack Developer proficient in building scalable applications from the database to the UI. I have hands-on experience with Node.js, Express, databases like Postgres/MongoDB, and React. I am comfortable handling end-to-end features independently.",
    "Backend Developer": "I am a Backend Developer focused on building robust, scalable APIs and microservices. I excel in database design, performance tuning, and writing clean, maintainable server-side code.",
    "Data Scientist": "I am highly analytical and proficient in Python, SQL, and data visualization. I have practical experience building data pipelines, analyzing complex datasets, and presenting actionable insights.",
    "Software Engineer": "I am a passionate Software Engineer with a solid foundation in algorithms, data structures, and clean coding practices. I am a quick learner and thrive in collaborative, fast-paced environments."
  };

  static async applyToJob(jobId: string) {
    let browser: any = null;
    try {
      const email = process.env.INTERNSHALA_EMAIL;
      const password = process.env.INTERNSHALA_PASSWORD;

      if (!email || !password) {
        throw new Error("Internshala credentials not found in .env file");
      }

      const job = await prisma.jobPost.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new Error("Job not found");
      }

      // 1. Determine the Role Category based on job title
      const title = job.title.toLowerCase();
      let roleCategory = "Software Engineer";
      if (title.includes("frontend") || title.includes("react")) roleCategory = "Frontend Developer";
      else if (title.includes("full stack") || title.includes("fullstack")) roleCategory = "Fullstack Developer";
      else if (title.includes("backend") || title.includes("node")) roleCategory = "Backend Developer";
      else if (title.includes("data") || title.includes("analyst")) roleCategory = "Data Scientist";

      // 2. Select the matching resume from the database
      const resume = await prisma.resume.findFirst({
        where: { 
          userId: job.userId,
          roleCategory: roleCategory,
          isActive: true
        }
      }) || await prisma.resume.findFirst({
        where: { userId: job.userId, isDefault: true } // Fallback to default
      });

      // Phase 9: Generate AI Tailored Pitch
      let pitch = this.GENERIC_PITCHES[roleCategory] || this.GENERIC_PITCHES["Software Engineer"];
      
      if (resume?.parsedText) {
        console.log(`🤖 Generating AI tailored pitch for ${job.companyName}...`);
        const aiPitch = await AiService.generateCoverLetter(
          job.title,
          job.description || "",
          resume.parsedText,
          job.companyName
        );
        if (aiPitch) pitch = aiPitch;
      }

      // 3. Launch Puppeteer with Persistent Session and REAL Google Chrome
      browser = await puppeteer.launch({
        headless: false, // Visible for demo
        defaultViewport: null,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Uses your real Chrome
        userDataDir: './.internshala_session', // Saves cookies and login state permanently!
        ignoreDefaultArgs: ['--enable-automation'],
        args: [
          '--start-maximized',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars'
        ]
      });

      const page = await browser.newPage();

      // Mask user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // 4. Check Login State / Manual Login Fallback
      await page.goto('https://internshala.com', { waitUntil: 'domcontentloaded' });
      
      try {
        // Look for the user profile container to see if we are already logged in
        await page.waitForSelector('.profile_container', { timeout: 5000 });
        console.log("Already logged in via saved session!");
      } catch (e) {
        console.log("Not logged in. Redirecting to login page...");
        await page.goto('https://internshala.com/login/user', { waitUntil: 'domcontentloaded' });
        
        // Let the script type the credentials, but if captcha blocks it, give the user 60 seconds to solve it manually!
        await page.type('#email', email, { delay: 100 });
        await page.type('#password', password, { delay: 100 });
        await page.click('#login_submit');

        console.log("Waiting up to 60 seconds for successful login (Solve captcha if needed)...");
        // Wait until the user successfully logs in and the profile container appears
        await page.waitForSelector('.profile_container', { timeout: 60000 });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 5. Go to the Job URL
      await page.goto(job.jobUrl, { waitUntil: 'domcontentloaded' });

      // 5.5 Check if already applied (Manual check)
      const isAlreadyApplied = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return text.includes("you have already applied") || 
               text.includes("applied on") || 
               document.querySelector('.applied_status') !== null;
      });

      if (isAlreadyApplied) {
        console.log(`ℹ️ Already applied to ${job.companyName}. Syncing database...`);
        await prisma.application.upsert({
          where: { jobPostId_userId: { jobPostId: job.id, userId: job.userId } },
          update: { status: "APPLIED" },
          create: {
            jobPostId: job.id,
            userId: job.userId,
            matchScore: 0,
            status: "APPLIED",
            appliedAt: new Date()
          }
        });
        return { success: true, skipped: true, reason: "Already applied" };
      }

      // 6. Click Apply Now
      const applyButtonSelector = '.apply_now_btn, .top_apply_now_cta, #easy_apply_button';
      try {
        await page.waitForSelector(applyButtonSelector, { timeout: 5000 });
        await page.click(applyButtonSelector);
      } catch (e) {
        throw new Error("Apply button not found. You might have already applied, or the job is closed.");
      }

      // 6.5 Check for Eligibility Blocks and Click 'Proceed' if available
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for modal to load

      const pageText = await page.evaluate(() => document.body.innerText);
      if (pageText.includes("not eligible") || pageText.includes("As your Internshala resume lists")) {
        throw new Error("Internshala blocked this application: You are not eligible (Location or Profile mismatch).");
      }

      const proceedButtonSelector = '#continue_button, .education_incomplete_proceed';
      try {
        // If the 'Proceed to Application' button exists on the resume review screen, click it
        const proceedBtn = await page.$(proceedButtonSelector);
        if (proceedBtn) {
          await proceedBtn.click();
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for cover letter page
        }
      } catch (e) {
        console.log("No intermediate proceed button found.");
      }

      // 7. Fill the Cover Letter
      // Note: Internshala's form structure varies. Often it's a textarea inside a modal.
      const coverLetterSelectors = [
        'textarea[name="cover_letter"]',
        '#cover_letter',
        '.cover_letter_textarea',
        'textarea' // Last resort: find any textarea if we are on the cover letter page
      ];
      
      let coverLetterFound = false;
      for (const selector of coverLetterSelectors) {
        try {
          const textarea = await page.$(selector);
          if (textarea) {
            // Clear existing text
            await page.evaluate((sel: string) => {
              const el = document.querySelector(sel) as HTMLTextAreaElement;
              if (el) el.value = '';
            }, selector);
            await page.type(selector, pitch, { delay: 10 });
            coverLetterFound = true;
            console.log("✅ Cover letter filled.");
            break;
          }
        } catch (e) {}
      }

      if (!coverLetterFound) {
        console.log("⚠️ No cover letter text area found, checking for assessment questions...");
      }

      // 7.5 Smart Question Answering (Phase 9)
      if (resume?.parsedText) {
        try {
          console.log("🧐 Searching for additional questions...");
          const questions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.form-group, .question_container, .assessment_question'));
            return elements.map(el => {
              const label = el.querySelector('label, .control-label, .question_text, .assessment_question_text');
              const textarea = el.querySelector('textarea:not([name="cover_letter"])');
              if (label && textarea) {
                return {
                  id: textarea.getAttribute('id') || textarea.getAttribute('name'),
                  text: label.textContent?.trim() || ""
                };
              }
              return null;
            }).filter(q => q && q.text.length > 5);
          });

          for (const q of questions) {
            if (q && q.id) {
              console.log(`📝 Answering: "${q.text.substring(0, 50)}..."`);
              const answer = await AiService.answerQuestion(q.text, job.title, resume.parsedText);
              if (answer) {
                await page.type(`[id="${q.id}"], [name="${q.id}"]`, answer, { delay: 10 });
              }
            }
          }
        } catch (e) {
          console.log("Error answering additional questions:", e);
        }
      }

      // 8. Submit Application
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const submitBtn = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll('button, input[type="submit"], #submit, .submit_button'));
          return btns.find(b => {
            const text = (b.textContent || (b as HTMLInputElement).value || '').toLowerCase().trim();
            return text === 'submit' || text === 'submit application' || text.includes('apply now');
          });
        });

        const isElement = await page.evaluate((el:any) => el !== null, submitBtn);
        if (isElement) {
          console.log("🚀 Clicking final Submit button...");
          // Use JavaScript click which is more reliable for these buttons
          await page.evaluate((el: any) => {
            el.scrollIntoView();
            el.click();
          }, submitBtn);
          
          // Wait for the URL to change or a success message to appear
          await new Promise(resolve => setTimeout(resolve, 4000)); 
        } else {
          throw new Error("Submit button not found on the screen.");
        }
      } catch (e) {
        throw new Error(`Failed to click the final Submit button. ${e.message}`);
      }
      
      // Calculate score for the alert
      const { ScoringService } = await import("./scoring.service.js");
      const userPrefs = await prisma.userPreferences.findFirst({ where: { userId: job.userId } });
      const userResumes = await prisma.resume.findMany({ where: { userId: job.userId } });
      const scoring = await ScoringService.calculateScore(job, userPrefs!, userResumes);

      // Update Database
      await prisma.application.create({
        data: {
          jobPostId: job.id,
          userId: job.userId,
          matchScore: scoring.score,
          resumeId: resume?.id,
          status: "APPLIED",
          appliedAt: new Date()
        }
      });

      // Phase 8: Send Telegram Alert
      await TelegramService.sendApplicationAlert({
        company: job.companyName || "Unknown",
        role: job.title,
        score: scoring.score,
        resume: resume?.name || "Default",
        status: "Applied Successfully"
      });

      return { success: true, roleCategory, usedResume: resume?.name, pitch };

    } catch (error: any) {
      console.error("Apply Error:", error);
      
      // Phase 8: Send Error Alert
      if (error.message.includes("Login") || error.message.includes("Captcha")) {
        await TelegramService.sendErrorAlert(
          "CAPTCHA or Login Required",
          "Open your dashboard and manually complete the login in the Chromium window."
        );
      }
      
      throw error;
    } finally {
      if (browser) {
        // Keeping it open for a few seconds so the user can see the result
        setTimeout(() => browser.close(), 5000); 
      }
    }
  }
}
