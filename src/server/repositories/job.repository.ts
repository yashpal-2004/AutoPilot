import prisma from "@/lib/db/prisma";

export class JobRepository {
  static async getJobs(userId: string) {
    return prisma.jobPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getJobById(jobId: string) {
    return prisma.jobPost.findUnique({
      where: { id: jobId }
    });
  }
}

export class ApplicationRepository {
  static async getApplications(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      include: { jobPost: true, resume: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateApplicationStatus(id: string, status: any) {
    return prisma.application.update({
      where: { id },
      data: { status }
    });
  }
}
