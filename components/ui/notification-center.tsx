"use client";

import { useNotificationState } from "@/components/providers/app-state-provider";
import { NotificationItem } from "@/lib/types";

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

const channelLabels: Record<NotificationItem["channel"], string> = {
  email: "بريد إلكتروني",
  in_app: "داخل النظام"
};

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const { unreadCount, markAllRead } = useNotificationState();
  const hasNotifications = notifications.length > 0;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="mb-2 text-xl font-bold tracking-tight text-ink">الإشعارات</h2>
          <p className="text-sm text-subtext">
            غير المقروءة حاليا: {unreadCount} من أصل {notifications.length}
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="btn-secondary bg-page px-4 py-2 font-medium"
        >
          تحديد الكل كمقروء
        </button>
      </div>

      {hasNotifications ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article key={notification.id} className="rounded-lg border border-border bg-surface-soft p-4">
              <h3 className="mb-2 text-base font-semibold text-ink">{notification.title}</h3>
              <p className="mb-2 text-sm leading-relaxed text-subtext">{notification.description}</p>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
                {channelLabels[notification.channel]}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-subtext">
          لا توجد إشعارات حاليا. عند وجود تحديثات جديدة ستظهر هنا.
        </p>
      )}
    </section>
  );
}
