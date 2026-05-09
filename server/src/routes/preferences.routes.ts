import { Router } from "express";
import prisma from "../db.js";
import { TelegramService } from "../services/telegram.service.js";
import { AutoPilotService } from "../services/autopilot.service.js";

const router = Router();

// GET preferences
router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      include: { 
        preferences: true,
        notifications: true
      }
    });

    res.json({ 
      success: true, 
      preferences: user?.preferences,
      telegram: {
        enabled: user?.notifications?.telegramEnabled || false,
        hasToken: !!user?.notifications?.telegramBotTokenEnc,
        hasChatId: !!user?.notifications?.telegramChatIdEnc
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST preferences
router.post("/", async (req, res) => {
  try {
    const { action, preferences, telegram } = req.body;

    const user = await prisma.user.findFirst();
    if (!user) throw new Error("User not found");

    if (action === "save_preferences") {
      await prisma.userPreferences.upsert({
        where: { userId: user.id },
        update: {
          targetRolesJson: preferences.targetRoles,
          skillsJson: preferences.skills,
          locationsJson: preferences.locations,
          minStipend: parseInt(preferences.minStipend),
          minMatchScore: parseInt(preferences.minMatchScore),
          avoidKeywordsJson: preferences.avoidKeywords,
          blockedCompaniesJson: preferences.blockedCompanies,
          remoteOnly: preferences.remoteOnly,
          avoidUnpaid: preferences.avoidUnpaid,
          autopilotEnabled: preferences.autopilotEnabled
        },
        create: {
          userId: user.id,
          targetRolesJson: preferences.targetRoles,
          skillsJson: preferences.skills,
          locationsJson: preferences.locations,
          minStipend: parseInt(preferences.minStipend),
          minMatchScore: parseInt(preferences.minMatchScore),
          avoidKeywordsJson: preferences.avoidKeywords,
          blockedCompaniesJson: preferences.blockedCompanies,
          remoteOnly: preferences.remoteOnly,
          avoidUnpaid: preferences.avoidUnpaid,
          autopilotEnabled: preferences.autopilotEnabled
        }
      });
    }

    if (action === "trigger_autopilot") {
      await AutoPilotService.runCycle(true);
      return res.json({ message: "AutoPilot triggered manually" });
    }

    if (action === "sync_sheets") {
      const { GoogleSheetsService } = await import("../services/google-sheets.service.js");
      await GoogleSheetsService.syncAllAppliedJobs();
      return res.json({ message: "Google Sheets sync initiated" });
    }

    if (action === "save_telegram") {
      await TelegramService.saveConfig(telegram.botToken, telegram.chatId);
      await TelegramService.sendMessage("✅ <b>Success!</b> Your Telegram bot is now linked to AutoPilot.");
    }

    if (action === "test_telegram") {
      await TelegramService.sendMessage("🚀 <b>Test Notification</b>\n\nThis is a test message from your AutoPilot dashboard.");
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
