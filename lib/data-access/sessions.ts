import { db } from "@/lib/db";

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await db.passwordResetToken.create({
    data: input
  });
}

export async function consumePasswordResetToken(tokenHash: string): Promise<{ userId: string } | null> {
  const token = await db.passwordResetToken.findUnique({
    where: {
      tokenHash
    }
  });

  if (!token) {
    return null;
  }

  if (token.usedAt || token.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  await db.passwordResetToken.update({
    where: {
      id: token.id
    },
    data: {
      usedAt: new Date()
    }
  });

  return {
    userId: token.userId
  };
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await db.user.update({
    where: {
      id: userId
    },
    data: {
      passwordHash
    }
  });
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

export async function deleteSessionByHash(tokenHash: string): Promise<void> {
  await db.session.deleteMany({
    where: {
      tokenHash
    }
  });
}

export async function createSession(input: {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await db.session.create({
    data: input
  });
}

export async function getSessionWithUser(tokenHash: string) {
  return db.session.findUnique({
    where: {
      tokenHash
    },
    include: {
      user: true
    }
  });
}
