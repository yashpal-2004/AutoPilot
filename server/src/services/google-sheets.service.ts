import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import prisma from '../db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export class GoogleSheetsService {
  private static doc: GoogleSpreadsheet | null = null;

  private static async init() {
    if (this.doc) return;

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!email || !key || !sheetId) {
      console.warn("⚠️ Google Sheets credentials missing in .env. Skipping sync.");
      return;
    }

    const auth = new JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.doc = new GoogleSpreadsheet(sheetId, auth);
    await this.doc.loadInfo();
  }

  static async logApplication(data: {
    date: string;
    company: string;
    role: string;
    stipend: string;
    matchScore: number;
    status: string;
    link: string;
  }) {
    try {
      await this.init();
      if (!this.doc) return;

      const sheet = this.doc.sheetsByIndex[0];
      
      // Ensure headers exist by checking the first row
      await sheet.loadCells('A1:G1');
      const firstCell = sheet.getCell(0, 0);
      
      if (!firstCell.value) {
        console.log("📝 Initializing Google Sheet headers...");
        await sheet.setHeaderRow(['Date', 'Company', 'Role', 'Stipend', 'Match Score', 'Status', 'Job Link']);
      }

      await sheet.addRow({
        'Date': data.date,
        'Company': data.company,
        'Role': data.role,
        'Stipend': data.stipend,
        'Match Score': `${data.matchScore}%`,
        'Status': data.status,
        'Job Link': data.link
      });

      console.log(`📊 Logged application to Google Sheets: ${data.company}`);
    } catch (error) {
      console.error("❌ Google Sheets Error:", error);
    }
  }

  static async syncAllAppliedJobs() {
    try {
      await this.init();
      if (!this.doc) return;

      const appliedJobs = await prisma.application.findMany({
        where: { status: "APPLIED" },
        include: { jobPost: true }
      });

      console.log(`🔄 Syncing ${appliedJobs.length} applied jobs to Google Sheets...`);

      for (const app of appliedJobs) {
        if (app.jobPost) {
          await this.logApplication({
            date: app.appliedAt.toLocaleDateString(),
            company: app.jobPost.companyName,
            role: app.jobPost.title,
            stipend: app.jobPost.stipend || "N/A",
            matchScore: app.matchScore,
            status: "Applied",
            link: app.jobPost.jobUrl
          });
        }
      }
      console.log("✅ Retroactive sync complete!");
    } catch (error) {
      console.error("❌ Sync Error:", error);
    }
  }
}
