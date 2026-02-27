"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ImageFieldInput } from "@/components/ui/image-field-input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { StatusPill } from "@/components/ui/status-pill";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import {
  PROJECT_STATUS_OPTIONS_AR,
  PROJECT_TYPE_LABELS_SHORT_AR,
  PROJECT_TYPE_OPTIONS_AR
} from "@/lib/constants/projects";
import { INPUT_FIELD_CLASS } from "@/lib/constants/ui";
import { LiftProject } from "@/lib/types";
import { parseApiResponse } from "@/lib/utils/client-api";
import { addDaysKey, getTodayLocalDate, toDateKey } from "@/lib/utils/date";
import { ensureImageUrl } from "@/lib/utils/image";

interface ProjectManagementProps {
  initialProjects: LiftProject[];
  canEdit: boolean;
  canDelete: boolean;
}

type Notice = {
  type: "success" | "error";
  text: string;
};

type StatusFilter = "all" | LiftProject["status"];
type TypeFilter = "all" | LiftProject["type"];

type ProjectDraft = {
  title: string;
  location: string;
  clientName: string;
  type: LiftProject["type"];
  floors: number;
  status: LiftProject["status"];
  nextVisit: string;
  summary: string;
  speedMps: number;
  loadKg: number;
  warrantyMonths: number;
  coverImage: string;
};

const fieldClass = INPUT_FIELD_CLASS;
const typeLabels = PROJECT_TYPE_LABELS_SHORT_AR;

function emptyProjectDraft(): ProjectDraft {
  return {
    title: "",
    location: "",
    clientName: "",
    type: "passenger",
    floors: 6,
    status: "planned",
    nextVisit: getTodayLocalDate(),
    summary: "",
    speedMps: 1,
    loadKg: 800,
    warrantyMonths: 24,
    coverImage: DEFAULT_IMAGE_URLS.project
  };
}

function draftFromProject(project: LiftProject): ProjectDraft {
  return {
    title: project.title,
    location: project.location,
    clientName: project.clientName,
    type: project.type,
    floors: project.floors,
    status: project.status,
    nextVisit: project.nextVisit,
    summary: project.summary,
    speedMps: project.specs.speedMps,
    loadKg: project.specs.loadKg,
    warrantyMonths: project.specs.warrantyMonths,
    coverImage: ensureImageUrl(project.coverImage, DEFAULT_IMAGE_URLS.project)
  };
}

function payloadFromDraft(draft: ProjectDraft) {
  return {
    title: draft.title,
    location: draft.location,
    clientName: draft.clientName,
    type: draft.type,
    floors: Number(draft.floors),
    status: draft.status,
    nextVisit: draft.nextVisit,
    summary: draft.summary,
    specs: {
      speedMps: Number(draft.speedMps),
      loadKg: Number(draft.loadKg),
      warrantyMonths: Number(draft.warrantyMonths)
    },
    coverImage: ensureImageUrl(draft.coverImage, DEFAULT_IMAGE_URLS.project)
  };
}

