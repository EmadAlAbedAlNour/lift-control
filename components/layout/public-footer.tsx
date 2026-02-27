import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  Facebook,
  Globe2,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2
} from "lucide-react";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { PublicNavItem, publicNavItems } from "@/lib/public-navigation";
import { toTelHref } from "@/lib/utils/text";

interface FooterSocialLink {
  key: "facebook" | "instagram" | "whatsapp";
  label: string;
  href: string;
}

interface PublicFooterProps {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  city: string;
  navItems?: PublicNavItem[];
  aboutText?: string;
  companyPanelImageUrl?: string;
  linksTitle?: string;
  contactTitle?: string;
  loginLabel?: string;
  socialTitle?: string;
  socialLinks?: FooterSocialLink[];
  copyRightText?: string;
  bottomNote?: string;
}

function SocialPlatformIcon({ platform }: { platform: FooterSocialLink["key"] }) {
  const className = "h-4 w-4";

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

function normalizeLink(value: string, key: FooterSocialLink["key"]): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "";
  }

  if (key === "whatsapp" && !/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
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

export function PublicFooter({
  companyName,
  supportEmail,
  supportPhone,
  city,
  navItems = publicNavItems,
  aboutText = "شركة متخصصة في تركيب وصيانة المصاعد للمشاريع السكنية والتجارية والطبية، مع دعم فني مستمر وتقارير أداء واضحة.",
  companyPanelImageUrl,
  linksTitle = "روابط مهمة",
  contactTitle = "التواصل",
  loginLabel = "دخول العملاء",
  socialTitle = "تابعنا",
  socialLinks = [],
  copyRightText,
  bottomNote = "تركيب، صيانة، وتحديث أنظمة المصاعد وفق معايير السلامة."
}: PublicFooterProps) {
  const phoneHref = toTelHref(supportPhone);
  const visibleSocialLinks = socialLinks
    .map((item) => ({
      ...item,
      href: normalizeLink(item.href, item.key)
    }))
    .filter((item) => item.label.trim().length > 0 && item.href.length > 0);
  const finalCopyRightText = copyRightText && copyRightText.trim().length > 0 ? copyRightText : `© 2026 ${companyName}. جميع الحقوق محفوظة.`;

  return (
    <footer className="border-t border-border bg-gradient-to-b from-surface to-page">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-ink">{companyName}</h2>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-subtext">{aboutText}</p>
            <div className="relative mt-4 h-32 w-full overflow-hidden rounded-xl border border-border bg-page">
              <ImageWithFallback
                src={companyPanelImageUrl}
                alt={`${companyName} logo`}
                fill
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                className="object-contain p-3"
                kind="logo"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2 text-primary">
              <Globe2 className="h-4 w-4" aria-hidden />
              <p className="text-sm font-semibold tracking-[0.14em]">{linksTitle}</p>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  className="group flex items-center justify-between rounded-xl border border-border bg-page px-3 py-2 text-base text-subtext transition-colors hover:border-primary/40 hover:text-primary"
                  href={item.href}
                >
                  <span>{item.label}</span>
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                </Link>
              ))}
              <Link
                className="group flex items-center justify-between rounded-xl border border-border bg-page px-3 py-2 text-base text-subtext transition-colors hover:border-primary/40 hover:text-primary"
                href="/auth/login"
              >
                <span>{loginLabel}</span>
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2 text-primary">
              <Phone className="h-4 w-4" aria-hidden />
              <p className="text-sm font-semibold tracking-[0.14em]">{contactTitle}</p>
            </div>
            <div className="space-y-2">
              <a
                className="flex items-center gap-2 rounded-xl border border-border bg-page px-3 py-2 text-base text-subtext transition-colors hover:border-primary/40 hover:text-primary"
                href={`mailto:${supportEmail}`}
              >
                <Mail className="h-4 w-4" aria-hidden />
                <span>{supportEmail}</span>
              </a>
              <a
                className="flex items-center gap-2 rounded-xl border border-border bg-page px-3 py-2 text-base text-subtext transition-colors hover:border-primary/40 hover:text-primary"
                href={phoneHref}
              >
                <Phone className="h-4 w-4" aria-hidden />
                <span>{supportPhone}</span>
              </a>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-page px-3 py-2 text-base text-subtext">
                <MapPin className="h-4 w-4" aria-hidden />
                <span>{city}</span>
              </div>
            </div>

            {visibleSocialLinks.length > 0 ? (
              <div className="mt-4 border-t border-border pt-4">
                <div className="mb-2 flex items-center gap-2 text-ink">
                  <Share2 className="h-4 w-4 text-primary" aria-hidden />
                  <p className="text-sm font-semibold">{socialTitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibleSocialLinks.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-page px-3 py-1.5 text-sm text-subtext transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <SocialPlatformIcon platform={item.key} />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-4 text-sm text-subtext sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>{finalCopyRightText}</p>
          <p>{bottomNote}</p>
        </div>
      </div>
    </footer>
  );
}
