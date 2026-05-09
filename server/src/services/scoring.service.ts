import { UserPreferences, JobPost, Resume } from "@prisma/client";
import { AiService } from "./ai.service.js";

export interface ScoringResult {
  score: number;
  recommendedResumeId: string | null;
  reasons: string[];
  risks: string[];
  shouldSkip: boolean;
  skipReason?: string;
}

export class ScoringService {
  private static SCAM_KEYWORDS = [
    "registration fee", "security deposit", "training fee", 
    "pay to apply", "investment required", "deposit", 
    "paid training fee", "training charges"
  ];

  static async calculateScore(
    job: JobPost, 
    prefs: UserPreferences, 
    resumes: Resume[]
  ): Promise<ScoringResult> {
    let score = 0;
    const reasons: string[] = [];
    const risks: string[] = [];
    let shouldSkip = false;
    let skipReason = "";

    // 1. BASIC SKIP CONDITIONS (Phase 6 Tasks)
    
    // Scam detection
    const description = (job.description || "").toLowerCase();
    const foundScamWord = this.SCAM_KEYWORDS.find(word => description.includes(word));
    if (foundScamWord) {
      return { score: 0, recommendedResumeId: null, reasons: [], risks: ["Scam detected"], shouldSkip: true, skipReason: `Suspicious keyword: ${foundScamWord}` };
    }

    // Blacklisted companies
    const blockedCompanies = (prefs.blockedCompaniesJson as string[]) || [];
    if (blockedCompanies.some(c => job.companyName.toLowerCase().includes(c.toLowerCase()))) {
      return { score: 0, recommendedResumeId: null, reasons: [], risks: ["Blacklisted company"], shouldSkip: true, skipReason: "Company is blacklisted" };
    }

    // Unpaid/Stipend filter
    const jobStipendNum = parseInt(job.stipend?.replace(/[^0-9]/g, "") || "0");
    if (prefs.avoidUnpaid && jobStipendNum === 0 && !job.stipend?.toLowerCase().includes("unpaid")) {
        // Many unpaid jobs don't explicitly say "0", check keywords
        if (job.stipend?.toLowerCase().includes("unpaid")) {
            return { score: 0, recommendedResumeId: null, reasons: [], risks: ["Unpaid"], shouldSkip: true, skipReason: "Avoiding unpaid internships" };
        }
    }
    if (prefs.minStipend && jobStipendNum > 0 && jobStipendNum < prefs.minStipend) {
        return { score: 0, recommendedResumeId: null, reasons: [], risks: ["Stipend below minimum"], shouldSkip: true, skipReason: "Stipend too low" };
    }

    // 2. SCORING WEIGHTS (Phase 6 Tasks)
    
    // A. Skill Match (Weight: 40)
    const jobSkills = (job.skillsJson as string[]) || [];
    const prefSkills = (prefs.skillsJson as string[]) || [];
    const matchedSkills = jobSkills.filter(s => 
      prefSkills.some(ps => ps.toLowerCase() === s.toLowerCase())
    );
    
    const skillScore = jobSkills.length > 0 
      ? Math.min(40, (matchedSkills.length / jobSkills.length) * 40)
      : 20; // Default if no skills listed
    
    score += skillScore;
    if (matchedSkills.length > 0) {
      reasons.push(`Matched ${matchedSkills.length} required skills: ${matchedSkills.slice(0, 3).join(", ")}`);
    }

    // B. Role/Title Match (Weight: 20)
    const targetRoles = (prefs.targetRolesJson as string[]) || [];
    const titleMatch = targetRoles.some(role => job.title.toLowerCase().includes(role.toLowerCase()));
    if (titleMatch) {
      score += 20;
      reasons.push("Job title aligns with target roles");
    } else {
      risks.push("Role title mismatch");
    }

    // C. Location/Mode (Weight: 15)
    if (prefs.remoteOnly && job.location?.toLowerCase().includes("work from home")) {
      score += 15;
      reasons.push("Remote role matches preference");
    } else if (!prefs.remoteOnly) {
      score += 15;
      reasons.push("Location preference match");
    } else {
      risks.push("In-office role (preference is Remote)");
    }

    // D. Stipend Match (Weight: 10)
    if (jobStipendNum >= (prefs.minStipend || 0)) {
      score += 10;
      reasons.push("Stipend meets or exceeds minimum");
    }

    // E. Freshness (Weight: 5)
    // If created today, full points
    const isNew = new Date(job.createdAt).toDateString() === new Date().toDateString();
    if (isNew) {
      score += 5;
      reasons.push("Recently posted");
    }

    // 3. RESUME SELECTION (Weight: 10)
    // Find best resume based on role category
    let bestResume = resumes.find(r => r.isDefault) || resumes[0];
    const jobTitleLower = job.title.toLowerCase();
    
    const matchingResume = resumes.find(r => 
      r.roleCategory && jobTitleLower.includes(r.roleCategory.toLowerCase())
    );
    
    if (matchingResume) {
      bestResume = matchingResume;
      score += 10;
      reasons.push(`Perfect resume found: ${bestResume.name}`);
    }

    // F. AI Semantic Match (Weight: 20) - Phase 9
    if (bestResume?.parsedText) {
      const aiEval = await AiService.calculateAiMatchScore(
        job.title,
        job.description || "",
        bestResume.parsedText
      );
      
      const aiBoost = Math.round((aiEval.score / 100) * 20);
      score += aiBoost;
      if (aiBoost > 10) {
        reasons.push(`AI Analysis: ${aiEval.reasoning} (+${aiBoost} pts)`);
      } else if (aiBoost < 5) {
        risks.push(`AI Analysis: Low semantic match (${aiEval.reasoning})`);
      }
    }

    // 4. FINAL DECISION
    if (score < prefs.minMatchScore) {
      shouldSkip = true;
      skipReason = `Match score (${Math.round(score)}) below threshold (${prefs.minMatchScore})`;
    }

    console.log(`⚖️ Scored: ${job.companyName} - ${job.title}: ${Math.round(score)}% ${shouldSkip ? '(SKIP: ' + skipReason + ')' : '(READY)'}`);

    return {
      score: Math.round(score),
      recommendedResumeId: bestResume?.id || null,
      reasons,
      risks,
      shouldSkip,
      skipReason
    };
  }
}
