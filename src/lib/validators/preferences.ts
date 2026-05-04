import { z } from "zod";

export const preferencesSchema = z.object({
  targetRoles: z.array(z.string()).min(1, "At least one target role is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  locations: z.array(z.string()),
  minStipend: z.number().nullable().optional(),
  dailyLimit: z.number().min(1).max(50).default(5),
  minMatchScore: z.number().min(0).max(100).default(80),
  avoidKeywords: z.array(z.string()).default([]),
  blockedCompanies: z.array(z.string()).default([]),
  remoteOnly: z.boolean().default(false),
  avoidUnpaid: z.boolean().default(true),
  autopilotEnabled: z.boolean().default(false),
  manualApproval: z.boolean().default(true),
  scheduleTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be in HH:MM format").default("09:00"),
  timezone: z.string().default("Asia/Kolkata"),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;
