"use client";

import { StatusPill } from "@/components/ui/status-pill";
import {
  PROJECT_STATUS_OPTIONS_AR,
  PROJECT_TYPE_LABELS_SHORT_AR,
  PROJECT_TYPE_OPTIONS_AR
} from "@/lib/constants/projects";
import { LiftProject } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

interface CatalogBrowserProps {
  projects: LiftProject[];
}

const typeLabels = PROJECT_TYPE_LABELS_SHORT_AR;

export function CatalogBrowser({ projects }: CatalogBrowserProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const normalizedQuery = query.trim().toLowerCase();
  const hasActiveFilters = normalizedQuery.length > 0 || status !== "all" || type !== "all";

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : project.title.toLowerCase().includes(normalizedQuery) ||
            project.location.toLowerCase().includes(normalizedQuery) ||
            project.clientName.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "all" ? true : project.status === status;
      const matchesType = type === "all" ? true : project.type === type;

      return matchesQuery && matchesStatus && matchesType;
    });
  }, [projects, normalizedQuery, status, type]);

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setType("all");
  }

  return (
    <section className="space-y-8">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-ink">البحث والتصفية</h2>
          {hasActiveFilters ? (
            <button type="button" onClick={resetFilters} className="btn-secondary bg-page px-4 py-2 font-medium">
              إعادة الضبط
            </button>
          ) : null}
        </div>
        <p className="mb-6 text-sm text-subtext">
          استخدم الفلاتر للوصول السريع للمشاريع حسب الحالة والنوع. النتائج تتحدث مباشرة أثناء الكتابة.
        </p>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink" htmlFor="search">
              بحث
            </label>
            <input
              id="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بالعنوان أو الموقع أو العميل"
              className="input-field bg-page"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink" htmlFor="status">
              الحالة
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="input-field bg-page"
            >
              <option value="all">كل الحالات</option>
              {PROJECT_STATUS_OPTIONS_AR.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink" htmlFor="type">
              النوع
            </label>
            <select
              id="type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="input-field bg-page"
            >
              <option value="all">كل الأنواع</option>
              {PROJECT_TYPE_OPTIONS_AR.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-subtext">
        عدد النتائج الحالية: {filtered.length} من إجمالي {projects.length} مشروع
      </div>

      <div className="grid gap-4 sm:gap-6 lg:gap-8">
        {filtered.map((project) => (
          <article
            key={project.id}
            className="grid gap-6 rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8 lg:grid-cols-[1.2fr_auto]"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold tracking-tight text-ink">{project.title}</h3>
                <StatusPill status={project.status} />
              </div>
              <p className="text-base leading-relaxed text-subtext">{project.summary}</p>
              <div className="grid gap-3 text-sm text-subtext sm:grid-cols-2 lg:grid-cols-3">
                <p>
                  <span className="font-medium text-ink">النوع:</span> {typeLabels[project.type]}
                </p>
                <p>
                  <span className="font-medium text-ink">الموقع:</span> {project.location}
                </p>
                <p>
                  <span className="font-medium text-ink">الزيارة القادمة:</span> {project.nextVisit}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href={`/catalog/${project.id}`}
                className="btn-secondary bg-page px-4 py-2 font-medium"
              >
                صفحة العرض
              </Link>
            </div>
          </article>
        ))}

        {filtered.length === 0 ? (
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <p className="mb-4 text-base text-subtext">لا توجد نتائج مطابقة للبحث الحالي.</p>
            {hasActiveFilters ? (
              <button type="button" onClick={resetFilters} className="btn-secondary bg-page px-4 py-2 font-medium">
                مسح الفلاتر وعرض الكل
              </button>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}