export function ProjectManagement({ initialProjects, canEdit, canDelete }: ProjectManagementProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [draft, setDraft] = useState<ProjectDraft>(emptyProjectDraft());
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const formRef = useRef<HTMLElement | null>(null);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((item) => item.status !== "completed").length;
  const completedProjects = projects.filter((item) => item.status === "completed").length;
  const completionRate = totalProjects === 0 ? 0 : Math.round((completedProjects / totalProjects) * 100);
  const todayKey = toDateKey(new Date());
  const nextWeekKey = addDaysKey(new Date(), 7);
  const dueSoonCount = projects.filter(
    (item) => item.status !== "completed" && item.nextVisit >= todayKey && item.nextVisit <= nextWeekKey
  ).length;

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : project.title.toLowerCase().includes(normalizedQuery) ||
            project.location.toLowerCase().includes(normalizedQuery) ||
            project.clientName.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" ? true : project.status === statusFilter;
      const matchesType = typeFilter === "all" ? true : project.type === typeFilter;

      return matchesQuery && matchesStatus && matchesType;
    });
  }, [projects, query, statusFilter, typeFilter]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  function showNotice(type: Notice["type"], text: string) {
    setNotice({ type, text });
  }

  function resetForm() {
    setEditingProjectId(null);
    setDraft(emptyProjectDraft());
  }

  function startEdit(project: LiftProject) {
    if (!canEdit) {
      return;
    }

    setEditingProjectId(project.id);
    setDraft(draftFromProject(project));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    setBusyKey("project-save");

    try {
      const payload = payloadFromDraft(draft);
      const response = await fetch(editingProjectId ? `/api/content/${editingProjectId}` : "/api/content", {
        method: editingProjectId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const saved = await parseApiResponse<LiftProject>(response);
      setProjects((current) =>
        editingProjectId ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current]
      );
      showNotice("success", editingProjectId ? "تم تحديث المشروع بنجاح." : "تمت إضافة المشروع بنجاح.");
      resetForm();
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "حدث خطأ أثناء حفظ المشروع.");
    } finally {
      setBusyKey(null);
    }
  }

  async function updateProjectStatus(projectId: string, status: LiftProject["status"]) {
    if (!canEdit) {
      return;
    }

    setBusyKey(`project-status-${projectId}`);

    try {
      const response = await fetch(`/api/content/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      const updated = await parseApiResponse<LiftProject>(response);
      setProjects((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      showNotice("success", "تم تحديث حالة المشروع.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر تحديث حالة المشروع.");
    } finally {
      setBusyKey(null);
    }
  }

  async function deleteProject(projectId: string) {
    if (!canDelete) {
      return;
    }

    if (!window.confirm("هل أنت متأكد من حذف المشروع؟")) {
      return;
    }

    setBusyKey(`project-delete-${projectId}`);

    try {
      const response = await fetch(`/api/content/${projectId}`, { method: "DELETE" });
      await parseApiResponse<{ id: string; deleted: boolean }>(response);
      setProjects((current) => current.filter((item) => item.id !== projectId));
      showNotice("success", "تم حذف المشروع.");

      if (editingProjectId === projectId) {
        resetForm();
      }
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حذف المشروع.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {notice ? (
        <div className={notice.type === "success" ? "alert-success" : "alert-error"}>{notice.text}</div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">إجمالي المشاريع</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{totalProjects}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">المشاريع النشطة</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{activeProjects}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">نسبة الإنجاز</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{completionRate}%</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">تتطلب متابعة خلال 7 أيام</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{dueSoonCount}</p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section ref={formRef} className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5 space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {editingProjectId ? "تعديل مشروع" : "إضافة مشروع جديد"}
            </h2>
            <p className="text-sm text-subtext">
              أدخل بيانات المشروع كاملة لضمان ظهورها بشكل صحيح في لوحة الإدارة وصفحة العرض.
            </p>
          </div>

          {!canEdit ? (
            <div className="alert-error mb-5">صلاحية حسابك عرض فقط. لا يمكنك إضافة أو تعديل المشاريع.</div>
          ) : null}

          <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProject}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-title">
                عنوان المشروع
              </label>
              <input
                id="project-title"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="مثال: برج النخيل"
                required
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-client">
                اسم العميل
              </label>
              <input
                id="project-client"
                value={draft.clientName}
                onChange={(event) => setDraft((current) => ({ ...current, clientName: event.target.value }))}
                placeholder="اسم العميل"
                required
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-location">
                الموقع
              </label>
              <input
                id="project-location"
                value={draft.location}
                onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                placeholder="المدينة أو المنطقة"
                required
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-next-visit">
                تاريخ الزيارة القادمة
              </label>
              <input
                id="project-next-visit"
                type="date"
                value={draft.nextVisit}
                onChange={(event) => setDraft((current) => ({ ...current, nextVisit: event.target.value }))}
                required
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-type">
                نوع المصعد
              </label>
              <select
                id="project-type"
                value={draft.type}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, type: event.target.value as LiftProject["type"] }))
                }
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              >
                {PROJECT_TYPE_OPTIONS_AR.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-status">
                الحالة
              </label>
              <select
                id="project-status"
                value={draft.status}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, status: event.target.value as LiftProject["status"] }))
                }
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              >
                {PROJECT_STATUS_OPTIONS_AR.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-floors">
                عدد الطوابق
              </label>
              <input
                id="project-floors"
                type="number"
                min={1}
                max={120}
                value={draft.floors}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, floors: Number(event.target.value) || 0 }))
                }
                required
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-speed">
                السرعة (م/ث)
              </label>
              <input
                id="project-speed"
                type="number"
                min={0.5}
                max={8}
                step={0.1}
                value={draft.speedMps}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, speedMps: Number(event.target.value) || 0 }))
                }
                required
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-load">
                الحمولة (كجم)
              </label>
              <input
                id="project-load"
                type="number"
                min={300}
                max={8000}
                value={draft.loadKg}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, loadKg: Number(event.target.value) || 0 }))
                }
                required
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-warranty">
                الضمان (شهر)
              </label>
              <input
                id="project-warranty"
                type="number"
                min={6}
                max={60}
                value={draft.warrantyMonths}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, warrantyMonths: Number(event.target.value) || 0 }))
                }
                required
                disabled={!canEdit}
                className={`${fieldClass} disabled:bg-muted`}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-ink" htmlFor="project-summary">
                ملخص المشروع
              </label>
              <textarea
                id="project-summary"
                rows={4}
                value={draft.summary}
                onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
                placeholder="وصف مختصر يوضح طبيعة العمل وحالة المشروع"
                required
                disabled={!canEdit}
                className="w-full rounded-md border border-border bg-page px-4 py-3 text-base text-ink focus:border-primary focus:outline-none disabled:bg-muted"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <ImageFieldInput
                id="project-image"
                label="صورة المشروع"
                value={draft.coverImage}
                onChange={(nextValue) => setDraft((current) => ({ ...current, coverImage: nextValue }))}
                disabled={!canEdit}
                scope="projects"
                placeholderKind="project"
              />
            </div>

            {canEdit ? (
              <button type="submit" disabled={busyKey === "project-save"} className="btn-primary sm:col-span-2">
                {busyKey === "project-save" ? "جاري الحفظ..." : editingProjectId ? "حفظ التعديلات" : "إضافة المشروع"}
              </button>
            ) : null}

            {editingProjectId && canEdit ? (
              <button type="button" onClick={resetForm} className="btn-secondary bg-white sm:col-span-2">
                إلغاء التعديل
              </button>
            ) : null}
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold tracking-tight text-ink">قائمة المشاريع</h2>
              <span className="rounded-md border border-border bg-page px-3 py-1 text-xs font-semibold text-subtext">
                النتائج الحالية: {filteredProjects.length}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-ink" htmlFor="search-projects">
                  بحث
                </label>
                <input
                  id="search-projects"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث بالعنوان أو العميل أو الموقع"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink" htmlFor="filter-status">
                  الحالة
                </label>
                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className={fieldClass}
                >
                  <option value="all">كل الحالات</option>
                  {PROJECT_STATUS_OPTIONS_AR.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 sm:col-span-3">
                <label className="text-sm font-medium text-ink" htmlFor="filter-type">
                  النوع
                </label>
                <select
                  id="filter-type"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                  className={fieldClass}
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

          {filteredProjects.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-subtext">
              لا توجد مشاريع مطابقة للبحث أو الفلاتر الحالية.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const isStatusBusy = busyKey === `project-status-${project.id}`;
                const isDeleteBusy = busyKey === `project-delete-${project.id}`;

                return (
                  <article key={project.id} className="rounded-xl border border-border bg-surface-soft p-4">
                    <div className="grid gap-4 lg:grid-cols-[120px_1fr_auto]">
                      <div className="overflow-hidden rounded-lg border border-border bg-page">
                        <ImageWithFallback
                          src={ensureImageUrl(project.coverImage, DEFAULT_IMAGE_URLS.project)}
                          alt={`صورة مشروع ${project.title}`}
                          width={240}
                          height={160}
                          className="h-24 w-full object-cover"
                          kind="project"
                          placeholderClassName="bg-surface-soft"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-ink">{project.title}</p>
                          <StatusPill status={project.status} />
                        </div>
                        <p className="text-sm leading-relaxed text-subtext">{project.summary}</p>
                        <div className="grid gap-2 text-sm text-subtext sm:grid-cols-2">
                          <p>
                            <span className="font-medium text-ink">العميل:</span> {project.clientName}
                          </p>
                          <p>
                            <span className="font-medium text-ink">الموقع:</span> {project.location}
                          </p>
                          <p>
                            <span className="font-medium text-ink">النوع:</span> {typeLabels[project.type]}
                          </p>
                          <p>
                            <span className="font-medium text-ink">الزيارة القادمة:</span> {project.nextVisit}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-start gap-2 lg:flex-col">
                        <Link href={`/catalog/${project.id}`} className="btn-secondary bg-white px-4 py-2">
                          التفاصيل
                        </Link>
                        {canEdit ? (
                          <button type="button" onClick={() => startEdit(project)} className="btn-secondary bg-white px-4 py-2">
                            تعديل
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => deleteProject(project.id)}
                            disabled={isDeleteBusy}
                            className="btn-danger"
                          >
                            {isDeleteBusy ? "جاري الحذف..." : "حذف"}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {canEdit ? (
                      <div className="mt-4 max-w-56">
                        <label className="mb-2 block text-xs font-semibold text-subtext" htmlFor={`status-${project.id}`}>
                          تحديث الحالة
                        </label>
                        <select
                          id={`status-${project.id}`}
                          value={project.status}
                          disabled={isStatusBusy}
                          onChange={(event) => updateProjectStatus(project.id, event.target.value as LiftProject["status"])}
                          className={`${fieldClass} disabled:bg-muted`}
                        >
                          {PROJECT_STATUS_OPTIONS_AR.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
