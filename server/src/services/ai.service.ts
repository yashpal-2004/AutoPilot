import Groq from "groq-sdk";

export class AiService {
  private static groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  private static PITCH_MODEL = "llama-3.3-70b-versatile";
  private static FAST_MODEL = "llama-3.1-8b-instant";

  /**
   * Generates a tailored cover letter/pitch for a job application.
   */
  static async generateCoverLetter(
    jobTitle: string,
    jobDescription: string,
    resumeText: string,
    companyName: string
  ): Promise<string> {
    try {
      const prompt = `
        You are an expert career coach and professional writer. 
        Your task is to write a highly compelling, concise, and professional "Cover Letter" (pitch) for a job application on Internshala.
        
        CONTEXT:
        - Job Title: ${jobTitle}
        - Company: ${companyName}
        - Job Description: ${jobDescription}
        - Candidate Resume Summary: ${resumeText}
        
        RULES:
        1. Keep it under 200 words.
        2. Be direct and avoid generic "To whom it may concern" fluff.
        3. Highlight the candidate's skills that EXACTLY match the job requirements.
        4. Use a confident but humble tone.
        5. DO NOT mention that you are an AI.
        6. Focus on how the candidate can add value to ${companyName}.
        7. The output should be the cover letter text ONLY.
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional job application assistant. Write high-conversion cover letters.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: this.PITCH_MODEL,
        temperature: 0.7,
        max_tokens: 500,
      });

      return chatCompletion.choices[0]?.message?.content || "I am highly interested in this role and believe my skills align well with your requirements.";
    } catch (error) {
      console.error("Groq AI Error:", error);
      return "I am highly interested in this role and believe my skills align well with your requirements.";
    }
  }

  /**
   * Answers a specific application question based on the resume.
   */
  static async answerQuestion(
    question: string,
    jobTitle: string,
    resumeText: string
  ): Promise<string> {
    try {
      const prompt = `
        Job Title: ${jobTitle}
        Candidate Resume: ${resumeText}
        Question: ${question}
        
        Provide a professional, truthful answer to this application question based ONLY on the candidate's resume information. 
        If the information isn't directly in the resume, provide a reasonable professional response that aligns with the candidate's profile.
        Keep the answer concise (max 100 words).
        Output the answer ONLY.
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional job application assistant answering specific screening questions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: this.FAST_MODEL,
        temperature: 0.5,
        max_tokens: 300,
      });

      return chatCompletion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Groq AI Error:", error);
      return "";
    }
  }

  /**
   * Calculates a semantic match score (0-100) between a job and a resume.
   */
  static async calculateAiMatchScore(
    jobTitle: string,
    jobDescription: string,
    resumeText: string
  ): Promise<{ score: number; reasoning: string }> {
    try {
      const prompt = `
        Evaluate the match between the following Job and Candidate Resume.
        
        Job Title: ${jobTitle}
        Job Description: ${jobDescription}
        Candidate Resume: ${resumeText}
        
        Provide a match score (0 to 100) and a brief reasoning (1 sentence).
        Output format: JSON only. Example: {"score": 85, "reasoning": "Strong match in React and TypeScript skills."}
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a recruitment AI. Evaluate job matches strictly and accurately.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: this.FAST_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(chatCompletion.choices[0]?.message?.content || '{"score": 50, "reasoning": "Neutral match."}');
      return {
        score: Number(result.score) || 50,
        reasoning: result.reasoning || "Match based on general profile."
      };
    } catch (error) {
      console.error("Groq AI Scoring Error:", error);
      return { score: 50, reasoning: "Error calculating AI score." };
    }
  }
}
