"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ImageFieldInput } from "@/components/ui/image-field-input";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { settingsTabs, type SettingField, type SettingsTabId } from "@/lib/config/settings-tabs";
import { SystemSetting } from "@/lib/types";
import { parseApiResponse } from "@/lib/utils/client-api";
import { ensureImageUrl, ensureImageUrlList, getSettingImageFallback } from "@/lib/utils/image";
import { toSettingsMap } from "@/lib/utils/settings";

interface SettingsEditorProps {
  initialSettings: SystemSetting[];
  canEdit: boolean;
}

function parseBannerImages(value: string): string[] {
  return value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function ensureBannerImages(value: string): string[] {
  const parsed = parseBannerImages(value);
  return parsed.length > 0 ? parsed : [DEFAULT_IMAGE_URLS.banner];
}

function settingImageKind(key: string): "logo" | "hero" | "generic" {
  if (key === "profile.companyLogoUrl" || key === "footer.companyImageUrl") {
    return "logo";
  }

  if (key === "landing.hero.cardImage") {
    return "hero";
  }

  return "generic";
}

function TabIcon({ id }: { id: SettingsTabId }) {
  switch (id) {
    case "navbar":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 9h18" />
          <path d="M7 7h2" />
        </svg>
      );
    case "banner":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m7 15 3-3 2 2 4-4 2 2" />
          <circle cx="8" cy="8" r="1.5" />
        </svg>
      );
    case "hero":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16" />
          <path d="M4 12h10" />
          <path d="M4 18h8" />
          <rect x="16" y="10" width="4" height="8" rx="1" />
        </svg>
      );
    case "footer":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 16h18" />
          <path d="M8 18h8" />
        </svg>
      );
    default:
      return null;
  }
}

