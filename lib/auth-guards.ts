import { redirect } from "next/navigation";

import { getServerSessionUser } from "@/lib/auth";
import { roleAllows } from "@/lib/data-access";
import { PlatformUser, UserRole } from "@/lib/types";

export async function requireAuthenticatedUser(): Promise<PlatformUser> {
  const user = await getServerSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

export async function requireUserRole(allowedRoles: UserRole[]): Promise<PlatformUser> {
  const user = await requireAuthenticatedUser();

  if (!roleAllows(user.role, allowedRoles)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireAdminUser(): Promise<PlatformUser> {
  return requireUserRole(["admin"]);
}
