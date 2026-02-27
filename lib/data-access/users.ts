import { User, UserRole } from "@prisma/client";

import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { db } from "@/lib/db";
import { PlatformUser, UserRole as AppUserRole } from "@/lib/types";
import { ensureImageUrl } from "@/lib/utils/image";

import { mapUser, roleToDb } from "@/lib/data-access/shared";

export async function listUsers(): Promise<PlatformUser[]> {
  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return users.map(mapUser);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role?: AppUserRole;
  avatarUrl: string;
}): Promise<User> {
  return db.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      phone: input.phone.trim(),
      role: input.role ? roleToDb[input.role] : "USER",
      avatarUrl: ensureImageUrl(input.avatarUrl, DEFAULT_IMAGE_URLS.employeeAvatar)
    }
  });
}

export async function getUserById(id: string): Promise<User | null> {
  return db.user.findUnique({
    where: {
      id
    }
  });
}

export async function updateUserByAdmin(
  id: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    role?: AppUserRole;
    passwordHash?: string;
    avatarUrl?: string;
  }
): Promise<PlatformUser | null> {
  const current = await db.user.findUnique({
    where: {
      id
    }
  });

  if (!current) {
    return null;
  }

  const updated = await db.user.update({
    where: {
      id
    },
    data: {
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.email !== undefined ? { email: updates.email.toLowerCase() } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone.trim() } : {}),
      ...(updates.role !== undefined ? { role: roleToDb[updates.role] } : {}),
      ...(updates.avatarUrl !== undefined
        ? { avatarUrl: ensureImageUrl(updates.avatarUrl, DEFAULT_IMAGE_URLS.employeeAvatar) }
        : {}),
      ...(updates.passwordHash !== undefined ? { passwordHash: updates.passwordHash } : {})
    }
  });

  return mapUser(updated);
}

export async function countAdmins(): Promise<number> {
  return db.user.count({
    where: {
      role: "ADMIN"
    }
  });
}

export async function deleteUserByAdmin(id: string): Promise<boolean> {
  try {
    await db.user.delete({
      where: {
        id
      }
    });
    return true;
  } catch {
    return false;
  }
}

export function toPublicUser(
  user: Pick<User, "id" | "name" | "email" | "phone" | "role" | "avatarUrl" | "createdAt">
): PlatformUser {
  return mapUser(user);
}
export function roleAllows(role: AppUserRole, allowed: AppUserRole[]): boolean {
  const levels: Record<AppUserRole, number> = {
    user: 1,
    supervisor: 2,
    admin: 3
  };

  const roleLevel = levels[role];
  return allowed.some((item) => roleLevel >= levels[item]);
}

export function toDbRole(role: AppUserRole): UserRole {
  return roleToDb[role];
}
