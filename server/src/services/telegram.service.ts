import crypto from 'crypto';
import prisma from "../db.js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_chars_long!!'; // Must be 32 chars
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export class TelegramService {
  private static async getBotConfig() {
    const config = await prisma.telegramNotificationConfig.findFirst();
    
    const botToken = config?.telegramBotTokenEnc 
      ? decrypt(config.telegramBotTokenEnc) 
      : process.env.TELEGRAM_BOT_TOKEN;
      
    const chatId = config?.telegramChatIdEnc 
      ? decrypt(config.telegramChatIdEnc) 
      : process.env.TELEGRAM_CHAT_ID;
      
    const enabled = config ? config.telegramEnabled : (!!botToken && !!chatId);

    if (!botToken || !chatId) return null;
    
    return { botToken, chatId, enabled };
  }

  static async sendMessage(message: string) {
    const config = await this.getBotConfig();
    if (!config || !config.enabled) return;

    try {
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
    }
  }

  static async sendApplicationAlert(data: {
    company: string;
    role: string;
    score: number;
    resume: string;
    status: string;
  }) {
    const message = `
<b>🚀 Application Submitted</b>

<b>Company:</b> ${data.company}
<b>Role:</b> ${data.role}
<b>Score:</b> ${data.score}%
<b>Resume:</b> ${data.resume}
<b>Status:</b> ${data.status}

<i>Sent via AutoPilot Engine</i>
    `;
    await this.sendMessage(message.trim());
  }

  static async sendErrorAlert(reason: string, action: string = "Open dashboard and complete login verification.") {
    const message = `
<b>⚠️ AutoPilot Paused</b>

<b>Reason:</b> ${reason}
<b>Action:</b> ${action}
    `;
    await this.sendMessage(message.trim());
  }

  static async sendDailySummary(stats: {
    target: number;
    applied: number;
    skipped: number;
    errors: number;
    replies: number;
    topApps: Array<{ role: string; company: string; score: number }>;
  }) {
    const appsList = stats.topApps
      .map((app, i) => `${i + 1}. ${app.role} — ${app.company} — Score ${app.score}`)
      .join('\n');

    const message = `
<b>📊 AutoPilot Daily Summary</b>

<b>Target:</b> ${stats.target}
<b>Applied:</b> ${stats.applied}
<b>Skipped:</b> ${stats.skipped}
<b>Errors:</b> ${stats.errors}
<b>Replies:</b> ${stats.replies}

<b>Top Applications:</b>
${appsList || "None today"}

<b>Action Needed:</b>
${stats.errors > 0 ? "⚠️ Login verification required for 1 or more jobs." : "✅ System running smoothly."}
    `;
    await this.sendMessage(message.trim());
  }

  static async saveConfig(token: string, chatId: string) {
    const encryptedToken = encrypt(token);
    const encryptedChatId = encrypt(chatId);

    const existing = await prisma.telegramNotificationConfig.findFirst();
    if (existing) {
      return prisma.telegramNotificationConfig.update({
        where: { id: existing.id },
        data: { telegramBotTokenEnc: encryptedToken, telegramChatIdEnc: encryptedChatId, telegramEnabled: true }
      });
    } else {
      const user = await prisma.user.findFirst();
      return prisma.telegramNotificationConfig.create({
        data: { 
          userId: user!.id, 
          telegramBotTokenEnc: encryptedToken, 
          telegramChatIdEnc: encryptedChatId, 
          telegramEnabled: true 
        }
      });
    }
  }
}
