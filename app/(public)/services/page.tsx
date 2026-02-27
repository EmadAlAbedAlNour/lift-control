import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { listSettings } from "@/lib/data-access";
import { buildLandingContent } from "@/lib/landing-content";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";

export default async function PublicServicesPage() {
  const settingsList = await listSettings();
  const settings = toSettingsMap(settingsList);
  const landing = buildLandingContent(settingsList);
  const primaryCtaLabel = readSetting(settings, "pages.services.primaryCtaLabel", "اطلب معاينة فنية");
  const secondaryCtaLabel = readSetting(settings, "pages.services.secondaryCtaLabel", "تصفح المشاريع");

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell space-y-8">
        <header className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow={landing.services.eyebrow}
            title={landing.services.title}
            description={landing.services.description}
          />
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary px-6">
              {primaryCtaLabel}
            </Link>
            <Link href="/projects" className="btn-secondary bg-page px-6">
              {secondaryCtaLabel}
            </Link>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {landing.services.cards.map((service, index) => (
            <article key={service.title} className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                {index + 1}
              </div>
              <h2 className="mb-3 text-xl font-bold tracking-tight text-ink">{service.title}</h2>
              <p className="mb-4 text-base leading-relaxed text-subtext">{service.description}</p>
              <ul className="space-y-2 text-sm text-subtext">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
