"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { ProductItem, ProductSection } from "@/lib/types";
import { ensureImageUrl } from "@/lib/utils/image";

interface ProductsShowcaseProps {
  sections: ProductSection[];
}

interface ProductWithSection extends ProductItem {
  sectionName: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function ProductsShowcase({ sections }: ProductsShowcaseProps) {
  const preparedSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          products: section.products.filter((product) => product.isActive)
        }))
        .filter((section) => section.products.length > 0),
    [sections]
  );
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const effectiveSectionFilter =
    sectionFilter === "all" || preparedSections.some((section) => section.id === sectionFilter)
      ? sectionFilter
      : "all";
  const featuredSections = preparedSections.slice(0, 3);

  const allProducts = useMemo<ProductWithSection[]>(
    () =>
      preparedSections.flatMap((section) =>
        section.products.map((product) => ({
          ...product,
          sectionName: section.name
        }))
      ),
    [preparedSections]
  );

  const visibleProducts = useMemo(() => {
    const normalized = normalize(query);

    return allProducts
      .filter((product) => {
        const matchesSection = effectiveSectionFilter === "all" ? true : product.sectionId === effectiveSectionFilter;
        const matchesQuery =
          normalized.length === 0
            ? true
            : normalize(product.name).includes(normalized) ||
              normalize(product.sectionName).includes(normalized) ||
              normalize(product.summary).includes(normalized) ||
              normalize(product.brand ?? "").includes(normalized) ||
              normalize(product.sku ?? "").includes(normalized);

        return matchesSection && matchesQuery;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [allProducts, effectiveSectionFilter, query]);

  return (
    <div className="space-y-6">
      {featuredSections.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSections.map((section) => {
            const preview = section.products[0];
            const sectionPreviewImage = ensureImageUrl(
              section.imageUrl ?? preview?.imageUrl,
              DEFAULT_IMAGE_URLS.section
            );
            const isActive = effectiveSectionFilter === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setSectionFilter(section.id)}
                className={`overflow-hidden rounded-2xl border text-start transition-colors ${
                  isActive ? "border-primary bg-primary-soft/40" : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                <div className="relative m-4 overflow-hidden rounded-xl border border-border bg-surface-soft">
                  <ImageWithFallback
                    src={sectionPreviewImage}
                    alt={`صورة قسم ${section.name}`}
                    width={1200}
                    height={900}
                    className="h-52 w-full object-cover"
                    kind="section"
                    placeholderClassName="bg-surface-soft"
                  />
                  <div className="pointer-events-none absolute -bottom-14 -left-14 h-28 w-28 rounded-full bg-primary/90" aria-hidden />
                  <div className="pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-page/70" aria-hidden />
                </div>
                <div className="px-5 pb-5">
                  <p className="text-2xl font-bold tracking-tight text-ink">{section.name}</p>
                  <p className="mt-1 text-sm text-subtext">{section.products.length} منتج متاح</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSectionFilter("all")}
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${
              effectiveSectionFilter === "all"
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-page text-subtext"
            }`}
          >
            كل الأقسام
          </button>
          {preparedSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setSectionFilter(section.id)}
              className={`rounded-md border px-4 py-2 text-sm font-semibold ${
                effectiveSectionFilter === section.id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-page text-subtext"
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث باسم المنتج أو القسم أو الوصف"
            className="input-field bg-page"
          />
          <div className="rounded-md border border-border bg-page px-4 py-3 text-sm text-subtext">
            النتائج: {visibleProducts.length} من {allProducts.length}
          </div>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <article className="rounded-xl border border-border bg-surface p-6 text-base leading-relaxed text-subtext shadow-card sm:p-8">
          لا توجد منتجات مطابقة للفلاتر الحالية. جرّب تغيير القسم أو كلمات البحث.
        </article>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
              <div className="relative overflow-hidden border-b border-border bg-surface-soft">
                <ImageWithFallback
                  src={ensureImageUrl(product.imageUrl, DEFAULT_IMAGE_URLS.product)}
                  alt={`صورة ${product.name}`}
                  width={1200}
                  height={800}
                  className="h-48 w-full object-cover"
                  kind="product"
                  placeholderClassName="bg-surface-soft"
                />
                <div className="pointer-events-none absolute -bottom-14 -left-14 h-28 w-28 rounded-full bg-primary/90" aria-hidden />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-page/70" aria-hidden />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-lg font-bold tracking-tight text-ink">{product.name}</p>
                  <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">
                    {product.sectionName}
                  </span>
                </div>

                <p className="line-clamp-3 text-sm leading-relaxed text-subtext">{product.summary}</p>

                <div className="text-xs text-subtext">
                  {product.brand ? `العلامة: ${product.brand}` : "بدون علامة"}
                  {product.sku ? ` | SKU: ${product.sku}` : ""}
                </div>

                <Link href="/contact" className="btn-secondary w-full bg-page px-4 py-2">
                  استفسر عن المنتج
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
