import { z } from "zod";

export const resumeUploadSchema = z.object({
  name: z.string().min(1, "Resume name is required"),
  originalFileUrl: z.string().url("Valid URL is required"),
  roleCategory: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type ResumeUploadInput = z.infer<typeof resumeUploadSchema>;
