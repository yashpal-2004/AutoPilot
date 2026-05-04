import prisma from "@/lib/db/prisma";

export class UserRepository {
  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true, notifications: true }
    });
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}

export class PreferencesRepository {
  static async getPreferences(userId: string) {
    return prisma.userPreferences.findUnique({
      where: { userId }
    });
  }

  static async updatePreferences(userId: string, data: any) {
    return prisma.userPreferences.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId }
    });
  }
}
