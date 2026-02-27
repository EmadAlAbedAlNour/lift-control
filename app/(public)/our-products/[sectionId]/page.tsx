import Link from "next/link";
import { notFound } from "next/navigation";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { listProductSectionsWithProducts } from "@/lib/data-access";
import { ensureImageUrl } from "@/lib/utils/image";

interface ProductSectionDetailPageProps {
  params: Promise<{
    sectionId: string;
  }>;
}

export default async function ProductSectionDetailPage({ params }: ProductSectionDetailPageProps) {
  const { sectionId } = await params;
  const sections = await listProductSectionsWithProducts();
  const section = sections.find((item) => item.id === sectionId);

  if (!section) {
    notFound();
  }

  const activeProducts = section.products
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const headerImage = ensureImageUrl(
    section.imageUrl ?? activeProducts[0]?.imageUrl,
    DEFAULT_IMAGE_URLS.section
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell space-y-8">
        <Link href="/our-products" className="btn-secondary bg-page px-4 py-2">
          العودة إلى كل الأقسام
        </Link>

        <article className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="overflow-hidden rounded-xl border border-border bg-surface-soft">
              <ImageWithFallback
                src={headerImage}
                alt={`صورة قسم ${section.name}`}
                width={1200}
                height={900}
                className="h-72 w-full object-cover"
                kind="section"
                placeholderClassName="bg-surface-soft"
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">قسم المنتجات</p>
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{section.name}</h1>
              <p className="text-base leading-relaxed text-subtext">
                {section.description?.trim().length
                  ? section.description
                  : "اعرض تفاصيل المنتجات المتوفرة داخل هذا القسم وتواصل معنا للطلب."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-lg border border-border bg-surface-soft p-4">
                  <p className="mb-1 text-xs text-subtext">إجمالي المنتجات</p>
                  <p className="text-xl font-bold text-ink">{section.products.length}</p>
                </article>
                <article className="rounded-lg border border-border bg-surface-soft p-4">
                  <p className="mb-1 text-xs text-subtext">المنتجات المفعلة</p>
                  <p className="text-xl font-bold text-ink">{activeProducts.length}</p>
                </article>
              </div>
            </div>
          </div>
        </article>

        {activeProducts.length === 0 ? (
          <article className="rounded-xl border border-border bg-surface p-6 text-base text-subtext shadow-card sm:p-8">
            لا توجد منتجات مفعلة داخل هذا القسم حاليًا.
          </article>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {activeProducts.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
                <div className="overflow-hidden border-b border-border bg-surface-soft">
                  <ImageWithFallback
                    src={ensureImageUrl(product.imageUrl, DEFAULT_IMAGE_URLS.product)}
                    alt={`صورة ${product.name}`}
                    width={1200}
                    height={900}
                    className="h-56 w-full object-cover"
                    kind="product"
                    placeholderClassName="bg-surface-soft"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <h2 className="line-clamp-1 text-xl font-bold tracking-tight text-ink">{product.name}</h2>
                  <p className="line-clamp-3 text-sm leading-relaxed text-subtext">{product.summary}</p>
                  <p className="text-xs text-subtext">
                    {product.brand ? `العلامة: ${product.brand}` : "بدون علامة"}
                    {product.sku ? ` | SKU: ${product.sku}` : ""}
                  </p>
                  <Link href="/contact" className="btn-secondary w-full bg-page px-4 py-2">
                    استفسر عن المنتج
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
