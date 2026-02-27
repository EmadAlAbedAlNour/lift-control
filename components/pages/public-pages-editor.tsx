"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { publicPagesConfig, type PublicPageId } from "@/lib/config/public-pages";
import { SystemSetting } from "@/lib/types";
import { parseApiResponse } from "@/lib/utils/client-api";
import { toSettingsMap } from "@/lib/utils/settings";

interface PublicPagesEditorProps {
  initialSettings: SystemSetting[];
  canEdit: boolean;
}

function PageIcon({ id }: { id: PublicPageId }) {
  switch (id) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m3 11 9-7 9 7" />
          <path d="M5 10.5V20h14v-9.5" />
        </svg>
      );
    case "services":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 0 1-2.6 2.6l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 1 1-3.6 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 1 1 0-3.6h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.8 1.8 0 1 1 3.6 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1.8 1.8 0 1 1 0 3.6h-.2a1 1 0 0 0-.9.6Z" />
        </svg>
      );
    case "products":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m3 7 9-4 9 4-9 4-9-4Z" />
          <path d="m3 7 9 4 9-4" />
          <path d="M3 7v10l9 4 9-4V7" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
        </svg>
      );
    case "about":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 17v-5" />
          <path d="M12 8h.01" />
        </svg>
      );
    case "contact":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    default:
      return null;
  }
}

