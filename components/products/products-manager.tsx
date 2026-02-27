"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ImageFieldInput } from "@/components/ui/image-field-input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { INPUT_FIELD_CLASS } from "@/lib/constants/ui";
import { ProductItem, ProductSection } from "@/lib/types";
import { parseApiResponse } from "@/lib/utils/client-api";
import { ensureImageUrl } from "@/lib/utils/image";

interface ProductsManagerProps {
  initialSections: ProductSection[];
}

type Notice = {
  type: "success" | "error";
  text: string;
};

type ProductDraft = {
  sectionId: string;
  name: string;
  sku: string;
  brand: string;
  summary: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};

type ActiveFilter = "all" | "active" | "inactive";

const fieldClass = INPUT_FIELD_CLASS;

function emptyProductDraft(sectionId: string): ProductDraft {
  return {
    sectionId,
    name: "",
    sku: "",
    brand: "",
    summary: "",
    imageUrl: DEFAULT_IMAGE_URLS.product,
    isActive: true,
    sortOrder: 0
  };
}

function draftFromProduct(product: ProductItem): ProductDraft {
  return {
    sectionId: product.sectionId,
    name: product.name,
    sku: product.sku ?? "",
    brand: product.brand ?? "",
    summary: product.summary,
    imageUrl: ensureImageUrl(product.imageUrl, DEFAULT_IMAGE_URLS.product),
    isActive: product.isActive,
    sortOrder: product.sortOrder
  };
}

