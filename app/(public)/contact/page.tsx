import Link from "next/link";
import { Facebook, Mail, MapPin, MessageCircle, Phone, Share2, Instagram } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";
import { listSettings } from "@/lib/data-access";
import { buildLandingContent } from "@/lib/landing-content";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";

type SocialPlatform = "facebook" | "instagram" | "whatsapp";

interface SocialLinkItem {
  key: SocialPlatform;
  label: string;
  href: string;
}

function normalizeSocialHref(value: string, platform: SocialPlatform): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "";
  }

  if (platform === "whatsapp" && !/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    const digitsOnly = trimmed.replace(/\D/g, "");

    if (digitsOnly.length >= 8) {
      return `https://wa.me/${digitsOnly}`;
    }
  }

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const className = "h-3.5 w-3.5";

  switch (platform) {
    case "facebook":
      return <Facebook className={className} aria-hidden />;
    case "instagram":
      return <Instagram className={className} aria-hidden />;
    case "whatsapp":
      return <MessageCircle className={className} aria-hidden />;
    default:
      return <Share2 className={className} aria-hidden />;
  }
}

export default async function PublicContactPage() {
  const settingsList = await listSettings();
  const settings = toSettingsMap(settingsList);
  const landing = buildLandingContent(settingsList);

  const supportPhone = readSetting(settings, "profile.supportPhone", "+966 55 221 4490");
  const supportEmail = readSetting(settings, "profile.supportEmail", "support@liftcontrol.sa");
  const city = readSetting(settings, "profile.city", "الرياض - المملكة العربية السعودية");
  const hoursTitle = readSetting(settings, "pages.contact.hoursTitle", "ساعات العمل والدعم");
  const hoursDescription = readSetting(
    settings,
    "pages.contact.hoursDescription",
    "نستقبل طلبات المعاينة والاستفسارات طوال أيام الأسبوع، كما نوفر دعم فني للحالات العاجلة."
  );
  const hoursCard1Title = readSetting(settings, "pages.contact.hoursCard1Title", "الاستفسارات العامة");
  const hoursCard1Value = readSetting(settings, "pages.contact.hoursCard1Value", "من 9 ص إلى 7 م");
  const hoursCard2Title = readSetting(settings, "pages.contact.hoursCard2Title", "الدعم الطارئ");
  const hoursCard2Value = readSetting(settings, "pages.contact.hoursCard2Value", "24/7");
  const hoursCard3Title = readSetting(settings, "pages.contact.hoursCard3Title", "قنوات التواصل");
  const socialLinks = [
    {
      key: "facebook",
      label: readSetting(settings, "footer.facebookLabel", "Facebook"),
      href: readSetting(settings, "footer.facebookUrl", "https://facebook.com")
    },
    {
      key: "instagram",
      label: readSetting(settings, "footer.instagramLabel", "Instagram"),
      href: readSetting(settings, "footer.instagramUrl", "https://instagram.com")
    },
    {
      key: "whatsapp",
      label: readSetting(settings, "footer.whatsappLabel", "WhatsApp"),
      href: readSetting(settings, "footer.whatsappUrl", "https://wa.me/966552214490")
    }
  ]
    .map((item) => ({
      ...item,
      href: normalizeSocialHref(item.href, item.key as SocialPlatform)
    }))
    .filter((item) => item.label.trim().length > 0 && item.href.length > 0) as SocialLinkItem[];

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell space-y-8">
        <header className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow={landing.contact.eyebrow}
            title={landing.contact.title}
            description={landing.contact.description}
          />
          <div className="flex flex-wrap gap-3">
            <a href={landing.contact.phoneHref} className="btn-primary px-6">
              {landing.contact.phoneLabel}
            </a>
            <a href={landing.contact.emailHref} className="btn-secondary bg-page px-6">
              {landing.contact.emailLabel}
            </a>
            <Link href={landing.contact.loginHref} className="btn-secondary bg-page px-6">
              {landing.contact.loginLabel}
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <p className="mb-2 text-sm text-subtext">الهاتف</p>
            <a href={landing.contact.phoneHref} className="inline-flex items-center gap-2 text-xl font-bold text-ink hover:text-primary">
              <Phone className="h-5 w-5" aria-hidden />
              <span>{supportPhone}</span>
            </a>
          </article>
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <p className="mb-2 text-sm text-subtext">البريد الإلكتروني</p>
            <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-2 text-lg font-semibold text-ink hover:text-primary">
              <Mail className="h-5 w-5" aria-hidden />
              <span>{supportEmail}</span>
            </a>
          </article>
          <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <p className="mb-2 text-sm text-subtext">الموقع</p>
            <p className="flex items-center gap-2 text-lg font-semibold text-ink">
              <MapPin className="h-5 w-5" aria-hidden />
              <span>{city}</span>
            </p>
          </article>
        </div>

        <article className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink">{hoursTitle}</h2>
          <p className="mb-5 text-base leading-relaxed text-subtext">{hoursDescription}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface-soft p-4">
              <p className="text-sm text-subtext">{hoursCard1Title}</p>
              <p className="mt-1 font-semibold text-ink">{hoursCard1Value}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-soft p-4">
              <p className="text-sm text-subtext">{hoursCard2Title}</p>
              <p className="mt-1 font-semibold text-ink">{hoursCard2Value}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-soft p-4">
              <p className="text-sm text-subtext">{hoursCard3Title}</p>
              {socialLinks.length > 0 ? (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5">
                    {socialLinks.map((item) => (
                      <a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-page px-2 py-1 text-xs text-subtext transition-colors hover:border-primary/50 hover:text-primary"
                      >
                        <SocialIcon platform={item.key} />
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
