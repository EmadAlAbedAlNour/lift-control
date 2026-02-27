import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { listSettings } from "@/lib/data-access";
import { buildLandingContent } from "@/lib/landing-content";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";

export default async function PublicAboutPage() {
  const settingsList = await listSettings();
  const settings = toSettingsMap(settingsList);
  const landing = buildLandingContent(settingsList);
  const ctaTitle = readSetting(settings, "pages.about.ctaTitle", "ابدأ مشروعك معنا");
  const ctaDescription = readSetting(
    settings,
    "pages.about.ctaDescription",
    "شاركنا تفاصيل المبنى أو المصعد الحالي، وسنقترح المسار الأنسب: تركيب جديد، تحديث جزئي، أو عقد صيانة شامل."
  );
  const primaryCtaLabel = readSetting(settings, "pages.about.primaryCtaLabel", "تواصل الآن");
  const secondaryCtaLabel = readSetting(settings, "pages.about.secondaryCtaLabel", "تصفح مشاريعنا");

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell space-y-8">
        <header className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow={landing.about.eyebrow}
            title={landing.about.title}
            description={landing.about.description}
          />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <h2 className="mb-5 text-2xl font-bold tracking-tight text-ink">خطوات التنفيذ</h2>
            <div className="space-y-4">
              {landing.about.steps.map((step) => (
                <article key={step.title} className="rounded-lg border border-border bg-surface-soft p-4">
                  <h3 className="mb-2 text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="text-base leading-relaxed text-subtext">{step.detail}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">{landing.about.whyTitle}</h2>
            <p className="mb-6 text-base leading-relaxed text-subtext">{landing.about.whyDescription}</p>
            <ul className="space-y-3 text-base text-subtext">
              {landing.about.strengths.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-lg border border-border bg-surface-soft p-5">
              <p className="mb-2 text-sm text-subtext">{landing.about.readinessLabel}</p>
              <p className="text-2xl font-bold tracking-tight text-ink">{landing.about.readinessValue}</p>
            </div>
          </article>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink">{ctaTitle}</h2>
          <p className="mb-5 max-w-2xl text-base leading-relaxed text-subtext">{ctaDescription}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary px-6">
              {primaryCtaLabel}
            </Link>
            <Link href="/projects" className="btn-secondary bg-page px-6">
              {secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