export function SettingsEditor({ initialSettings, canEdit }: SettingsEditorProps) {
  const [settings, setSettings] = useState<SystemSetting[]>(initialSettings);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialSettings.map((item) => [item.key, item.value]))
  );
  const [activeTab, setActiveTab] = useState<SettingsTabId>("navbar");
  const [busyTab, setBusyTab] = useState<SettingsTabId | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const settingsMap = useMemo(() => toSettingsMap(settings), [settings]);
  const currentTab = settingsTabs.find((item) => item.id === activeTab) ?? settingsTabs[0];

  const changedKeys = useMemo(() => {
    const changed = new Set<string>();

    for (const [key, value] of Object.entries(drafts)) {
      if ((settingsMap.get(key) ?? "") !== value) {
        changed.add(key);
      }
    }

    return changed;
  }, [drafts, settingsMap]);

  const changedCountByTab = useMemo(() => {
    const counts = new Map<SettingsTabId, number>();

    for (const tab of settingsTabs) {
      const total = tab.fields.reduce((sum, field) => sum + (changedKeys.has(field.key) ? 1 : 0), 0);
      counts.set(tab.id, total);
    }

    return counts;
  }, [changedKeys]);

  const totalFields = useMemo(() => settingsTabs.reduce((sum, tab) => sum + tab.fields.length, 0), []);
  const currentTabChangedCount = changedCountByTab.get(currentTab.id) ?? 0;
  const canSaveCurrentTab = currentTabChangedCount > 0;
  const bannerImages = ensureBannerImages(getDraftValue("landing.homeBannerImages"));

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

  function setBannerImages(images: string[]) {
    const normalized = images.map((item) => item.trim()).filter((item) => item.length > 0);
    const safeValues = normalized.length > 0 ? normalized : [DEFAULT_IMAGE_URLS.banner];
    const joined = safeValues.join("\n");

    setDrafts((current) => ({
      ...current,
      "landing.homeBannerImages": joined
    }));
  }

  function normalizeFieldValue(field: SettingField): string {
    const value = getDraftValue(field.key);

    if (field.kind === "image") {
      return ensureImageUrl(value, getSettingImageFallback(field.key));
    }

    if (field.kind === "image_list") {
      return ensureImageUrlList(parseBannerImages(value), DEFAULT_IMAGE_URLS.banner).join("\n");
    }

    return value;
  }

  function moveBannerImage(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= bannerImages.length) {
      return;
    }

    const next = [...bannerImages];
    [next[index], next[target]] = [next[target], next[index]];
    setBannerImages(next);
  }

  function resetTab(tabId: SettingsTabId) {
    const tab = settingsTabs.find((item) => item.id === tabId);

    if (!tab) {
      return;
    }

    setDrafts((current) => {
      const next = { ...current };

      for (const field of tab.fields) {
        next[field.key] = settingsMap.get(field.key) ?? "";
      }

      return next;
    });
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

  async function saveTab(tabId: SettingsTabId) {
    if (!canEdit) {
      return;
    }

    const tab = settingsTabs.find((item) => item.id === tabId);

    if (!tab) {
      return;
    }

    if (tabId === "banner") {
      const images = ensureBannerImages(getDraftValue("landing.homeBannerImages"));

      if (images.length === 0) {
        setNotice({ type: "error", message: "يجب إضافة صورة واحدة على الأقل في البانر." });
        return;
      }
    }

    const payload = tab.fields
      .filter((field) => changedKeys.has(field.key))
      .map((field) => ({ key: field.key, value: normalizeFieldValue(field) }));

    if (payload.length === 0) {
      setNotice({ type: "success", message: "لا توجد تغييرات جديدة للحفظ." });
      return;
    }

    setBusyTab(tabId);

    try {
      const response = await fetch("/api/settings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload })
      });

      const updated = await parseApiResponse<SystemSetting[]>(response);
      applyUpdatedSettings(updated);
      setNotice({ type: "success", message: "تم حفظ إعدادات القسم بنجاح." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "تعذر حفظ الإعدادات." });
    } finally {
      setBusyTab(null);
    }
  }

  return (
    <div className="space-y-6 fade-in">
      {notice ? <p className={notice.type === "success" ? "alert-success" : "alert-error"}>{notice.message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="self-start rounded-2xl border border-border bg-surface p-4 shadow-card xl:sticky xl:top-24">
          <h2 className="mb-1 text-lg font-bold text-ink">إعدادات الواجهة</h2>
          <p className="mb-4 text-sm text-subtext">أقسام التخصيص الأساسية للواجهة العامة.</p>

          <div className="space-y-2">
            {settingsTabs.map((tab) => {
              const changedCount = changedCountByTab.get(tab.id) ?? 0;
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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
                      <TabIcon id={tab.id} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{tab.title}</span>
                      <span className="mt-0.5 block text-xs">
                        {changedCount > 0 ? `${changedCount} تعديل غير محفوظ` : `${tab.fields.length} حقل`}
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
              <p className="text-xs text-subtext">القسم الحالي</p>
              <p className="mt-1 text-lg font-bold text-ink">{currentTab.title}</p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
              <p className="text-xs text-subtext">تعديلات هذا القسم</p>
              <p className="mt-1 text-lg font-bold text-ink">{currentTabChangedCount}</p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
              <p className="text-xs text-subtext">إجمالي تعديلات الواجهة</p>
              <p className="mt-1 text-lg font-bold text-ink">
                {changedKeys.size} / {totalFields}
              </p>
            </article>
          </div>

          <article className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-ink">{currentTab.title}</h3>
                <p className="mt-1 text-sm text-subtext">{currentTab.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/" className="btn-secondary bg-page px-4 py-2">
                  معاينة الموقع
                </Link>
                <button
                  type="button"
                  onClick={() => resetTab(currentTab.id)}
                  className="btn-secondary bg-page px-4 py-2"
                  disabled={busyTab !== null}
                >
                  إعادة القسم
                </button>
                <button
                  type="button"
                  onClick={() => void saveTab(currentTab.id)}
                  disabled={!canEdit || busyTab !== null || !canSaveCurrentTab}
                  className="btn-primary px-4 py-2"
                >
                  {busyTab === currentTab.id ? "جاري الحفظ..." : "حفظ القسم"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {currentTab.fields.map((field) => {
                const value = getDraftValue(field.key);
                const fieldChanged = changedKeys.has(field.key);

                if (field.kind === "image_list") {
                  return (
                    <article
                      key={field.key}
                      className={`rounded-xl border p-4 ${
                        fieldChanged ? "border-primary/40 bg-primary-soft/30" : "border-border bg-surface-soft"
                      }`}
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-ink">{field.label}</h4>
                          {field.help ? <p className="text-xs text-subtext">{field.help}</p> : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-border bg-page px-2 py-1 text-xs text-subtext">
                            {bannerImages.length} صور
                          </span>
                          <button
                            type="button"
                            onClick={() => setBannerImages([...bannerImages, DEFAULT_IMAGE_URLS.banner])}
                            disabled={!canEdit}
                            className="btn-secondary bg-page px-3 py-2"
                          >
                            إضافة صورة
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {bannerImages.length === 0 ? (
                          <p className="rounded-lg border border-warning-soft bg-warning-soft px-3 py-2 text-sm text-warning-text">
                            لا توجد صور حاليا. أضف صورة واحدة على الأقل.
                          </p>
                        ) : (
                          bannerImages.map((image, index) => (
                            <div key={`${field.key}-${index}`} className="rounded-lg border border-border bg-page p-3">
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-medium text-subtext">الصورة #{index + 1}</p>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => moveBannerImage(index, -1)}
                                    disabled={!canEdit || index === 0}
                                    className="btn-secondary bg-page px-3 py-1.5 text-xs disabled:opacity-60"
                                  >
                                    للأعلى
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveBannerImage(index, 1)}
                                    disabled={!canEdit || index === bannerImages.length - 1}
                                    className="btn-secondary bg-page px-3 py-1.5 text-xs disabled:opacity-60"
                                  >
                                    للأسفل
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = bannerImages.filter((_, itemIndex) => itemIndex !== index);
                                      setBannerImages(next);
                                    }}
                                    disabled={!canEdit}
                                    className="btn-secondary bg-page px-3 py-1.5 text-xs disabled:opacity-60"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>

                              <ImageFieldInput
                                id={`banner-image-${index}`}
                                label="رابط الصورة"
                                value={image}
                                onChange={(nextValue) => {
                                  const nextImages = [...bannerImages];
                                  nextImages[index] = nextValue;
                                  setBannerImages(nextImages);
                                }}
                                disabled={!canEdit}
                                scope="banner"
                                placeholderKind="banner"
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </article>
                  );
                }

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
                        {field.help ? <p className="mt-1 text-xs text-subtext">{field.help}</p> : null}
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
                    ) : field.kind === "image" ? (
                      <ImageFieldInput
                        id={`setting-${field.key}`}
                        label="رابط الصورة"
                        value={value}
                        onChange={(nextValue) => setDraftValue(field.key, nextValue)}
                        disabled={!canEdit}
                        scope="settings"
                        placeholderKind={settingImageKind(field.key)}
                      />
                    ) : field.kind === "select" ? (
                      <select
                        value={value}
                        disabled={!canEdit}
                        onChange={(event) => setDraftValue(field.key, event.target.value)}
                        className="input-field bg-page disabled:bg-muted"
                      >
                        {(field.options ?? []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.kind === "number" ? (
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        value={value}
                        disabled={!canEdit}
                        onChange={(event) => setDraftValue(field.key, event.target.value)}
                        className="input-field bg-page disabled:bg-muted"
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
              })}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
