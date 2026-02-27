import Link from "next/link";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { listProductSectionsWithProducts, listSettings } from "@/lib/data-access";
import { buildLandingContent } from "@/lib/landing-content";
import { ensureImageUrl } from "@/lib/utils/image";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";

export default async function PublicProductsPage() {
  const [settingsList, productSections] = await Promise.all([listSettings(), listProductSectionsWithProducts()]);
  const settings = toSettingsMap(settingsList);
  const landing = buildLandingContent(settingsList);
  const pageTitle = readSetting(settings, "pages.products.title", "تصفح الأقسام");
  const pageDescription = readSetting(
    settings,
    "pages.products.description",
    "اختر القسم المطلوب لعرض كل منتجاته في صفحة مستقلة."
  );
  const inquiryTitle = readSetting(settings, "pages.products.inquiryTitle", "بحاجة منتج غير موجود؟");
  const inquiryDescription = readSetting(
    settings,
    "pages.products.inquiryDescription",
    "تواصل معنا بالمواصفات المطلوبة وسنجهز لك خيارات توريد مناسبة مع السعر ومدة التسليم."
  );
  const inquiryPrimaryCtaLabel = readSetting(settings, "pages.products.primaryCtaLabel", "طلب عرض سعر");
  const inquirySecondaryCtaLabel = readSetting(settings, "pages.products.secondaryCtaLabel", "اتصال مباشر");
  const sectionCards = productSections.map((section) => {
    const firstActiveProduct = section.products.find((item) => item.isActive);

    return {
      id: section.id,
      name: section.name,
      description: section.description,
      imageUrl: ensureImageUrl(
        section.imageUrl ?? firstActiveProduct?.imageUrl ?? landing.hero.cardImage,
        DEFAULT_IMAGE_URLS.section
      ),
      productsCount: section.products.filter((item) => item.isActive).length
    };
  });

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell space-y-8">
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{pageTitle}</h2>
            <p className="mt-2 text-base text-subtext">{pageDescription}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {sectionCards.map((section) => (
              <article key={section.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
                <div className="overflow-hidden border-b border-border bg-surface-soft">
                  <ImageWithFallback
                    src={section.imageUrl}
                    alt={`صورة قسم ${section.name}`}
                    width={1200}
                    height={900}
                    className="h-56 w-full object-cover"
                    kind="section"
                    placeholderClassName="bg-surface-soft"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <h3 className="text-2xl font-bold tracking-tight text-ink">{section.name}</h3>
                  <p className="text-sm leading-relaxed text-subtext">
                    {section.description?.trim().length ? section.description : "قسم مخصص لقطع وتجهيزات المصاعد."}
                  </p>
                  <p className="text-xs font-semibold text-subtext">منتجات مفعلة: {section.productsCount}</p>
                  <Link href={`/our-products/${section.id}`} className="btn-primary w-full px-4 py-2">
                    استعراض
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink">{inquiryTitle}</h2>
          <p className="mb-5 max-w-2xl text-base leading-relaxed text-subtext">{inquiryDescription}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary px-6">
              {inquiryPrimaryCtaLabel}
            </Link>
            <a href={landing.contact.phoneHref} className="btn-secondary bg-page px-6">
              {inquirySecondaryCtaLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
