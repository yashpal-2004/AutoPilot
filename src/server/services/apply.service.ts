import prisma from "@/lib/db/prisma";

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

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

      const pitch = this.GENERIC_PITCHES[roleCategory] || this.GENERIC_PITCHES["Software Engineer"];

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
      const coverLetterSelector = 'textarea[name="cover_letter"]';
      try {
        await page.waitForSelector(coverLetterSelector, { timeout: 5000 });
        // Clear existing text
        await page.evaluate((selector: string) => {
          (document.querySelector(selector) as HTMLTextAreaElement).value = '';
        }, coverLetterSelector);
        await page.type(coverLetterSelector, pitch, { delay: 10 });
      } catch (e) {
        console.log("No cover letter text area found, proceeding...");
      }

      // If we had external PDF uploads, we would handle file input here.
      // Currently assuming Internshala uses the user's primary profile.

      // 8. Submit Application
      try {
        const submitBtn = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
          return btns.find(b => {
            const text = (b.textContent || (b as HTMLInputElement).value || '').toLowerCase().trim();
            // We want to avoid matching other random elements, but the submit button usually just says "Submit"
            return text === 'submit' || text.includes('submit application');
          });
        });

        const isElement = await page.evaluate(el => el !== null, submitBtn);
        if (isElement) {
          // This actually executes the application submission!
          await submitBtn.asElement()?.click();
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for success network request
        } else {
          throw new Error("Submit button not found on the screen.");
        }
      } catch (e) {
        throw new Error("Failed to click the final Submit button. The application was NOT sent.");
      }
      // Update Database
      await prisma.application.create({
        data: {
          userId: job.userId,
          jobPostId: job.id,
          resumeId: resume?.id,
          status: "APPLIED",
          matchScore: 95,
          appliedAt: new Date(),
        }
      });

      return { success: true, roleCategory, usedResume: resume?.name, pitch };

    } catch (error: any) {
      console.error("Apply Error:", error);
      throw error;
    } finally {
      if (browser) {
        // Keeping it open for a few seconds so the user can see the result
        setTimeout(() => browser.close(), 5000); 
      }
    }
  }
}
