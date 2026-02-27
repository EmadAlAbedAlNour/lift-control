export type SettingsTabId = "navbar" | "banner" | "hero" | "footer";

interface SelectOption {
  value: string;
  label: string;
}

export type FieldKind = "text" | "textarea" | "image" | "select" | "number" | "image_list";

export interface SettingField {
  key: string;
  label: string;
  kind: FieldKind;
  help?: string;
  rows?: number;
  min?: number;
  max?: number;
  options?: SelectOption[];
}

export interface SettingsTab {
  id: SettingsTabId;
  title: string;
  description: string;
  fields: SettingField[];
}

export const settingsTabs: SettingsTab[] = [
  {
    id: "navbar",
    title: "الشريط العلوي",
    description: "تخصيص عناصر الـ Navbar في واجهة الموقع.",
    fields: [
      { key: "profile.companyLogoUrl", label: "شعار الشركة", kind: "image" },
      { key: "profile.companyName", label: "اسم الشركة", kind: "text" },
      { key: "profile.companyTagline", label: "الوصف المختصر أسفل الاسم", kind: "text" },
      { key: "profile.supportPhone", label: "رقم التواصل", kind: "text" },
      { key: "nav.clientLoginLabel", label: "تسمية زر دخول العملاء", kind: "text" },
      { key: "nav.homeLabel", label: "تسمية الرئيسية", kind: "text" },
      { key: "nav.servicesLabel", label: "تسمية الخدمات", kind: "text" },
      { key: "nav.productsLabel", label: "تسمية المنتجات", kind: "text" },
      { key: "nav.projectsLabel", label: "تسمية المشاريع", kind: "text" },
      { key: "nav.aboutLabel", label: "تسمية عن الشركة", kind: "text" },
      { key: "nav.contactLabel", label: "تسمية التواصل", kind: "text" }
    ]
  },
  {
    id: "banner",
    title: "البانر الرئيسي",
    description: "إدارة صور البانر مع التحريك التلقائي في الصفحة الرئيسية.",
    fields: [
      {
        key: "landing.homeBannerImages",
        label: "صور البانر المتعددة",
        kind: "image_list",
        help: "يمكنك إضافة أكثر من صورة. سيتم عرضها بالتسلسل."
      },
      {
        key: "landing.homeBannerAutoPlay",
        label: "التحريك التلقائي",
        kind: "select",
        options: [
          { value: "enabled", label: "مفعّل" },
          { value: "disabled", label: "معطّل" }
        ]
      },
      {
        key: "landing.homeBannerIntervalMs",
        label: "مدة عرض كل صورة (ms)",
        kind: "number",
        min: 2500,
        max: 15000
      }
    ]
  },
  {
    id: "hero",
    title: "الهيرو سيكشن",
    description: "تعديل النصوص والصورة الرئيسية أسفل البانر.",
    fields: [
      { key: "landing.hero.eyebrow", label: "سطر تعريفي", kind: "text" },
      { key: "landing.hero.titleLine1", label: "العنوان - السطر الأول", kind: "text" },
      { key: "landing.hero.titleLine2", label: "العنوان - السطر الثاني", kind: "text" },
      { key: "landing.hero.description", label: "الوصف", kind: "textarea", rows: 4 },
      { key: "landing.hero.primaryCtaLabel", label: "زر أساسي - نص", kind: "text" },
      { key: "landing.hero.primaryCtaHref", label: "زر أساسي - رابط", kind: "text" },
      { key: "landing.hero.secondaryCtaLabel", label: "زر ثانوي - نص", kind: "text" },
      { key: "landing.hero.secondaryCtaHref", label: "زر ثانوي - رابط", kind: "text" },
      { key: "landing.hero.cardImage", label: "صورة الهيرو", kind: "image" }
    ]
  },
  {
    id: "footer",
    title: "الفوتر",
    description: "تعديل محتوى الفوتر في جميع الصفحات العامة.",
    fields: [
      { key: "footer.description", label: "وصف الشركة في الفوتر", kind: "textarea", rows: 4 },
      { key: "footer.companyImageUrl", label: "صورة إضافية في بطاقة الشركة", kind: "image" },
      { key: "footer.linksTitle", label: "عنوان عمود الروابط", kind: "text" },
      { key: "footer.contactTitle", label: "عنوان عمود التواصل", kind: "text" },
      { key: "footer.loginLabel", label: "تسمية رابط دخول العملاء", kind: "text" },
      { key: "profile.supportEmail", label: "بريد التواصل", kind: "text" },
      { key: "profile.supportPhone", label: "رقم التواصل", kind: "text" },
      { key: "profile.city", label: "الموقع/المدينة", kind: "text" },
      { key: "footer.socialTitle", label: "عنوان قسم السوشال ميديا", kind: "text" },
      { key: "footer.facebookLabel", label: "تسمية فيسبوك", kind: "text" },
      {
        key: "footer.facebookUrl",
        label: "رابط فيسبوك",
        kind: "text",
        help: "مثال: https://facebook.com/your-page"
      },
      { key: "footer.instagramLabel", label: "تسمية إنستغرام", kind: "text" },
      {
        key: "footer.instagramUrl",
        label: "رابط إنستغرام",
        kind: "text",
        help: "مثال: https://instagram.com/your-page"
      },
      { key: "footer.whatsappLabel", label: "تسمية واتساب", kind: "text" },
      {
        key: "footer.whatsappUrl",
        label: "رابط واتساب",
        kind: "text",
        help: "مثال: https://wa.me/966500000000"
      },
      { key: "footer.copyRight", label: "سطر الحقوق", kind: "text" },
      { key: "footer.bottomNote", label: "السطر السفلي", kind: "text" }
    ]
  }
];
