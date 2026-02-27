import Link from "next/link";

import { PROJECT_STATUS_LABELS_AR } from "@/lib/constants/projects";
import { requireAuthenticatedUser } from "@/lib/auth-guards";
import { getAllContent } from "@/lib/data-access";
import { LiftProject } from "@/lib/types";
import { addDaysKey, parseDateKey, toDateKey } from "@/lib/utils/date";

type DashboardIconName =
  | "analytics"
  | "projects"
  | "completed"
  | "calendar"
  | "warning"
  | "settings"
  | "team";

type MetricTone = "primary" | "success" | "warning" | "neutral";

interface DashboardMetricCard {
  label: string;
  value: string;
  hint: string;
  icon: DashboardIconName;
  tone: MetricTone;
}

interface QuickShortcut {
  href: string;
  title: string;
  description: string;
  icon: DashboardIconName;
  adminOnly?: boolean;
}

interface StatusSummary {
  key: LiftProject["status"];
  label: string;
  count: number;
  percent: number;
  barClassName: string;
  badgeClassName: string;
}

const numberFormatter = new Intl.NumberFormat("ar-SA");
const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  const projects = await getAllContent();
  const isAdmin = user.role === "admin";
  const totalProjects = projects.length;
  const todayKey = toDateKey(new Date());
  const nextWeekKey = addDaysKey(new Date(), 7);

  const newProjects = projects.filter((item) => item.status === "new");
  const plannedProjects = projects.filter((item) => item.status === "planned");
  const inProgressProjects = projects.filter((item) => item.status === "in_progress");
  const completedProjects = projects.filter((item) => item.status === "completed");

  const activeProjects = projects.filter(
    (item) => item.status === "new" || item.status === "planned" || item.status === "in_progress"
  );
  const completionRate = totalProjects === 0 ? 0 : Math.round((completedProjects.length / totalProjects) * 100);
  const dueSoonCount = projects.filter(
    (item) => item.status !== "completed" && item.nextVisit >= todayKey && item.nextVisit <= nextWeekKey
  ).length;
  const overdueCount = projects.filter(
    (item) => item.status !== "completed" && item.nextVisit < todayKey
  ).length;
  const urgentCount = dueSoonCount + overdueCount;

  const upcomingProjects = [...projects]
    .filter((item) => item.status !== "completed")
    .sort((a, b) => a.nextVisit.localeCompare(b.nextVisit))
    .slice(0, 6);

  const statusSummary: StatusSummary[] = [
    {
      key: "new",
      label: PROJECT_STATUS_LABELS_AR.new,
      count: newProjects.length,
      percent: percentage(newProjects.length, totalProjects),
      barClassName: "bg-primary",
      badgeClassName: "bg-primary-soft text-primary"
    },
    {
      key: "planned",
      label: PROJECT_STATUS_LABELS_AR.planned,
      count: plannedProjects.length,
      percent: percentage(plannedProjects.length, totalProjects),
      barClassName: "bg-warning",
      badgeClassName: "bg-warning-soft text-warning-text"
    },
    {
      key: "in_progress",
      label: PROJECT_STATUS_LABELS_AR.in_progress,
      count: inProgressProjects.length,
      percent: percentage(inProgressProjects.length, totalProjects),
      barClassName: "bg-success",
      badgeClassName: "bg-progress-soft text-progress-text"
    },
    {
      key: "completed",
      label: PROJECT_STATUS_LABELS_AR.completed,
      count: completedProjects.length,
      percent: percentage(completedProjects.length, totalProjects),
      barClassName: "bg-complete-text",
      badgeClassName: "bg-complete-soft text-complete-text"
    }
  ];

  const metrics: DashboardMetricCard[] = [
    {
      label: "إجمالي المشاريع",
      value: formatNumber(totalProjects),
      hint: "كل المشاريع المسجلة في النظام",
      icon: "projects",
      tone: "primary"
    },
    {
      label: "المشاريع النشطة",
      value: formatNumber(activeProjects.length),
      hint: `${formatNumber(inProgressProjects.length)} مشروع قيد التنفيذ`,
      icon: "analytics",
      tone: "neutral"
    },
    {
      label: "نسبة الإنجاز",
      value: `${formatNumber(completionRate)}%`,
      hint: `${formatNumber(completedProjects.length)} مشروع مكتمل`,
      icon: "completed",
      tone: "success"
    },
    {
      label: "يتطلب متابعة",
      value: formatNumber(urgentCount),
      hint: `${formatNumber(dueSoonCount)} خلال 7 أيام و ${formatNumber(overdueCount)} متأخر`,
      icon: "warning",
      tone: urgentCount > 0 ? "warning" : "neutral"
    }
  ];

  const shortcuts: QuickShortcut[] = [
    {
      href: "/catalog",
      title: "إدارة المشاريع",
      description: "استعراض وتحديث كل مشاريع المصاعد",
      icon: "projects"
    },
    {
      href: "/settings",
      title: "الإعدادات",
      description: "تعديل إعدادات النظام ومحتوى الموقع",
      icon: "settings"
    },
    {
      href: "/employees",
      title: "الموظفون",
      description: "متابعة الأدوار وصلاحيات المستخدمين",
      icon: "team",
      adminOnly: true
    }
  ];

  const visibleShortcuts = shortcuts.filter((item) => (item.adminOnly ? isAdmin : true));

  const todayLabel = formatArabicDate(todayKey);
  const nextWeekLabel = formatArabicDate(nextWeekKey);

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-shell space-y-6 lg:space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-ink">توزيع حالات المشاريع</h2>
                  <p className="text-sm text-subtext">نسب الحالات من إجمالي المشاريع الحالية.</p>
                </div>
                <span className="rounded-md border border-border bg-page px-3 py-1 text-xs font-semibold text-subtext">
                  إجمالي المشاريع: {formatNumber(totalProjects)}
                </span>
              </div>

              <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-page">
                {statusSummary.map((item) => (
                  <div
                    key={item.key}
                    className={item.barClassName}
                    style={{ width: `${item.percent}%` }}
                    aria-hidden
                  />
                ))}
              </div>

              <div className="space-y-3">
                {statusSummary.map((item) => (
                  <article
                    key={item.key}
                    className="grid gap-3 rounded-lg border border-border bg-surface-soft p-4 sm:grid-cols-[1fr_auto_auto]"
                  >
                    <p className="font-medium text-ink">{item.label}</p>
                    <p className="text-sm text-subtext">{formatNumber(item.count)} مشروع</p>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.badgeClassName}`}>
                      {formatNumber(item.percent)}%
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-ink">الزيارات القادمة</h2>
                  <p className="text-sm text-subtext">
                    المشاريع غير المكتملة حتى {nextWeekLabel} (الأقرب أولا).
                  </p>
                </div>
                <span className="rounded-md border border-border bg-page px-3 py-1 text-xs font-semibold text-subtext">
                  فترة المتابعة: {todayLabel} - {nextWeekLabel}
                </span>
              </div>

              {upcomingProjects.length === 0 ? (
                <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-subtext">
                  لا توجد زيارات قادمة حاليا.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingProjects.map((project) => (
                    <ProjectSnapshot key={project.id} project={project} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
              <h2 className="mb-4 text-xl font-bold tracking-tight text-ink">اختصارات الإدارة</h2>
              <p className="mb-5 text-sm text-subtext">روابط مباشرة للعمليات الأكثر استخداما يوميا.</p>
              <div className="space-y-3">
                {visibleShortcuts.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4 transition-colors duration-200 hover:border-primary"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <DashboardIcon name={item.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink transition-colors group-hover:text-primary">
                        {item.title}
                      </span>
                      <span className="text-sm text-subtext">{item.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectSnapshot({ project }: { project: LiftProject }) {
  const status = projectStatusStyle(project.status);

  return (
    <article className="rounded-lg border border-border bg-surface-soft p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-ink">{project.title}</h3>
          <p className="mt-1 text-sm text-subtext">العميل: {project.clientName}</p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-subtext">{project.summary}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-subtext">الموقع: {project.location}</p>
        <p className="font-medium text-primary">الزيارة القادمة: {formatArabicDate(project.nextVisit)}</p>
      </div>
      <div className="mt-4">
        <Link href={`/catalog/${project.id}`} className="text-sm font-semibold text-primary hover:underline">
          فتح المشروع
        </Link>
      </div>
    </article>
  );
}

function MetricCard({ metric }: { metric: DashboardMetricCard }) {
  const toneStyles: Record<MetricTone, string> = {
    primary: "border-primary/25 bg-primary-soft",
    success: "border-success-border bg-success-soft",
    warning: "border-warning bg-warning-soft",
    neutral: "border-border bg-surface-soft"
  };

  return (
    <article className={`rounded-xl border p-5 shadow-card ${toneStyles[metric.tone]}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-subtext">{metric.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{metric.value}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-primary">
          <DashboardIcon name={metric.icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="text-sm text-subtext">{metric.hint}</p>
    </article>
  );
}

function DashboardIcon({ name, className }: { name: DashboardIconName; className?: string }) {
  const base = className ?? "h-5 w-5";

  switch (name) {
    case "analytics":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
          <path d="M4 19h16M7 16V9M12 16V5M17 16v-3" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h3l1.5 2h6.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
        </svg>
      );
    case "completed":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12 2.3 2.3L15.8 9.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );
    case "warning":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
          <path d="M12 4 3 20h18z" />
          <path d="M12 9v5M12 17h.01" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
          <path d="M19.4 12.9a7.7 7.7 0 0 0 0-1.8l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-1.5-.9l-.4-2.6h-4l-.4 2.6a7.4 7.4 0 0 0-1.5.9l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 1.8l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 1.5.9l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.5-.9l2.4 1 2-3.4z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "team":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={base}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9.5" r="2.5" />
          <path d="M3.5 19.5c.6-2.6 2.7-4.5 5.5-4.5s4.9 1.9 5.5 4.5M13.5 19.5c.4-1.7 1.8-3 3.5-3.3" />
        </svg>
      );
    default:
      return null;
  }
}

function projectStatusStyle(status: LiftProject["status"]): { label: string; className: string } {
  switch (status) {
    case "new":
      return { label: PROJECT_STATUS_LABELS_AR.new, className: "bg-primary-soft text-primary" };
    case "planned":
      return { label: PROJECT_STATUS_LABELS_AR.planned, className: "bg-warning-soft text-warning-text" };
    case "in_progress":
      return { label: PROJECT_STATUS_LABELS_AR.in_progress, className: "bg-progress-soft text-progress-text" };
    case "completed":
      return { label: PROJECT_STATUS_LABELS_AR.completed, className: "bg-complete-soft text-complete-text" };
    default:
      return { label: "غير محدد", className: "bg-page text-subtext" };
  }
}

function percentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatArabicDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return dateFormatter.format(date);
}
