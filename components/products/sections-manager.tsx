"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ImageFieldInput } from "@/components/ui/image-field-input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { INPUT_FIELD_CLASS } from "@/lib/constants/ui";
import { ProductSection } from "@/lib/types";
import { parseApiResponse } from "@/lib/utils/client-api";
import { ensureImageUrl } from "@/lib/utils/image";

interface SectionsManagerProps {
  initialSections: ProductSection[];
}

type Notice = {
  type: "success" | "error";
  text: string;
};

type SectionDraft = {
  name: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
};

const fieldClass = INPUT_FIELD_CLASS;

function emptySectionDraft(): SectionDraft {
  return {
    name: "",
    description: "",
    imageUrl: DEFAULT_IMAGE_URLS.section,
    sortOrder: 0
  };
}

function draftFromSection(section: ProductSection): SectionDraft {
  return {
    name: section.name,
    description: section.description ?? "",
    imageUrl: ensureImageUrl(section.imageUrl, DEFAULT_IMAGE_URLS.section),
    sortOrder: section.sortOrder
  };
}

function sortSections(items: ProductSection[]): ProductSection[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function SectionsManager({ initialSections }: SectionsManagerProps) {
  const [sections, setSections] = useState<ProductSection[]>(sortSections(initialSections));
  const [draft, setDraft] = useState<SectionDraft>(emptySectionDraft());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const totalProducts = useMemo(
    () => sections.reduce((acc, section) => acc + section.products.length, 0),
    [sections]
  );
  const activeProducts = useMemo(
    () =>
      sections.reduce((acc, section) => acc + section.products.filter((item) => item.isActive).length, 0),
    [sections]
  );

  const filteredSections = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (normalized.length === 0) {
      return sections;
    }

    return sections.filter(
      (section) =>
        section.name.toLowerCase().includes(normalized) ||
        (section.description ?? "").toLowerCase().includes(normalized)
    );
  }, [sections, search]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);

  function showNotice(type: Notice["type"], text: string) {
    setNotice({ type, text });
  }

  function resetForm() {
    setEditingSectionId(null);
    setDraft(emptySectionDraft());
  }

  function beginEdit(section: ProductSection) {
    setEditingSectionId(section.id);
    setDraft(draftFromSection(section));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyKey("section-save");

    try {
      const payload = {
        name: draft.name,
        description: draft.description,
        imageUrl: ensureImageUrl(draft.imageUrl, DEFAULT_IMAGE_URLS.section),
        sortOrder: Number(draft.sortOrder) || 0
      };
      const response = await fetch(editingSectionId ? `/api/product-sections/${editingSectionId}` : "/api/product-sections", {
        method: editingSectionId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const saved = await parseApiResponse<ProductSection>(response);
      setSections((current) =>
        sortSections(
          editingSectionId
            ? current.map((item) => (item.id === saved.id ? saved : item))
            : [...current, saved]
        )
      );
      showNotice("success", editingSectionId ? "تم تحديث القسم." : "تم إنشاء القسم.");
      resetForm();
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حفظ القسم.");
    } finally {
      setBusyKey(null);
    }
  }

  async function deleteSection(sectionId: string) {
    if (!window.confirm("حذف هذا القسم سيحذف كل المنتجات بداخله. هل تريد المتابعة؟")) {
      return;
    }

    setBusyKey(`section-delete-${sectionId}`);

    try {
      const response = await fetch(`/api/product-sections/${sectionId}`, { method: "DELETE" });
      await parseApiResponse<{ id: string; deleted: boolean }>(response);
      setSections((current) => current.filter((item) => item.id !== sectionId));

      if (editingSectionId === sectionId) {
        resetForm();
      }

      showNotice("success", "تم حذف القسم.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حذف القسم.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {notice ? <div className={notice.type === "success" ? "alert-success" : "alert-error"}>{notice.text}</div> : null}

      <section className="grid gap-4 sm:grid-cols-3 lg:gap-6">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">إجمالي الأقسام</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{sections.length}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">المنتجات المرتبطة</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{totalProducts}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">منتجات مفعلة</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{activeProducts}</p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {editingSectionId ? "تعديل قسم" : "إضافة قسم جديد"}
            </h2>
            <p className="mt-1 text-sm text-subtext">أضف أقسام المنتجات مثل: الأبواب، الكبائن، السكك، ولوحات التحكم.</p>
          </div>

          <form className="space-y-4" onSubmit={saveSection}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="section-name">
                اسم القسم
              </label>
              <input
                id="section-name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="مثال: الأبواب"
                required
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="section-description">
                وصف القسم
              </label>
              <textarea
                id="section-description"
                rows={3}
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="وصف مختصر لمحتوى القسم"
                className="w-full rounded-md border border-border bg-page px-4 py-3 text-base text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <ImageFieldInput
                id="section-image"
                label="صورة القسم"
                value={draft.imageUrl}
                onChange={(nextValue) => setDraft((current) => ({ ...current, imageUrl: nextValue }))}
                scope="sections"
                placeholderKind="section"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="section-order">
                ترتيب العرض
              </label>
              <input
                id="section-order"
                type="number"
                min={0}
                value={draft.sortOrder}
                onChange={(event) => setDraft((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))}
                className={fieldClass}
              />
            </div>

            <button type="submit" disabled={busyKey === "section-save"} className="btn-primary w-full">
              {busyKey === "section-save" ? "جاري الحفظ..." : editingSectionId ? "حفظ التعديلات" : "إضافة القسم"}
            </button>

            {editingSectionId ? (
              <button type="button" onClick={resetForm} className="btn-secondary w-full bg-white">
                إلغاء التعديل
              </button>
            ) : null}
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-ink">الأقسام الحالية</h2>
              <p className="text-sm text-subtext">تحكم كامل في أسماء الأقسام وترتيب ظهورها.</p>
            </div>
            <Link href="/products" className="btn-secondary bg-page px-4 py-2">
              الانتقال لإدارة المنتجات
            </Link>
          </div>

          <div className="mb-4 space-y-2">
            <label className="text-sm font-medium text-ink" htmlFor="sections-search">
              بحث
            </label>
            <input
              id="sections-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث باسم القسم أو وصفه"
              className={fieldClass}
            />
          </div>

          {filteredSections.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-subtext">
              لا توجد أقسام مطابقة للبحث.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredSections.map((section) => {
                const isDeleteBusy = busyKey === `section-delete-${section.id}`;
                const activeCount = section.products.filter((item) => item.isActive).length;

                return (
                  <article key={section.id} className="rounded-lg border border-border bg-surface-soft p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="overflow-hidden rounded-md border border-border bg-page">
                          <ImageWithFallback
                            src={ensureImageUrl(section.imageUrl, DEFAULT_IMAGE_URLS.section)}
                            alt={`صورة ${section.name}`}
                            width={96}
                            height={72}
                            className="h-[72px] w-24 object-cover"
                            kind="section"
                            placeholderClassName="bg-surface-soft"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-ink">{section.name}</h3>
                          <p className="text-sm text-subtext">{section.description ?? "لا يوجد وصف."}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => beginEdit(section)} className="btn-secondary bg-white px-4 py-2">
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSection(section.id)}
                          disabled={isDeleteBusy}
                          className="btn-danger"
                        >
                          {isDeleteBusy ? "جاري الحذف..." : "حذف"}
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm text-subtext sm:grid-cols-3">
                      <p>
                        <span className="font-medium text-ink">ترتيب:</span> {section.sortOrder}
                      </p>
                      <p>
                        <span className="font-medium text-ink">المنتجات:</span> {section.products.length}
                      </p>
                      <p>
                        <span className="font-medium text-ink">المفعّل:</span> {activeCount}
                      </p>
                    </div>
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
