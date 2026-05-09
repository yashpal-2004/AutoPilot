import prisma from "./db.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function cleanup() {
  console.log("🔍 Finding duplicates...");
  const apps = await prisma.application.findMany({
    select: { id: true, userId: true, jobPostId: true }
  });

  const seen = new Set();
  const toDelete = [];

  for (const app of apps) {
    const key = `${app.userId}-${app.jobPostId}`;
    if (seen.has(key)) {
      toDelete.push(app.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    console.log(`🗑️ Deleting ${toDelete.length} duplicate applications...`);
    await prisma.application.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log("✅ Duplicates removed.");
  } else {
    console.log("✨ No duplicates found.");
  }
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
