import type { Metadata } from "next";
import { Cairo, Manrope } from "next/font/google";

import "@/app/globals.css";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { listSettings } from "@/lib/data-access";
import { toRenderableImageUrl } from "@/lib/utils/image";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "600", "700"]
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "700"]
});

const baseMetadata: Metadata = {
  title: "Lift Control",
  description:
    "منصة ويب لشركة متخصصة بالمصاعد تشمل العرض التجاري ولوحة التحكم وإدارة المحتوى والعمليات."
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settingsList = await listSettings();
    const settings = toSettingsMap(settingsList);
    const logoUrl = toRenderableImageUrl(readSetting(settings, "profile.companyLogoUrl", DEFAULT_IMAGE_URLS.companyLogo));

    return {
      ...baseMetadata,
      icons: logoUrl
        ? {
            icon: logoUrl,
            shortcut: logoUrl,
            apple: logoUrl
          }
        : undefined
    };
  } catch {
    return baseMetadata;
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${manrope.variable} bg-page text-ink antialiased`}>{children}</body>
    </html>
  );
}
