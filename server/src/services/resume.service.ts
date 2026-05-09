import prisma from "../db.js";
import * as mammoth from "mammoth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import PDFParser from "pdf2json";
import { TECH_SKILLS } from "../lib/constants/tech-skills.js";

export class ResumeService {
  static async uploadAndParse(buffer: Buffer, fileName: string, userId: string) {
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads", "resumes");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {}

    // Save file locally
    const fileId = uuidv4();
    const extension = fileName.split('.').pop()?.toLowerCase();
    const savedFileName = `${fileId}.${extension}`;
    const filePath = join(uploadsDir, savedFileName);
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/resumes/${savedFileName}`;

    // Parse text
    let parsedText = "";
    let pageCount = 1;
    if (extension === "pdf") {
      parsedText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
          let text = pdfParser.getRawTextContent();
          try {
            // pdf2json outputs URI-encoded text (spaces become %20). 
            // This breaks our regex word boundaries if not decoded.
            text = decodeURIComponent(text);
          } catch (e) {}
          resolve(text);
        });
        pdfParser.parseBuffer(buffer);
      });
      // A rough estimate of pages if not provided directly
      pageCount = Math.max(1, Math.ceil(parsedText.length / 3000));
    } else if (extension === "docx") {
      const data = await mammoth.extractRawText({ buffer });
      parsedText = data.value;
    }

    // Smart skill extraction using word boundaries to avoid partial matches
    let foundSkills = TECH_SKILLS.filter(skill => {
      // Escape special characters in the skill name (like +, ., #)
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Use negative lookbehind and lookahead for word characters \w ([a-zA-Z0-9_])
      const regex = new RegExp(`(?<!\\w)${escapedSkill}(?!\\w)`, 'i');
      return regex.test(parsedText);
    });

    // Deduplicate common aliases so we don't get ["Express", "Express JS"]
    const skillAliases: Record<string, string> = {
      "Express JS": "Express",
      "Express.js": "Express",
      "Prisma ORM": "Prisma",
      "OAuth 2.0": "OAuth",
      "React.js": "React",
      "Node JS": "Node.js",
      "Vue JS": "Vue.js",
      "REST APIs": "REST API",
    };

    foundSkills = Array.from(new Set(foundSkills.map(skill => skillAliases[skill] || skill)));

    // Smart role categorization based on extracted skills and text
    let roleCategory = "Software Engineer";
    const textLower = parsedText.toLowerCase();
    
    const isData = textLower.includes("data analyst") || textLower.includes("data scientist") || textLower.includes("machine learning") || (foundSkills.includes("Pandas") && foundSkills.includes("Python"));
    const isFrontend = textLower.includes("frontend") || foundSkills.includes("React") || foundSkills.includes("Vue.js") || foundSkills.includes("Angular");
    const isBackend = textLower.includes("backend") || foundSkills.includes("Node.js") || foundSkills.includes("Spring Boot") || foundSkills.includes("Django");

    if (isData) {
      roleCategory = "Data Scientist / Analyst";
    } else if (isFrontend && isBackend) {
      roleCategory = "Full Stack Developer";
    } else if (isFrontend) {
      roleCategory = "Frontend Developer";
    } else if (isBackend) {
      roleCategory = "Backend Developer";
    }

    // Deactivate others if this is the first one or we want to make it default
    const existingCount = await prisma.resume.count({ where: { userId } });
    const isDefault = existingCount === 0;

    // Save to DB
    const resume = await prisma.resume.create({
      data: {
        userId,
        name: fileName,
        originalFileUrl: fileUrl,
        parsedText,
        skillsJson: foundSkills,
        roleCategory,
        pageCount,
        isDefault,
        isActive: true,
      }
    });

    return resume;
  }

  static async getResumes(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  static async setDefaultResume(userId: string, resumeId: string) {
    await prisma.resume.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
    return prisma.resume.update({
      where: { id: resumeId, userId },
      data: { isDefault: true }
    });
  }

  static async updateResume(userId: string, resumeId: string, data: any) {
    return prisma.resume.update({
      where: { id: resumeId, userId },
      data
    });
  }

  static async deleteResume(userId: string, resumeId: string) {
    return prisma.resume.delete({
      where: { id: resumeId, userId }
    });
  }
}
