import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { TelegramService } from "@/server/services/telegram.service";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      include: { 
        preferences: true,
        notifications: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      preferences: user?.preferences,
      telegram: {
        enabled: user?.notifications?.telegramEnabled || false,
        hasToken: !!user?.notifications?.telegramBotTokenEnc,
        hasChatId: !!user?.notifications?.telegramChatIdEnc
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, preferences, telegram } = body;

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
      const { AutoPilotService } = await import("@/server/services/autopilot.service");
      // Trigger background run without awaiting (non-blocking)
      AutoPilotService.runCycle();
      return NextResponse.json({ success: true, message: "AutoPilot cycle started in the background." });
    }

    if (action === "save_telegram") {
      await TelegramService.saveConfig(telegram.botToken, telegram.chatId);
      await TelegramService.sendMessage("✅ <b>Success!</b> Your Telegram bot is now linked to AutoPilot.");
    }

    if (action === "test_telegram") {
      await TelegramService.sendMessage("🚀 <b>Test Notification</b>\n\nThis is a test message from your AutoPilot dashboard. If you see this, your configuration is perfect!");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
