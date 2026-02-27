import { db } from "@/lib/db";
import { NotificationItem } from "@/lib/types";

import { mapNotification } from "@/lib/data-access/shared";

export async function listNotifications(userId?: string): Promise<NotificationItem[]> {
  const notifications = await db.notification.findMany({
    where: userId ? { OR: [{ userId }, { userId: null }] } : undefined,
    orderBy: {
      createdAt: "desc"
    }
  });

  return notifications.map(mapNotification);
}

export async function countUnreadNotifications(userId?: string): Promise<number> {
  return db.notification.count({
    where: {
      read: false,
      ...(userId ? { OR: [{ userId }, { userId: null }] } : {})
    }
  });
}
