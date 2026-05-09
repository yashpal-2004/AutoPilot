# 🚀 AutoPilot: The Autonomous Job Engine

AutoPilot is an intelligent, full-stack job application automation engine designed to hunt, score, and apply to internships on Internshala autonomously. It features a modernized **MERN-style architecture** with a high-performance Express backend and a sleek Vite/React frontend.

## ✨ Core Features

- **Autonomous Scraper**: Crawls multiple pages of job listings with duplicate detection.
- **AI Scoring Engine**: Uses Groq (Llama 3) to analyze job descriptions against your resume and preferences.
- **Smart Apply**: Fully automated Puppeteer-driven application flow with stealth mode to bypass bot detection.
- **Google Sheets Sync**: Real-time logging of every application to a centralized tracking sheet.
- **Telegram Notifications**: Get instant alerts on your phone whenever a match is found or an application is sent.
- **Dashboard Overview**: Track your stats, trigger manual scrapes, and sync data with one click.

## 🏗️ Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, ESM, Puppeteer-Extra (Stealth), Cheerio.
- **Database**: PostgreSQL (via Neon) & Prisma ORM.
- **AI**: Groq Cloud API (Llama 3-70B).

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Cloud Service Account (for Sheets API)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="your-postgresql-url"
GROQ_API_KEY="your-groq-api-key"

# Internshala Credentials
INTERNSHALA_EMAIL="your-email"
INTERNSHALA_PASSWORD="your-password"

# Google Sheets Integration
GOOGLE_SHEET_ID="your-sheet-id"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account-email"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Telegram (Optional)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"
```

### 3. Installation
```bash
# Install root dependencies
npm install

# Setup Database
cd server
npx prisma db push
npx prisma generate
```

### 4. Running the Application
You need to run both the backend and frontend simultaneously:

**Backend (Port 3001):**
```bash
cd server
npm run dev
```

**Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```

## 📊 Dashboard Controls
- **Trigger Manual Scrape**: Instantly scan for new opportunities.
- **Sync Google Sheets**: Force-sync all previous applications to your spreadsheet.
- **Autopilot Toggle**: Enable/Disable the 6-hour autonomous scheduler.

## 🛡️ License
MIT License. Built for ethical automation and career acceleration.
