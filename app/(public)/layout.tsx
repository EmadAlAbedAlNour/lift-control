import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { listSettings } from "@/lib/data-access";
import { buildPublicNavItems } from "@/lib/public-navigation";
import { ensureImageUrl } from "@/lib/utils/image";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const settingsList = await listSettings();
  const settings = toSettingsMap(settingsList);

  const companyName = readSetting(settings, "profile.companyName", "Lift Control");
  const companyTagline = readSetting(settings, "profile.companyTagline", "لإنتاج المصاعد الكهربائية");
  const supportPhone = readSetting(settings, "profile.supportPhone", "+966 55 221 4490");
  const companyLogoUrl = ensureImageUrl(
    readSetting(settings, "profile.companyLogoUrl", DEFAULT_IMAGE_URLS.companyLogo),
    DEFAULT_IMAGE_URLS.companyLogo
  );
  const supportEmail = readSetting(settings, "profile.supportEmail", "support@liftcontrol.sa");
  const city = readSetting(settings, "profile.city", "الرياض - المملكة العربية السعودية");
  const navItems = buildPublicNavItems(settings);
  const clientLoginLabel = readSetting(settings, "nav.clientLoginLabel", "دخول العملاء");
  const footerDescription = readSetting(
    settings,
    "footer.description",
    "شركة متخصصة في تركيب وصيانة المصاعد للمشاريع السكنية والتجارية والطبية، مع دعم فني مستمر وتقارير أداء واضحة."
  );
  const footerCompanyImageUrl = ensureImageUrl(
    readSetting(settings, "footer.companyImageUrl", DEFAULT_IMAGE_URLS.companyLogo),
    DEFAULT_IMAGE_URLS.companyLogo
  );
  const footerLinksTitle = readSetting(settings, "footer.linksTitle", "روابط مهمة");
  const footerContactTitle = readSetting(settings, "footer.contactTitle", "التواصل");
  const footerLoginLabel = readSetting(settings, "footer.loginLabel", clientLoginLabel);
  const footerSocialTitle = readSetting(settings, "footer.socialTitle", "تابعنا");
  const footerFacebookLabel = readSetting(settings, "footer.facebookLabel", "Facebook");
  const footerFacebookUrl = readSetting(settings, "footer.facebookUrl", "https://facebook.com");
  const footerInstagramLabel = readSetting(settings, "footer.instagramLabel", "Instagram");
  const footerInstagramUrl = readSetting(settings, "footer.instagramUrl", "https://instagram.com");
  const footerWhatsappLabel = readSetting(settings, "footer.whatsappLabel", "WhatsApp");
  const footerWhatsappUrl = readSetting(settings, "footer.whatsappUrl", "https://wa.me/966552214490");
  const footerCopyRight = readSetting(settings, "footer.copyRight", `© 2026 ${companyName}. جميع الحقوق محفوظة.`);
  const footerBottomNote = readSetting(settings, "footer.bottomNote", "تركيب، صيانة، وتحديث أنظمة المصاعد وفق معايير السلامة.");

  return (
    <>
      <PublicHeader
        companyName={companyName}
        companyTagline={companyTagline}
        supportPhone={supportPhone}
        logoUrl={companyLogoUrl}
        navItems={navItems}
        clientLoginLabel={clientLoginLabel}
      />
      <main className="pt-[92px]">{children}</main>
      <PublicFooter
        companyName={companyName}
        supportEmail={supportEmail}
        supportPhone={supportPhone}
        city={city}
        navItems={navItems}
        aboutText={footerDescription}
        companyPanelImageUrl={footerCompanyImageUrl}
        linksTitle={footerLinksTitle}
        contactTitle={footerContactTitle}
        loginLabel={footerLoginLabel}
        socialTitle={footerSocialTitle}
        socialLinks={[
          { key: "facebook", label: footerFacebookLabel, href: footerFacebookUrl },
          { key: "instagram", label: footerInstagramLabel, href: footerInstagramUrl },
          { key: "whatsapp", label: footerWhatsappLabel, href: footerWhatsappUrl }
        ]}
        copyRightText={footerCopyRight}
        bottomNote={footerBottomNote}
      />
    </>
  );
}
