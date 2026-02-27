"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { PublicNavItem, publicNavItems } from "@/lib/public-navigation";
import { toTelHref } from "@/lib/utils/text";

interface PublicHeaderProps {
  companyName: string;
  companyTagline: string;
  supportPhone: string;
  logoUrl?: string;
  navItems?: PublicNavItem[];
  clientLoginLabel?: string;
}

function CompanyLogo({
  companyName,
  logoUrl
}: {
  companyName: string;
  logoUrl?: string;
}) {
  return (
    <span className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-page">
      <ImageWithFallback
        src={logoUrl}
        alt={`شعار ${companyName}`}
        fill
        sizes="56px"
        className="object-cover"
        kind="logo"
      />
    </span>
  );
}

function isItemActive(pathname: string, item: PublicNavItem): boolean {
  if (item.key === "home") {
    return pathname === "/";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function PublicHeader({
  companyName,
  companyTagline,
  supportPhone,
  logoUrl,
  navItems = publicNavItems,
  clientLoginLabel = "دخول العملاء"
}: PublicHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const phoneHref = useMemo(() => toTelHref(supportPhone), [supportPhone]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white shadow-[0_10px_28px_rgba(15,76,92,0.1)]">
      <div className="container-shell">
        <div className="flex h-[92px] items-center justify-between gap-4">
          <Link className="flex min-w-0 items-center gap-3" href="/">
            <CompanyLogo companyName={companyName} logoUrl={logoUrl} />
            <span className="min-w-0">
              <span className="block truncate text-xl font-bold tracking-tight text-ink">{companyName}</span>
              <span className="block truncate text-xs text-subtext">{companyTagline}</span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
            {navItems.map((item) => {
              const active = isItemActive(pathname, item);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative min-h-11 px-4 py-2 text-base font-semibold transition-colors duration-200 ${
                    active ? "text-primary" : "text-ink hover:text-primary"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute inset-x-3 bottom-0 h-[3px] origin-right rounded-full bg-primary transition-transform duration-200 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={phoneHref}
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-page px-4 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
            >
              {supportPhone}
            </a>
            <Link href="/auth/login" className="btn-primary rounded-full px-5 py-2">
              {clientLoginLabel}
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={phoneHref}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-page px-3 text-sm font-semibold text-ink"
              aria-label="اتصال مباشر"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
                <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h3A1.5 1.5 0 0 1 10 5.5v2.8a1.5 1.5 0 0 1-1.1 1.45l-1 .27a13 13 0 0 0 6.2 6.2l.27-1A1.5 1.5 0 0 1 15.8 14h2.7a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 18.5 20C10.49 20 4 13.51 4 5.5z" />
              </svg>
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="تبديل قائمة التنقل"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-surface text-ink transition-colors duration-200 ease-in-out hover:border-primary hover:text-primary"
              onClick={() => setOpen((current) => !current)}
            >
              <span className="text-lg">{open ? "×" : "☰"}</span>
            </button>
          </div>
        </div>
      </div>

      <nav
        id="mobile-menu"
        className={`overflow-hidden border-t border-border bg-surface lg:hidden ${
          open ? "max-h-[640px]" : "max-h-0"
        } transition-[max-height] duration-300 ease-in-out`}
        aria-label="التنقل للجوال"
      >
        <div className="container-shell py-4">
          <div className="mb-4 rounded-xl border border-border bg-page px-4 py-3">
            <p className="text-sm font-semibold text-ink">{companyName}</p>
            <p className="text-xs text-subtext">{companyTagline}</p>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isItemActive(pathname, item);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`block min-h-11 rounded-lg px-3 py-3 text-base font-semibold ${
                    active ? "bg-primary-soft text-primary" : "text-ink hover:bg-page"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 border-t border-border pt-4">
            <a href={phoneHref} className="btn-secondary bg-page px-4 py-2" onClick={() => setOpen(false)}>
              {supportPhone}
            </a>
            <Link href="/auth/login" className="btn-primary px-4 py-2" onClick={() => setOpen(false)}>
              {clientLoginLabel}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
