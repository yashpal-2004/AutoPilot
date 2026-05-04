export interface UserDTO {
  id: string;
  email: string;
  name?: string | null;
}

export interface PreferencesDTO {
  targetRoles: string[];
  skills: string[];
  locations: string[];
  minStipend: number | null;
  dailyLimit: number;
  minMatchScore: number;
  avoidKeywords: string[];
  blockedCompanies: string[];
  remoteOnly: boolean;
  avoidUnpaid: boolean;
  autopilotEnabled: boolean;
  manualApproval: boolean;
  scheduleTime: string;
  timezone: string;
}
