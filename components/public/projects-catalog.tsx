"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import {
  PROJECT_STATUS_OPTIONS_AR,
  PROJECT_TYPE_LABELS_LONG_AR,
  PROJECT_TYPE_OPTIONS_AR
} from "@/lib/constants/projects";
import { LiftProject } from "@/lib/types";

interface PublicProjectsCatalogProps {
  projects: LiftProject[];
}

const typeLabels = PROJECT_TYPE_LABELS_LONG_AR;

export function PublicProjectsCatalog({ projects }: PublicProjectsCatalogProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const normalizedQuery = query.trim().toLowerCase();
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
  }, [projects, query, status, type]);

  return (
    <section className="space-y-8">
      <article className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">ابحث عن مشروع مناسب لاحتياجك</h2>
        <p className="mb-6 max-w-2xl text-base leading-relaxed text-subtext">
          يمكنك تصفية المشاريع حسب الحالة ونوع المصعد، ثم فتح صفحة كل مشروع للاطلاع على المواصفات وخطة
          الصيانة.
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
              placeholder="ابحث بالاسم أو الموقع أو العميل"
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
              نوع المصعد
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
      </article>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-subtext sm:p-5">
        <p>عدد النتائج: {filtered.length}</p>
        <p>إجمالي المشاريع: {projects.length}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
        {filtered.map((project) => (
          <article key={project.id} className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tight text-ink">{project.title}</h3>
              <StatusPill status={project.status} />
            </div>

            <p className="mb-4 text-sm leading-relaxed text-subtext">{project.summary}</p>

            <div className="mb-6 space-y-2 text-sm text-subtext">
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

            <Link
              href={`/projects/${project.id}`}
              className="btn-secondary bg-page px-4 py-2"
            >
              عرض تفاصيل المشروع
            </Link>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <article className="rounded-xl border border-border bg-surface p-6 text-base leading-relaxed text-subtext shadow-card sm:p-8">
          لا توجد مشاريع مطابقة للفلاتر الحالية. جرّب تغيير الحالة أو نوع المصعد أو كلمات البحث.
        </article>
      ) : null}
    </section>
  );
}
