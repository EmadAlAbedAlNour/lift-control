export type PublicPageId = "home" | "services" | "products" | "projects" | "about" | "contact";

type FieldKind = "text" | "textarea";

export interface PageField {
  key: string;
  label: string;
  kind: FieldKind;
  rows?: number;
}

export interface PublicPageConfig {
  id: PublicPageId;
  title: string;
  path: string;
  description: string;
  fields: PageField[];
}

export const publicPagesConfig: PublicPageConfig[] = [
  {
    id: "home",
    title: "الرئيسية",
    path: "/",
    description: "إعدادات المحتوى الظاهر في الصفحة الرئيسية (عدا Navbar/Banner/Hero/Footer).",
    fields: [
      { key: "pages.home.productsEyebrow", label: "منتجاتنا - سطر تعريفي", kind: "text" },
      { key: "pages.home.productsTitle", label: "منتجاتنا - العنوان", kind: "text" },
      { key: "pages.home.productsDescription", label: "منتجاتنا - الوصف", kind: "textarea", rows: 3 },
      { key: "landing.featured.eyebrow", label: "المشاريع المختارة - سطر تعريفي", kind: "text" },
      { key: "landing.featured.title", label: "المشاريع المختارة - العنوان", kind: "text" },
      { key: "landing.featured.description", label: "المشاريع المختارة - الوصف", kind: "textarea", rows: 3 },
      { key: "landing.featured.ctaLabel", label: "المشاريع المختارة - زر عرض الكل", kind: "text" }
    ]
  },
  {
    id: "services",
    title: "الخدمات",
    path: "/services",
    description: "تحرير نصوص صفحة الخدمات والبطاقات والأزرار.",
    fields: [
      { key: "landing.services.eyebrow", label: "سطر تعريفي", kind: "text" },
      { key: "landing.services.title", label: "العنوان", kind: "text" },
      { key: "landing.services.description", label: "الوصف", kind: "textarea", rows: 3 },
      { key: "landing.services.card1.title", label: "بطاقة 1 - عنوان", kind: "text" },
      { key: "landing.services.card1.description", label: "بطاقة 1 - وصف", kind: "textarea", rows: 3 },
      { key: "landing.services.card1.points", label: "بطاقة 1 - نقاط (كل نقطة بسطر)", kind: "textarea", rows: 4 },
      { key: "landing.services.card2.title", label: "بطاقة 2 - عنوان", kind: "text" },
      { key: "landing.services.card2.description", label: "بطاقة 2 - وصف", kind: "textarea", rows: 3 },
      { key: "landing.services.card2.points", label: "بطاقة 2 - نقاط (كل نقطة بسطر)", kind: "textarea", rows: 4 },
      { key: "landing.services.card3.title", label: "بطاقة 3 - عنوان", kind: "text" },
      { key: "landing.services.card3.description", label: "بطاقة 3 - وصف", kind: "textarea", rows: 3 },
      { key: "landing.services.card3.points", label: "بطاقة 3 - نقاط (كل نقطة بسطر)", kind: "textarea", rows: 4 },
      { key: "pages.services.primaryCtaLabel", label: "زر رئيسي", kind: "text" },
      { key: "pages.services.secondaryCtaLabel", label: "زر ثانوي", kind: "text" }
    ]
  },
  {
    id: "products",
    title: "المنتجات",
    path: "/our-products",
    description: "تحرير نصوص صفحة عرض الأقسام والنداء للتواصل.",
    fields: [
      { key: "pages.products.title", label: "العنوان", kind: "text" },
      { key: "pages.products.description", label: "الوصف", kind: "textarea", rows: 3 },
      { key: "pages.products.inquiryTitle", label: "عنوان صندوق الاستفسار", kind: "text" },
      { key: "pages.products.inquiryDescription", label: "وصف صندوق الاستفسار", kind: "textarea", rows: 3 },
      { key: "pages.products.primaryCtaLabel", label: "زر الاستفسار الرئيسي", kind: "text" },
      { key: "pages.products.secondaryCtaLabel", label: "زر الاستفسار الثانوي", kind: "text" }
    ]
  },
  {
    id: "projects",
    title: "المشاريع",
    path: "/projects",
    description: "تحرير عنوان ووصف صفحة المشاريع العامة.",
    fields: [
      { key: "pages.projects.eyebrow", label: "سطر تعريفي", kind: "text" },
      { key: "pages.projects.title", label: "العنوان", kind: "text" },
      { key: "pages.projects.description", label: "الوصف", kind: "textarea", rows: 3 }
    ]
  },
  {
    id: "about",
    title: "عن الشركة",
    path: "/about",
    description: "تحرير محتوى صفحة عن الشركة وخطوات التنفيذ.",
    fields: [
      { key: "landing.about.eyebrow", label: "سطر تعريفي", kind: "text" },
      { key: "landing.about.title", label: "العنوان", kind: "text" },
      { key: "landing.about.description", label: "الوصف", kind: "textarea", rows: 3 },
      { key: "landing.about.step1.title", label: "الخطوة 1 - عنوان", kind: "text" },
      { key: "landing.about.step1.detail", label: "الخطوة 1 - تفاصيل", kind: "textarea", rows: 3 },
      { key: "landing.about.step2.title", label: "الخطوة 2 - عنوان", kind: "text" },
      { key: "landing.about.step2.detail", label: "الخطوة 2 - تفاصيل", kind: "textarea", rows: 3 },
      { key: "landing.about.step3.title", label: "الخطوة 3 - عنوان", kind: "text" },
      { key: "landing.about.step3.detail", label: "الخطوة 3 - تفاصيل", kind: "textarea", rows: 3 },
      { key: "landing.about.whyTitle", label: "لماذا نحن؟ - عنوان", kind: "text" },
      { key: "landing.about.whyDescription", label: "لماذا نحن؟ - وصف", kind: "textarea", rows: 3 },
      { key: "landing.about.strengths", label: "نقاط القوة (كل نقطة بسطر)", kind: "textarea", rows: 4 },
      { key: "landing.about.readinessLabel", label: "عنوان الجاهزية", kind: "text" },
      { key: "landing.about.readinessValue", label: "قيمة الجاهزية", kind: "text" },
      { key: "pages.about.ctaTitle", label: "صندوق CTA - عنوان", kind: "text" },
      { key: "pages.about.ctaDescription", label: "صندوق CTA - وصف", kind: "textarea", rows: 3 },
      { key: "pages.about.primaryCtaLabel", label: "صندوق CTA - زر رئيسي", kind: "text" },
      { key: "pages.about.secondaryCtaLabel", label: "صندوق CTA - زر ثانوي", kind: "text" }
    ]
  },
  {
    id: "contact",
    title: "التواصل",
    path: "/contact",
    description: "تحرير نصوص صفحة التواصل وصندوق ساعات العمل.",
    fields: [
      { key: "landing.contact.eyebrow", label: "سطر تعريفي", kind: "text" },
      { key: "landing.contact.title", label: "العنوان", kind: "text" },
      { key: "landing.contact.description", label: "الوصف", kind: "textarea", rows: 3 },
      { key: "landing.contact.phoneLabel", label: "زر الهاتف", kind: "text" },
      { key: "landing.contact.emailLabel", label: "زر البريد", kind: "text" },
      { key: "landing.contact.loginLabel", label: "زر دخول العملاء", kind: "text" },
      { key: "landing.contact.loginHref", label: "رابط زر دخول العملاء", kind: "text" },
      { key: "pages.contact.hoursTitle", label: "عنوان صندوق ساعات العمل", kind: "text" },
      { key: "pages.contact.hoursDescription", label: "وصف صندوق ساعات العمل", kind: "textarea", rows: 3 },
      { key: "pages.contact.hoursCard1Title", label: "بطاقة 1 - عنوان", kind: "text" },
      { key: "pages.contact.hoursCard1Value", label: "بطاقة 1 - قيمة", kind: "text" },
      { key: "pages.contact.hoursCard2Title", label: "بطاقة 2 - عنوان", kind: "text" },
      { key: "pages.contact.hoursCard2Value", label: "بطاقة 2 - قيمة", kind: "text" },
      { key: "pages.contact.hoursCard3Title", label: "بطاقة 3 - عنوان", kind: "text" },
      { key: "pages.contact.hoursCard3Value", label: "بطاقة 3 - قيمة", kind: "text" }
    ]
  }
];