function sortSections(items: ProductSection[]): ProductSection[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function sortProducts(items: ProductItem[]): ProductItem[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function ProductsManager({ initialSections }: ProductsManagerProps) {
  const [sections, setSections] = useState<ProductSection[]>(sortSections(initialSections));
  const [draft, setDraft] = useState<ProductDraft>(emptyProductDraft(initialSections[0]?.id ?? ""));
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterSectionId, setFilterSectionId] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const hasSections = sections.length > 0;
  const allProducts = useMemo(() => sections.flatMap((section) => section.products), [sections]);
  const activeProducts = allProducts.filter((item) => item.isActive).length;

  const filteredSections = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return sections
      .filter((section) => (filterSectionId === "all" ? true : section.id === filterSectionId))
      .map((section) => {
        const products = section.products.filter((item) => {
          const matchesSearch =
            normalized.length === 0
              ? true
              : item.name.toLowerCase().includes(normalized) ||
                item.summary.toLowerCase().includes(normalized) ||
                (item.sku ?? "").toLowerCase().includes(normalized) ||
                (item.brand ?? "").toLowerCase().includes(normalized);
          const matchesActive =
            activeFilter === "all"
              ? true
              : activeFilter === "active"
                ? item.isActive
                : !item.isActive;

          return matchesSearch && matchesActive;
        });

        return {
          ...section,
          products
        };
      });
  }, [sections, filterSectionId, search, activeFilter]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (sections.length === 0) {
      return;
    }

    setDraft((current) => (current.sectionId ? current : { ...current, sectionId: sections[0].id }));
  }, [sections]);

  function showNotice(type: Notice["type"], text: string) {
    setNotice({ type, text });
  }

  function resetForm() {
    setEditingProductId(null);
    setDraft(emptyProductDraft(sections[0]?.id ?? ""));
  }

  function beginEdit(product: ProductItem) {
    setEditingProductId(product.id);
    setDraft(draftFromProduct(product));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function upsertProduct(saved: ProductItem) {
    setSections((current) =>
      sortSections(
        current.map((section) => {
          const remaining = section.products.filter((item) => item.id !== saved.id);

          if (section.id !== saved.sectionId) {
            return {
              ...section,
              products: sortProducts(remaining)
            };
          }

          return {
            ...section,
            products: sortProducts([...remaining, saved])
          };
        })
      )
    );
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyKey("product-save");

    try {
      const payload = {
        sectionId: draft.sectionId,
        name: draft.name,
        sku: draft.sku,
        brand: draft.brand,
        summary: draft.summary,
        imageUrl: ensureImageUrl(draft.imageUrl, DEFAULT_IMAGE_URLS.product),
        isActive: draft.isActive,
        sortOrder: Number(draft.sortOrder) || 0
      };

      const response = await fetch(editingProductId ? `/api/products/${editingProductId}` : "/api/products", {
        method: editingProductId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const saved = await parseApiResponse<ProductItem>(response);
      upsertProduct(saved);
      showNotice("success", editingProductId ? "تم تحديث المنتج." : "تمت إضافة المنتج.");
      resetForm();
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حفظ المنتج.");
    } finally {
      setBusyKey(null);
    }
  }

  async function toggleActive(product: ProductItem) {
    setBusyKey(`product-active-${product.id}`);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive })
      });

      const updated = await parseApiResponse<ProductItem>(response);
      upsertProduct(updated);
      showNotice("success", updated.isActive ? "تم تفعيل المنتج." : "تم تعطيل المنتج.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر تحديث حالة المنتج.");
    } finally {
      setBusyKey(null);
    }
  }

  async function deleteProduct(productId: string) {
    if (!window.confirm("هل تريد حذف المنتج؟")) {
      return;
    }

    setBusyKey(`product-delete-${productId}`);

    try {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      await parseApiResponse<{ id: string; deleted: boolean }>(response);
      setSections((current) =>
        current.map((section) => ({
          ...section,
          products: section.products.filter((item) => item.id !== productId)
        }))
      );

      if (editingProductId === productId) {
        resetForm();
      }

      showNotice("success", "تم حذف المنتج.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "تعذر حذف المنتج.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {notice ? <div className={notice.type === "success" ? "alert-success" : "alert-error"}>{notice.text}</div> : null}

      <section className="grid gap-4 sm:grid-cols-3 lg:gap-6">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">إجمالي المنتجات</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{allProducts.length}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">المنتجات المفعّلة</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{activeProducts}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <p className="mb-2 text-sm text-subtext">الأقسام المرتبطة</p>
          <p className="text-2xl font-bold tracking-tight text-ink">{sections.length}</p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {editingProductId ? "تعديل منتج" : "إضافة منتج جديد"}
            </h2>
            <p className="mt-1 text-sm text-subtext">
              إدارة كاملة للمنتجات داخل أقسامك المعتمدة.
            </p>
          </div>

          {!hasSections ? (
            <div className="space-y-3">
              <p className="rounded-md border border-warning bg-warning-soft p-4 text-sm text-warning-text">
                لا يوجد أقسام حاليا. أنشئ قسمًا أولًا قبل إضافة المنتجات.
              </p>
              <Link href="/sections" className="btn-primary">
                الذهاب إلى صفحة الأقسام
              </Link>
            </div>
          ) : (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProduct}>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-ink" htmlFor="product-section">
                  القسم
                </label>
                <select
                  id="product-section"
                  value={draft.sectionId}
                  onChange={(event) => setDraft((current) => ({ ...current, sectionId: event.target.value }))}
                  required
                  className={fieldClass}
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink" htmlFor="product-name">
                  اسم المنتج
                </label>
                <input
                  id="product-name"
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  required
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink" htmlFor="product-sku">
                  SKU
                </label>
                <input
                  id="product-sku"
                  value={draft.sku}
                  onChange={(event) => setDraft((current) => ({ ...current, sku: event.target.value }))}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink" htmlFor="product-brand">
                  العلامة التجارية
                </label>
                <input
                  id="product-brand"
                  value={draft.brand}
                  onChange={(event) => setDraft((current) => ({ ...current, brand: event.target.value }))}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink" htmlFor="product-order">
                  ترتيب العرض
                </label>
                <input
                  id="product-order"
                  type="number"
                  min={0}
                  value={draft.sortOrder}
                  onChange={(event) => setDraft((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-ink" htmlFor="product-summary">
                  وصف المنتج
                </label>
                <textarea
                  id="product-summary"
                  rows={3}
                  value={draft.summary}
                  onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
                  required
                  className="w-full rounded-md border border-border bg-page px-4 py-3 text-base text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <ImageFieldInput
                  id="product-image"
                  label="صورة المنتج"
                  value={draft.imageUrl}
                  onChange={(nextValue) => setDraft((current) => ({ ...current, imageUrl: nextValue }))}
                  scope="products"
                  placeholderKind="product"
                />
              </div>

              <label className="sm:col-span-2 flex items-center gap-3 rounded-md border border-border bg-page px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
                />
                <span className="font-medium text-ink">المنتج مفعّل</span>
              </label>

              <button type="submit" disabled={busyKey === "product-save"} className="btn-primary sm:col-span-2">
                {busyKey === "product-save" ? "جاري الحفظ..." : editingProductId ? "حفظ التعديلات" : "إضافة المنتج"}
              </button>

              {editingProductId ? (
                <button type="button" onClick={resetForm} className="btn-secondary bg-white sm:col-span-2">
                  إلغاء التعديل
                </button>
              ) : null}
            </form>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-ink">قائمة المنتجات</h2>
              <p className="text-sm text-subtext">بحث وتصفية وتعديل مباشر لكل منتج.</p>
            </div>
            <Link href="/sections" className="btn-secondary bg-page px-4 py-2">
              إدارة الأقسام
            </Link>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-3">
              <label className="text-sm font-medium text-ink" htmlFor="products-search">
                بحث
              </label>
              <input
                id="products-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو الوصف أو SKU"
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="products-filter-section">
                القسم
              </label>
              <select
                id="products-filter-section"
                value={filterSectionId}
                onChange={(event) => setFilterSectionId(event.target.value)}
                className={fieldClass}
              >
                <option value="all">كل الأقسام</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink" htmlFor="products-filter-active">
                الحالة
              </label>
              <select
                id="products-filter-active"
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value as ActiveFilter)}
                className={fieldClass}
              >
                <option value="all">الكل</option>
                <option value="active">مفعّل</option>
                <option value="inactive">غير مفعّل</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredSections.map((section) => (
              <article key={section.id} className="rounded-xl border border-border bg-surface-soft p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-ink">{section.name}</h3>
                  <span className="text-xs font-semibold text-subtext">{section.products.length} منتج</span>
                </div>

                {section.products.length === 0 ? (
                  <p className="rounded-lg border border-border bg-surface p-4 text-sm text-subtext">
                    لا توجد منتجات مطابقة لهذا القسم.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {section.products.map((product) => {
                      const isDeleteBusy = busyKey === `product-delete-${product.id}`;
                      const isActiveBusy = busyKey === `product-active-${product.id}`;

                      return (
                        <article
                          key={product.id}
                          className="grid gap-4 rounded-lg border border-border bg-surface p-4 lg:grid-cols-[100px_1fr_auto]"
                        >
                          <div className="overflow-hidden rounded-md border border-border bg-page">
                            <ImageWithFallback
                              src={ensureImageUrl(product.imageUrl, DEFAULT_IMAGE_URLS.product)}
                              alt={`صورة ${product.name}`}
                              width={200}
                              height={140}
                              className="h-20 w-full object-cover"
                              kind="product"
                              placeholderClassName="bg-surface-soft"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-ink">{product.name}</p>
                              <span
                                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                  product.isActive ? "bg-success-soft text-success-text" : "bg-muted text-subtext"
                                }`}
                              >
                                {product.isActive ? "مفعّل" : "غير مفعّل"}
                              </span>
                            </div>
                            <p className="text-sm text-subtext">{product.summary}</p>
                            <p className="text-xs text-subtext">
                              {product.brand ? `العلامة: ${product.brand}` : "بدون علامة"}
                              {product.sku ? ` | SKU: ${product.sku}` : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-start gap-2 lg:flex-col">
                            <button type="button" onClick={() => beginEdit(product)} className="btn-secondary bg-white px-4 py-2">
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleActive(product)}
                              disabled={isActiveBusy}
                              className="btn-secondary bg-white px-4 py-2"
                            >
                              {isActiveBusy ? "جاري..." : product.isActive ? "تعطيل" : "تفعيل"}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(product.id)}
                              disabled={isDeleteBusy}
                              className="btn-danger"
                            >
                              {isDeleteBusy ? "جاري الحذف..." : "حذف"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}

            {filteredSections.length === 0 ? (
              <p className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-subtext">
                لا توجد نتائج مطابقة للبحث أو الفلاتر الحالية.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