export function PublicPagesEditor({ initialSettings, canEdit }: PublicPagesEditorProps) {
  const [settings, setSettings] = useState<SystemSetting[]>(initialSettings);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialSettings.map((item) => [item.key, item.value]))
  );
  const [activePage, setActivePage] = useState<PublicPageId>("home");
  const [busyPage, setBusyPage] = useState<PublicPageId | null>(null);
  const [fieldQuery, setFieldQuery] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const settingsMap = useMemo(() => toSettingsMap(settings), [settings]);
  const currentPage = publicPagesConfig.find((item) => item.id === activePage) ?? publicPagesConfig[0];

  const changedKeys = useMemo(() => {
    const changed = new Set<string>();

    for (const [key, value] of Object.entries(drafts)) {
      if ((settingsMap.get(key) ?? "") !== value) {
        changed.add(key);
      }
    }

    return changed;
  }, [drafts, settingsMap]);

  const changedCountByPage = useMemo(() => {
    const counts = new Map<PublicPageId, number>();

    for (const page of publicPagesConfig) {
      const count = page.fields.reduce((sum, field) => sum + (changedKeys.has(field.key) ? 1 : 0), 0);
      counts.set(page.id, count);
    }

    return counts;
  }, [changedKeys]);

  const filteredFields = useMemo(() => {
    const query = fieldQuery.trim().toLowerCase();

    if (query.length === 0) {
      return currentPage.fields;
    }

    return currentPage.fields.filter(
      (field) => field.label.toLowerCase().includes(query) || field.key.toLowerCase().includes(query)
    );
  }, [currentPage.fields, fieldQuery]);

  const currentPageChangedCount = changedCountByPage.get(currentPage.id) ?? 0;
  const canSaveCurrentPage = currentPageChangedCount > 0;
  const totalFields = useMemo(() => publicPagesConfig.reduce((sum, page) => sum + page.fields.length, 0), []);

  useEffect(() => {
    if (!notice) return;

    const timeout = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timeout);
  }, [notice]);

  function getDraftValue(key: string): string {
    return drafts[key] ?? settingsMap.get(key) ?? "";
  }

  function setDraftValue(key: string, value: string) {
    setDrafts((current) => ({ ...current, [key]: value }));
  }

  function applyUpdatedSettings(updated: SystemSetting[]) {
    const byKey = new Map(updated.map((item) => [item.key, item]));

    setSettings((current) => {
      const merged = new Map(current.map((item) => [item.key, item]));

      for (const item of updated) {
        merged.set(item.key, item);
      }

      return [...merged.values()].sort((a, b) => a.key.localeCompare(b.key));
    });

    setDrafts((current) => {
      const next = { ...current };

      for (const [key, value] of byKey.entries()) {
        next[key] = value.value;
      }

      return next;
    });
  }

  function resetPage(pageId: PublicPageId) {
    const page = publicPagesConfig.find((item) => item.id === pageId);

    if (!page) {
      return;
    }

    setDrafts((current) => {
      const next = { ...current };

      for (const field of page.fields) {
        next[field.key] = settingsMap.get(field.key) ?? "";
      }

      return next;
    });
  }

  async function savePage(pageId: PublicPageId) {
    if (!canEdit) {
      return;
    }

    const page = publicPagesConfig.find((item) => item.id === pageId);

    if (!page) {
      return;
    }

    const payload = page.fields
      .map((field) => field.key)
      .filter((key) => changedKeys.has(key))
      .map((key) => ({ key, value: getDraftValue(key) }));

    if (payload.length === 0) {
      setNotice({ type: "success", message: "لا توجد تغييرات جديدة للحفظ." });
      return;
    }

    setBusyPage(pageId);

    try {
      const response = await fetch("/api/settings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload })
      });

      const updated = await parseApiResponse<SystemSetting[]>(response);
      applyUpdatedSettings(updated);
      setNotice({ type: "success", message: "تم حفظ تعديلات الصفحة." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "تعذر حفظ التعديلات." });
    } finally {
      setBusyPage(null);
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {notice ? <p className={notice.type === "success" ? "alert-success" : "alert-error"}>{notice.message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="self-start rounded-2xl border border-border bg-surface p-4 shadow-card xl:sticky xl:top-24">
          <h2 className="mb-1 text-lg font-bold text-ink">الصفحات الخارجية</h2>
          <p className="mb-4 text-sm text-subtext">إدارة وتحرير محتوى صفحات الواجهة فقط.</p>

          <div className="space-y-2">
            {publicPagesConfig.map((page) => {
              const isActive = page.id === activePage;
              const changedCount = changedCountByPage.get(page.id) ?? 0;

              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    setActivePage(page.id);
                    setFieldQuery("");
                  }}
                  className={`w-full rounded-xl border px-3 py-3 text-right transition-colors ${
                    isActive ? "border-primary bg-primary-soft text-primary" : "border-border bg-page text-subtext hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                        isActive ? "bg-primary/10" : "bg-surface"
                      }`}
                    >
                      <PageIcon id={page.id} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{page.title}</span>
                      <span className="mt-0.5 block text-xs">
                        {changedCount > 0 ? `${changedCount} تعديل غير محفوظ` : page.path}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
              <p className="text-xs text-subtext">الصفحة الحالية</p>
              <p className="mt-1 text-lg font-bold text-ink">{currentPage.title}</p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
              <p className="text-xs text-subtext">تعديلات الصفحة الحالية</p>
              <p className="mt-1 text-lg font-bold text-ink">{currentPageChangedCount}</p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
              <p className="text-xs text-subtext">إجمالي التعديلات</p>
              <p className="mt-1 text-lg font-bold text-ink">
                {changedKeys.size} / {totalFields}
              </p>
            </article>
          </div>

          <article className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-ink">{currentPage.title}</h3>
                <p className="mt-1 text-sm text-subtext">{currentPage.description}</p>
                <p className="mt-1 text-xs text-subtext">{currentPage.path}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={currentPage.path} className="btn-secondary bg-page px-4 py-2">
                  فتح الصفحة
                </Link>
                <button
                  type="button"
                  onClick={() => resetPage(currentPage.id)}
                  className="btn-secondary bg-page px-4 py-2"
                  disabled={busyPage !== null}
                >
                  إعادة الصفحة
                </button>
                <button
                  type="button"
                  onClick={() => void savePage(currentPage.id)}
                  className="btn-primary px-4 py-2"
                  disabled={!canEdit || busyPage !== null || !canSaveCurrentPage}
                >
                  {busyPage === currentPage.id ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-border bg-surface-soft p-3">
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="page-field-filter">
                بحث داخل حقول الصفحة
              </label>
              <input
                id="page-field-filter"
                type="text"
                value={fieldQuery}
                onChange={(event) => setFieldQuery(event.target.value)}
                placeholder="ابحث بالعنوان أو بالمفتاح..."
                className="input-field bg-page"
              />
            </div>

            <div className="space-y-4">
              {filteredFields.length === 0 ? (
                <p className="rounded-xl border border-border bg-surface-soft p-4 text-sm text-subtext">
                  لا توجد حقول مطابقة لكلمة البحث.
                </p>
              ) : (
                filteredFields.map((field) => {
                  const value = getDraftValue(field.key);
                  const fieldChanged = changedKeys.has(field.key);

                  return (
                    <article
                      key={field.key}
                      className={`rounded-xl border p-4 ${
                        fieldChanged ? "border-primary/40 bg-primary-soft/30" : "border-border bg-surface-soft"
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-ink">{field.label}</p>
                          <p className="text-xs text-subtext">{field.key}</p>
                        </div>
                        <span
                          className={`rounded-md px-2 py-1 text-xs ${
                            fieldChanged ? "bg-primary-soft text-primary" : "bg-page text-subtext"
                          }`}
                        >
                          {fieldChanged ? "غير محفوظ" : "محفوظ"}
                        </span>
                      </div>

                      {field.kind === "textarea" ? (
                        <textarea
                          rows={field.rows ?? 4}
                          value={value}
                          disabled={!canEdit}
                          onChange={(event) => setDraftValue(field.key, event.target.value)}
                          className="w-full rounded-md border border-border bg-page px-4 py-3 text-base text-ink focus:border-primary focus:outline-none disabled:bg-muted"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          disabled={!canEdit}
                          onChange={(event) => setDraftValue(field.key, event.target.value)}
                          className="input-field bg-page disabled:bg-muted"
                        />
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
