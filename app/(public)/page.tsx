import Link from "next/link";

import { HomeBannerCarousel } from "@/components/public/home-banner-carousel";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { PROJECT_TYPE_LABELS_SHORT_AR } from "@/lib/constants/projects";
import { getAllContent, listProductSectionsWithProducts, listSettings } from "@/lib/data-access";
import { buildLandingContent } from "@/lib/landing-content";
import { ensureImageUrl, ensureImageUrlList } from "@/lib/utils/image";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";

const typeLabels = PROJECT_TYPE_LABELS_SHORT_AR;

function readSettingLines(settings: Map<string, string>, key: string): string[] {
  const value = settings.get(key);

  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export default async function HomePage() {
  const [projects, settings, productSections] = await Promise.all([
    getAllContent(),
    listSettings(),
    listProductSectionsWithProducts()
  ]);
  const featuredProjects = projects.slice(0, 3);
  const settingsMap = toSettingsMap(settings);
  const landing = buildLandingContent(settings);
  const bannerImage = ensureImageUrl(
    readSetting(settingsMap, "landing.homeBannerImage", DEFAULT_IMAGE_URLS.banner),
    DEFAULT_IMAGE_URLS.banner
  );
  const bannerImages = readSettingLines(settingsMap, "landing.homeBannerImages");
  const effectiveBannerImages = ensureImageUrlList(
    bannerImages.length > 0 ? bannerImages : [bannerImage],
    DEFAULT_IMAGE_URLS.banner
  );
  const bannerAutoPlay = readSetting(settingsMap, "landing.homeBannerAutoPlay", "enabled") === "enabled";
  const bannerIntervalMs = Number.parseInt(readSetting(settingsMap, "landing.homeBannerIntervalMs", "5000"), 10);
  const homeProductsEyebrow = readSetting(settingsMap, "pages.home.productsEyebrow", "منتجاتنا");
  const homeProductsTitle = readSetting(settingsMap, "pages.home.productsTitle", "الأقسام المتوفرة");
  const homeProductsDescription = readSetting(
    settingsMap,
    "pages.home.productsDescription",
    "استعرض أقسام المنتجات المتاحة واضغط استعراض لفتح صفحة كل قسم."
  );
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
    <>
      <HomeBannerCarousel images={effectiveBannerImages} autoPlay={bannerAutoPlay} intervalMs={bannerIntervalMs} />

      <section className="py-14 sm:py-16 lg:py-20">
        <div className="container-shell">
          <article className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8 lg:p-10">
            <div className="grid gap-7 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div className="space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{landing.hero.eyebrow}</p>
                <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {landing.hero.titleLine1}
                  {landing.hero.titleLine2 ? (
                    <>
                      <br />
                      {landing.hero.titleLine2}
                    </>
                  ) : null}
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-subtext">{landing.hero.description}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/about" className="btn-secondary bg-page px-5 py-2">
                    اقرأ المزيد
                  </Link>
                  <a href={landing.hero.primaryCtaHref} className="btn-primary px-5 py-2">
                    {landing.hero.primaryCtaLabel}
                  </a>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-surface-soft">
                <ImageWithFallback
                  src={ensureImageUrl(landing.hero.cardImage, DEFAULT_IMAGE_URLS.heroCard)}
                  alt={landing.hero.cardTitle}
                  width={1200}
                  height={800}
                  className="h-[260px] w-full object-cover sm:h-[320px]"
                  priority
                  kind="hero"
                  placeholderClassName="bg-surface-soft"
                />
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container-shell">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{homeProductsEyebrow}</p>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{homeProductsTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-subtext">{homeProductsDescription}</p>
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
                    className="h-64 w-full object-cover"
                    kind="section"
                    placeholderClassName="bg-surface-soft"
                  />
                </div>
                <div className="space-y-4 p-6">
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
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container-shell">
          <SectionHeading
            eyebrow={landing.featured.eyebrow}
            title={landing.featured.title}
            description={landing.featured.description}
            align="center"
          />

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {featuredProjects.map((project) => (
              <article key={project.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
                <ImageWithFallback
                  src={ensureImageUrl(project.coverImage, DEFAULT_IMAGE_URLS.project)}
                  alt={`صورة مشروع ${project.title}`}
                  width={1200}
                  height={900}
                  className="h-52 w-full object-cover"
                  kind="project"
                  placeholderClassName="bg-surface-soft"
                />
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold tracking-tight text-ink">{project.title}</h3>
                    <StatusPill status={project.status} />
                  </div>

                  <div className="space-y-1 text-sm text-subtext">
                    <p>
                      <span className="font-medium text-ink">الموقع:</span> {project.location}
                    </p>
                    <p>
                      <span className="font-medium text-ink">النوع:</span> {typeLabels[project.type]}
                    </p>
                  </div>

                  <Link href={`/projects/${project.id}`} className="btn-secondary bg-page px-4 py-2">
                    عرض التفاصيل
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/projects" className="btn-primary px-6">
              {landing.featured.ctaLabel}
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
