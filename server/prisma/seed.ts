import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if we already have a user
  const existingUser = await prisma.user.findFirst()
  if (existingUser) {
    console.log('Seed data already exists. Skipping...')
    return
  }

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      email: 'demo@applypilot.com',
      name: 'Demo User',
      
      // 2. Create Preferences
      preferences: {
        create: {
          targetRolesJson: ["Frontend Developer Intern", "React Intern"],
          skillsJson: ["JavaScript", "TypeScript", "React", "Next.js"],
          locationsJson: ["Remote", "Bangalore"],
          minStipend: 10000,
          dailyLimit: 10,
          minMatchScore: 80,
          avoidKeywordsJson: ["unpaid", "field sales"],
          blockedCompaniesJson: ["SpamCorp"],
          remoteOnly: false,
          avoidUnpaid: true,
          autopilotEnabled: true,
          manualApproval: true,
          scheduleTime: "09:00",
          timezone: "Asia/Kolkata"
        }
      },
      
      // 3. Create Resumes
      resumes: {
        create: [
          {
            name: "Frontend_Resume_v1.pdf",
            originalFileUrl: "https://example.com/resumes/frontend.pdf",
            parsedText: "Experienced in React and Tailwind.",
            skillsJson: ["React", "Tailwind", "JavaScript"],
            roleCategory: "Frontend Developer",
            pageCount: 1,
            isActive: true,
            isDefault: true,
          },
          {
            name: "Fullstack_Resume.pdf",
            originalFileUrl: "https://example.com/resumes/fullstack.pdf",
            parsedText: "Experienced in Node.js, Postgres, and React.",
            skillsJson: ["Node.js", "PostgreSQL", "React"],
            roleCategory: "Fullstack Developer",
            pageCount: 1,
            isActive: true,
            isDefault: false,
          }
        ]
      },

      // 4. Create Notification Config
      notifications: {
        create: {
          telegramEnabled: false,
          dailySummary: true,
          instantApplicationAlerts: false,
          instantReplyAlerts: true,
          errorAlerts: true,
        }
      }
    }
  })

  // 5. Create some dummy Job Posts
  const job1 = await prisma.jobPost.create({
    data: {
      userId: user.id,
      platform: "internshala",
      companyName: "TechCorp Inc.",
      title: "Frontend Developer Intern",
      location: "Remote",
      stipend: "10000",
      duration: "3 Months",
      skillsJson: ["React", "JavaScript"],
      description: "Looking for a React developer.",
      jobUrl: "https://internshala.com/job/123",
    }
  })

  const job2 = await prisma.jobPost.create({
    data: {
      userId: user.id,
      platform: "internshala",
      companyName: "Innovate AI",
      title: "React Intern",
      location: "Bangalore",
      stipend: "15000",
      duration: "6 Months",
      skillsJson: ["React", "TypeScript", "Tailwind"],
      description: "Join our AI startup building beautiful UI.",
      jobUrl: "https://internshala.com/job/456",
    }
  })

  // 6. Create Applications
  const resume = await prisma.resume.findFirst({ where: { userId: user.id } })
  
  await prisma.application.create({
    data: {
      userId: user.id,
      jobPostId: job1.id,
      resumeId: resume?.id,
      matchScore: 92,
      status: "APPLIED",
      appliedAt: new Date(),
    }
  })

  await prisma.application.create({
    data: {
      userId: user.id,
      jobPostId: job2.id,
      resumeId: resume?.id,
      matchScore: 88,
      status: "READY_FOR_REVIEW",
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
