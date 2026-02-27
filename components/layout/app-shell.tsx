"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { LogoutButton } from "@/components/ui/logout-button";
import { UserRole } from "@/lib/types";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userAvatarUrl?: string;
  isAuthenticated: boolean;
  userRole?: UserRole;
}

type SidebarIconName =
  | "dashboard"
  | "projects"
  | "products"
  | "sections"
  | "pages"
  | "customers"
  | "employees"
  | "settings"
  | "website"
  | "login";

interface SidebarItem {
  href: string;
  label: string;
  icon: SidebarIconName;
  adminOnly?: boolean;
}

const items: SidebarItem[] = [
  { href: "/dashboard", label: "لوحة التحكم", icon: "dashboard" },
  { href: "/catalog", label: "المشاريع", icon: "projects" },
  { href: "/products", label: "المنتجات", icon: "products", adminOnly: true },
  { href: "/sections", label: "الأقسام", icon: "sections", adminOnly: true },
  { href: "/pages", label: "الصفحات", icon: "pages", adminOnly: true },
  { href: "/customers", label: "العملاء", icon: "customers", adminOnly: true },
  { href: "/employees", label: "الموظفون", icon: "employees", adminOnly: true },
  { href: "/settings", label: "الإعدادات", icon: "settings" }
];

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const className = "h-5 w-5";

  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h3l1.5 2h6.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
        </svg>
      );
    case "products":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="m12 3 8 4.5-8 4.5-8-4.5z" />
          <path d="M4 7.5V16.5L12 21l8-4.5V7.5" />
          <path d="M12 12v9" />
        </svg>
      );
    case "sections":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M9 5v14M15 5v14" />
        </svg>
      );
    case "pages":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M15 3v5h5M9 12h6M9 16h6" />
        </svg>
      );
    case "customers":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9.5" r="2.5" />
          <path d="M3.5 19.5c.6-2.6 2.7-4.5 5.5-4.5s4.9 1.9 5.5 4.5M13.5 19.5c.4-1.7 1.8-3 3.5-3.3" />
        </svg>
      );
    case "employees":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <circle cx="12" cy="9" r="2.5" />
          <path d="M8.5 17c.5-1.7 1.9-3 3.5-3s3 1.3 3.5 3" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M19.4 12.9a7.7 7.7 0 0 0 0-1.8l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-1.5-.9l-.4-2.6h-4l-.4 2.6a7.4 7.4 0 0 0-1.5.9l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 1.8l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 1.5.9l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.5-.9l2.4 1 2-3.4z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "website":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      );
    case "login":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5" />
          <path d="M10 17 5 12l5-5M6 12h10" />
        </svg>
      );
    default:
      return null;
  }
}

export function AppShell({ children, userName, userAvatarUrl, isAuthenticated, userRole }: AppShellProps) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);
  const [open, setOpen] = useState(false);
  const visibleItems = useMemo(
    () => (userRole === "admin" ? items : items.filter((item) => !item.adminOnly)),
    [userRole]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const syncSidebarState = (desktop: boolean) => {
      setIsDesktop(desktop);
      setOpen(desktop);
    };

    syncSidebarState(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      syncSidebarState(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const closeSidebarOnMobile = () => {
    if (!isDesktop) {
      setOpen(false);
    }
  };

  const pageTitle = useMemo(() => {
    const activeItem = visibleItems.find((item) => pathname.startsWith(item.href));
    return activeItem?.label ?? "لوحة ليفت كنترول";
  }, [pathname, visibleItems]);

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-[1680px]">
        <aside
          className={`fixed inset-y-0 right-0 z-40 flex w-72 max-w-[calc(100vw-1rem)] flex-col overflow-y-auto border-l border-border bg-surface p-6 shadow-panel transition-transform duration-300 ease-in-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="القائمة الجانبية"
        >
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold tracking-tight text-ink">Lift Control</p>
              <button
                type="button"
                className="min-h-11 min-w-11 rounded-md border border-border text-subtext transition-colors duration-200 ease-in-out hover:border-primary hover:text-primary"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة الجانبية"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-border bg-surface-soft px-3 py-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-page">
                <ImageWithFallback
                  src={userAvatarUrl}
                  alt={`صورة ${userName}`}
                  fill
                  sizes="44px"
                  className="object-cover"
                  kind="avatar"
                  placeholderClassName="rounded-full"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-subtext">Signed in as</p>
                <p className="truncate text-sm font-semibold text-ink">{userName}</p>
              </div>
            </div>
          </div>
          <nav className="space-y-2">
            {visibleItems.map((item) => {
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-11 items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                    active ? "bg-primary-soft text-primary" : "text-subtext hover:bg-surface-soft hover:text-primary"
                  }`}
                  onClick={closeSidebarOnMobile}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${
                      active ? "border-primary/30 bg-primary-soft" : "border-border bg-page"
                    }`}
                    aria-hidden
                  >
                    <SidebarIcon name={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3 pt-6">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-page px-4 py-2 text-sm font-medium text-subtext transition-colors duration-200 ease-in-out hover:border-primary hover:text-primary"
              onClick={closeSidebarOnMobile}
            >
              <SidebarIcon name="website" />
              عرض الموقع
            </Link>
            {isAuthenticated ? (
              <LogoutButton
                label="تسجيل الخروج"
                className="w-full bg-page text-subtext hover:border-primary hover:text-primary"
              />
            ) : (
              <Link
                href="/auth/login"
                className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-page px-4 py-2 text-sm font-medium text-subtext transition-colors duration-200 ease-in-out hover:border-primary hover:text-primary"
                onClick={closeSidebarOnMobile}
              >
                <SidebarIcon name="login" />
                تسجيل الدخول
              </Link>
            )}
          </div>
        </aside>

        <div
          className={`min-h-screen flex-1 transition-[margin] duration-300 ease-in-out ${
            isDesktop && open ? "md:mr-72" : "md:mr-0"
          }`}
        >
          <header className="sticky top-0 z-30 border-b border-border bg-page/95 backdrop-blur-sm">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-surface text-ink transition-colors duration-200 ease-in-out hover:border-primary hover:text-primary"
                onClick={() => setOpen((current) => !current)}
                aria-label={open ? "إغلاق القائمة الجانبية" : "فتح القائمة الجانبية"}
              >
                {open ? "×" : "☰"}
              </button>
              <p className="text-base font-semibold text-ink sm:text-lg">{pageTitle}</p>
              <div className="h-11 w-11" aria-hidden />
            </div>
          </header>
          <main>{children}</main>
        </div>
      </div>
      {open && !isDesktop ? (
        <button
          aria-label="إغلاق طبقة القائمة الجانبية"
          className="fixed inset-0 z-30 bg-overlay/30 md:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      ) : null}
    </div>
  );
}
