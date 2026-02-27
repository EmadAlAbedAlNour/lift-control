import {
  Customer as CustomerModel,
  Notification,
  NotificationChannel,
  Product,
  ProductSection,
  ProjectStatus,
  ProjectType,
  SettingCategory,
  SystemSetting,
  User,
  UserRole,
  type LiftProject
} from "@prisma/client";

import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { db } from "@/lib/db";
import {
  Customer as CustomerView,
  LiftProject as LiftProjectView,
  NotificationItem,
  ProductItem as ProductItemView,
  ProductSection as ProductSectionView,
  PlatformUser,
  ProjectStatus as AppProjectStatus,
  SystemSetting as AppSystemSetting,
  UserRole as AppUserRole
} from "@/lib/types";
import { ensureImageUrl } from "@/lib/utils/image";
import { normalizeNameKey } from "@/lib/utils/text";

export const roleToApp: Record<UserRole, AppUserRole> = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  USER: "user"
};

export const roleToDb: Record<AppUserRole, UserRole> = {
  admin: "ADMIN",
  supervisor: "SUPERVISOR",
  user: "USER"
};

const statusToApp: Record<ProjectStatus, AppProjectStatus> = {
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
  NEW: "new",
  PLANNED: "planned"
};

export const statusToDb: Record<AppProjectStatus, ProjectStatus> = {
  completed: "COMPLETED",
  in_progress: "IN_PROGRESS",
  new: "NEW",
  planned: "PLANNED"
};

const typeToApp: Record<ProjectType, LiftProjectView["type"]> = {
  CARGO: "cargo",
  HOSPITAL: "hospital",
  PANORAMIC: "panoramic",
  PASSENGER: "passenger"
};

export const typeToDb: Record<LiftProjectView["type"], ProjectType> = {
  cargo: "CARGO",
  hospital: "HOSPITAL",
  panoramic: "PANORAMIC",
  passenger: "PASSENGER"
};

const settingCategoryToApp: Record<SettingCategory, AppSystemSetting["category"]> = {
  BILLING: "billing",
  NOTIFICATIONS: "notifications",
  PROFILE: "profile",
  SECURITY: "security"
};

const channelToApp: Record<NotificationChannel, NotificationItem["channel"]> = {
  EMAIL: "email",
  IN_APP: "in_app"
};

interface SystemSettingDefault {
  key: string;
  label: string;
  value: string;
  category: SettingCategory;
}

const defaultSystemSettings: SystemSettingDefault[] = [
  {
    key: "profile.companyName",
    label: "اسم الشركة",
    value: "Lift Control",
    category: "PROFILE"
  },
  {
    key: "profile.companyTagline",
    label: "وصف الشركة المختصر",
    value: "لإنتاج المصاعد الكهربائية",
    category: "PROFILE"
  },
  {
    key: "profile.companyLogoUrl",
    label: "رابط شعار الشركة",
    value: DEFAULT_IMAGE_URLS.companyLogo,
    category: "PROFILE"
  },
  {
    key: "profile.supportEmail",
    label: "بريد الدعم",
    value: "support@liftcontrol.sa",
    category: "PROFILE"
  },
  {
    key: "profile.supportPhone",
    label: "رقم التواصل",
    value: "+966 55 221 4490",
    category: "PROFILE"
  },
  {
    key: "profile.city",
    label: "المدينة",
    value: "الرياض - المملكة العربية السعودية",
    category: "PROFILE"
  },
  {
    key: "notifications.emailDailyDigest",
    label: "ملخص يومي عبر البريد",
    value: "enabled",
    category: "NOTIFICATIONS"
  },
  {
    key: "security.twoFactor",
    label: "التحقق بخطوتين",
    value: "optional",
    category: "SECURITY"
  },
  {
    key: "billing.installmentPolicy",
    label: "سياسة الدفع",
    value: "50% قبل التركيب - 50% بعد التسليم",
    category: "BILLING"
  },
  {
    key: "landing.hero.eyebrow",
    label: "الهيرو: سطر تعريفي",
    value: "شركة مصاعد متخصصة",
    category: "PROFILE"
  },
  {
    key: "landing.hero.titleLine1",
    label: "الهيرو: العنوان سطر 1",
    value: "تركيب وصيانة المصاعد",
    category: "PROFILE"
  },
  {
    key: "landing.hero.titleLine2",
    label: "الهيرو: العنوان سطر 2",
    value: "بمعايير أمان عالية",
    category: "PROFILE"
  },
  {
    key: "landing.hero.description",
    label: "الهيرو: الوصف",
    value:
      "نقدم حلولا متكاملة للمشاريع السكنية والتجارية والطبية: من المعاينة والتصميم، إلى التنفيذ، ثم الصيانة الدورية والدعم الفني.",
    category: "PROFILE"
  },
  {
    key: "landing.hero.primaryCtaLabel",
    label: "الهيرو: زر رئيسي",
    value: "اطلب عرض سعر",
    category: "PROFILE"
  },
  {
    key: "landing.hero.primaryCtaHref",
    label: "الهيرو: رابط الزر الرئيسي",
    value: "/contact",
    category: "PROFILE"
  },
  {
    key: "landing.hero.secondaryCtaLabel",
    label: "الهيرو: زر ثانوي",
    value: "استعرض مشاريعنا",
    category: "PROFILE"
  },
  {
    key: "landing.hero.secondaryCtaHref",
    label: "الهيرو: رابط الزر الثانوي",
    value: "/projects",
    category: "PROFILE"
  },
  {
    key: "landing.hero.stat1Label",
    label: "الهيرو: إحصائية 1 عنوان",
    value: "مشاريع منجزة",
    category: "PROFILE"
  },
  {
    key: "landing.hero.stat1Value",
    label: "الهيرو: إحصائية 1 قيمة",
    value: "+180",
    category: "PROFILE"
  },
  {
    key: "landing.hero.stat2Label",
    label: "الهيرو: إحصائية 2 عنوان",
    value: "عقود صيانة فعالة",
    category: "PROFILE"
  },
  {
    key: "landing.hero.stat2Value",
    label: "الهيرو: إحصائية 2 قيمة",
    value: "74 عقد",
    category: "PROFILE"
  },
  {
    key: "landing.hero.stat3Label",
    label: "الهيرو: إحصائية 3 عنوان",
    value: "متوسط الاستجابة",
    category: "PROFILE"
  },
  {
    key: "landing.hero.stat3Value",
    label: "الهيرو: إحصائية 3 قيمة",
    value: "2.5 ساعة",
    category: "PROFILE"
  },
  {
    key: "landing.hero.cardImage",
    label: "الهيرو: صورة البطاقة",
    value: DEFAULT_IMAGE_URLS.heroCard,
    category: "PROFILE"
  },
  {
    key: "landing.hero.cardTitle",
    label: "الهيرو: عنوان البطاقة",
    value: "ابدأ بخطوة بسيطة",
    category: "PROFILE"
  },
  {
    key: "landing.hero.cardDescription",
    label: "الهيرو: وصف البطاقة",
    value: "تواصل معنا وحدد نوع المبنى، وسنرتب معاينة فنية مع عرض واضح للتنفيذ أو الصيانة.",
    category: "PROFILE"
  },
  {
    key: "landing.hero.cardPhone",
    label: "الهيرو: هاتف البطاقة",
    value: "+966 55 221 4490",
    category: "PROFILE"
  },
  {
    key: "landing.hero.cardEmail",
    label: "الهيرو: بريد البطاقة",
    value: "support@liftcontrol.sa",
    category: "PROFILE"
  },
  {
    key: "landing.hero.cardCity",
    label: "الهيرو: مدينة البطاقة",
    value: "الرياض - المملكة العربية السعودية",
    category: "PROFILE"
  },
  {
    key: "landing.homeBannerImage",
    label: "الرئيسية: صورة البانر تحت النافبار",
    value: DEFAULT_IMAGE_URLS.banner,
    category: "PROFILE"
  },
  {
    key: "landing.services.eyebrow",
    label: "الخدمات: سطر تعريفي",
    value: "خدماتنا",
    category: "PROFILE"
  },
  {
    key: "landing.services.title",
    label: "الخدمات: العنوان",
    value: "حلول مصاعد تناسب نوع مشروعك",
    category: "PROFILE"
  },
  {
    key: "landing.services.description",
    label: "الخدمات: الوصف",
    value: "ننفذ دورة العمل كاملة من الدراسة والتوريد والتركيب إلى التشغيل والصيانة طويلة المدى.",
    category: "PROFILE"
  },
  {
    key: "landing.services.card1.title",
    label: "الخدمات: بطاقة 1 عنوان",
    value: "تركيب المصاعد للمباني الجديدة",
    category: "PROFILE"
  },
  {
    key: "landing.services.card1.description",
    label: "الخدمات: بطاقة 1 وصف",
    value: "ننفذ المصعد من أول دراسة حتى التسليم النهائي مع مطابقة اشتراطات السلامة والاعتماد.",
    category: "PROFILE"
  },
  {
    key: "landing.services.card1.points",
    label: "الخدمات: بطاقة 1 نقاط",
    value: "زيارة ومعاينة الموقع\nتصميم مناسب للمساحة والحمولة\nاختبارات تشغيل قبل التسليم",
    category: "PROFILE"
  },
  {
    key: "landing.services.card2.title",
    label: "الخدمات: بطاقة 2 عنوان",
    value: "عقود صيانة وقائية وتشغيلية",
    category: "PROFILE"
  },
  {
    key: "landing.services.card2.description",
    label: "الخدمات: بطاقة 2 وصف",
    value: "برنامج صيانة دوري يقلل الأعطال المفاجئة ويرفع عمر المكونات الأساسية للمصعد.",
    category: "PROFILE"
  },
  {
    key: "landing.services.card2.points",
    label: "الخدمات: بطاقة 2 نقاط",
    value: "زيارات دورية مجدولة\nبلاغات طوارئ على مدار الساعة\nتقارير فنية واضحة",
    category: "PROFILE"
  },
  {
    key: "landing.services.card3.title",
    label: "الخدمات: بطاقة 3 عنوان",
    value: "تحديث المصاعد القديمة",
    category: "PROFILE"
  },
  {
    key: "landing.services.card3.description",
    label: "الخدمات: بطاقة 3 وصف",
    value: "تطوير لوحات التحكم والمحركات وأنظمة الأمان للمصاعد القديمة دون تغيير كامل البنية.",
    category: "PROFILE"
  },
  {
    key: "landing.services.card3.points",
    label: "الخدمات: بطاقة 3 نقاط",
    value: "رفع كفاءة التشغيل\nتقليل استهلاك الطاقة\nتحسين مستوى الأمان",
    category: "PROFILE"
  },
  {
    key: "landing.featured.eyebrow",
    label: "المشاريع المختارة: سطر تعريفي",
    value: "مشاريع مختارة",
    category: "PROFILE"
  },
  {
    key: "landing.featured.title",
    label: "المشاريع المختارة: العنوان",
    value: "نماذج من أعمالنا الحديثة",
    category: "PROFILE"
  },
  {
    key: "landing.featured.description",
    label: "المشاريع المختارة: الوصف",
    value: "استعرض مشاريعنا المنفذة لمعرفة التفاصيل الفنية، الحالة التشغيلية، وخطة الزيارات القادمة.",
    category: "PROFILE"
  },
  {
    key: "landing.featured.ctaLabel",
    label: "المشاريع المختارة: زر عرض الكل",
    value: "عرض كل المشاريع",
    category: "PROFILE"
  },
  {
    key: "landing.about.eyebrow",
    label: "عن الشركة: سطر تعريفي",
    value: "آلية العمل",
    category: "PROFILE"
  },
  {
    key: "landing.about.title",
    label: "عن الشركة: العنوان",
    value: "طريقة تنفيذ واضحة من البداية للنهاية",
    category: "PROFILE"
  },
  {
    key: "landing.about.description",
    label: "عن الشركة: الوصف",
    value: "نعتمد خطوات تشغيل ثابتة تضمن الجودة، السلامة، والالتزام بالوقت.",
    category: "PROFILE"
  },
  {
    key: "landing.about.step1.title",
    label: "عن الشركة: خطوة 1 عنوان",
    value: "1) المعاينة الفنية",
    category: "PROFILE"
  },
  {
    key: "landing.about.step1.detail",
    label: "عن الشركة: خطوة 1 تفاصيل",
    value: "فحص الموقع، تحديد المتطلبات، ورفع تقرير فني أولي خلال وقت قصير.",
    category: "PROFILE"
  },
  {
    key: "landing.about.step2.title",
    label: "عن الشركة: خطوة 2 عنوان",
    value: "2) العرض الفني والمالي",
    category: "PROFILE"
  },
  {
    key: "landing.about.step2.detail",
    label: "عن الشركة: خطوة 2 تفاصيل",
    value: "إرسال عرض واضح يشمل المواصفات، الجدول الزمني، وتكلفة التنفيذ.",
    category: "PROFILE"
  },
  {
    key: "landing.about.step3.title",
    label: "عن الشركة: خطوة 3 عنوان",
    value: "3) التنفيذ والمتابعة",
    category: "PROFILE"
  },
  {
    key: "landing.about.step3.detail",
    label: "عن الشركة: خطوة 3 تفاصيل",
    value: "تركيب أو صيانة مع متابعة مستمرة وتقارير حتى اكتمال العمل.",
    category: "PROFILE"
  },
  {
    key: "landing.about.whyTitle",
    label: "عن الشركة: لماذا نحن؟ العنوان",
    value: "لماذا Lift Control؟",
    category: "PROFILE"
  },
  {
    key: "landing.about.whyDescription",
    label: "عن الشركة: لماذا نحن؟ الوصف",
    value: "نركز على الاعتمادية والأمان وسرعة الاستجابة، مع فريق متخصص في مصاعد المشاريع والفلل والمرافق الطبية.",
    category: "PROFILE"
  },
  {
    key: "landing.about.strengths",
    label: "عن الشركة: نقاط القوة",
    value:
      "فريق هندسي وفني معتمد\nالتزام بمواعيد الزيارات والصيانة\nتغطية مشاريع سكنية وتجارية وطبية\nقنوات تواصل سريعة طوال أيام الأسبوع",
    category: "PROFILE"
  },
  {
    key: "landing.about.readinessLabel",
    label: "عن الشركة: عنوان الجاهزية",
    value: "جاهزية الفرق الميدانية",
    category: "PROFILE"
  },
  {
    key: "landing.about.readinessValue",
    label: "عن الشركة: قيمة الجاهزية",
    value: "24/7",
    category: "PROFILE"
  },
  {
    key: "landing.contact.eyebrow",
    label: "التواصل: سطر تعريفي",
    value: "تواصل معنا",
    category: "PROFILE"
  },
  {
    key: "landing.contact.title",
    label: "التواصل: العنوان",
    value: "نسعد بخدمتك في أي وقت",
    category: "PROFILE"
  },
  {
    key: "landing.contact.description",
    label: "التواصل: الوصف",
    value: "إذا لديك مشروع جديد أو مصعد يحتاج صيانة، أرسل لنا التفاصيل وسنعود لك بعرض مناسب.",
    category: "PROFILE"
  },
  {
    key: "landing.contact.phoneLabel",
    label: "التواصل: زر الهاتف",
    value: "اتصل الآن",
    category: "PROFILE"
  },
  {
    key: "landing.contact.phoneHref",
    label: "التواصل: رابط الهاتف",
    value: "tel:+966552214490",
    category: "PROFILE"
  },
  {
    key: "landing.contact.emailLabel",
    label: "التواصل: زر البريد",
    value: "إرسال بريد",
    category: "PROFILE"
  },
  {
    key: "landing.contact.emailHref",
    label: "التواصل: رابط البريد",
    value: "mailto:support@liftcontrol.sa",
    category: "PROFILE"
  },
  {
    key: "landing.contact.loginLabel",
    label: "التواصل: زر تسجيل الدخول",
    value: "دخول العملاء الحاليين",
    category: "PROFILE"
  },
  {
    key: "landing.contact.loginHref",
    label: "التواصل: رابط تسجيل الدخول",
    value: "/auth/login",
    category: "PROFILE"
  },
  {
    key: "nav.clientLoginLabel",
    label: "النافبار: تسمية زر دخول العملاء",
    value: "دخول العملاء",
    category: "PROFILE"
  },
  {
    key: "nav.homeLabel",
    label: "النافبار: تسمية الرئيسية",
    value: "الرئيسية",
    category: "PROFILE"
  },
  {
    key: "nav.servicesLabel",
    label: "النافبار: تسمية الخدمات",
    value: "الخدمات",
    category: "PROFILE"
  },
  {
    key: "nav.productsLabel",
    label: "النافبار: تسمية المنتجات",
    value: "المنتجات",
    category: "PROFILE"
  },
  {
    key: "nav.projectsLabel",
    label: "النافبار: تسمية المشاريع",
    value: "المشاريع",
    category: "PROFILE"
  },
  {
    key: "nav.aboutLabel",
    label: "النافبار: تسمية عن الشركة",
    value: "عن الشركة",
    category: "PROFILE"
  },
  {
    key: "nav.contactLabel",
    label: "النافبار: تسمية التواصل",
    value: "التواصل",
    category: "PROFILE"
  },
  {
    key: "landing.homeBannerImages",
    label: "الرئيسية: صور البانر المتعددة",
    value: DEFAULT_IMAGE_URLS.banner,
    category: "PROFILE"
  },
  {
    key: "landing.homeBannerAutoPlay",
    label: "الرئيسية: تحريك البانر تلقائيا",
    value: "enabled",
    category: "PROFILE"
  },
  {
    key: "landing.homeBannerIntervalMs",
    label: "الرئيسية: مدة عرض صورة البانر",
    value: "5000",
    category: "PROFILE"
  },
  {
    key: "footer.description",
    label: "الفوتر: وصف الشركة",
    value: "شركة متخصصة في تركيب وصيانة المصاعد للمشاريع السكنية والتجارية والطبية، مع دعم فني مستمر وتقارير أداء واضحة.",
    category: "PROFILE"
  },
  {
    key: "footer.companyImageUrl",
    label: "الفوتر: صورة بطاقة الشركة",
    value: DEFAULT_IMAGE_URLS.companyLogo,
    category: "PROFILE"
  },
  {
    key: "footer.linksTitle",
    label: "الفوتر: عنوان عمود الروابط",
    value: "روابط مهمة",
    category: "PROFILE"
  },
  {
    key: "footer.contactTitle",
    label: "الفوتر: عنوان عمود التواصل",
    value: "التواصل",
    category: "PROFILE"
  },
  {
    key: "footer.loginLabel",
    label: "الفوتر: تسمية رابط دخول العملاء",
    value: "دخول العملاء",
    category: "PROFILE"
  },
  {
    key: "footer.socialTitle",
    label: "الفوتر: عنوان قسم السوشال",
    value: "تابعنا",
    category: "PROFILE"
  },
  {
    key: "footer.facebookLabel",
    label: "الفوتر: تسمية رابط فيسبوك",
    value: "Facebook",
    category: "PROFILE"
  },
  {
    key: "footer.facebookUrl",
    label: "الفوتر: رابط فيسبوك",
    value: "https://facebook.com",
    category: "PROFILE"
  },
  {
    key: "footer.instagramLabel",
    label: "الفوتر: تسمية رابط إنستغرام",
    value: "Instagram",
    category: "PROFILE"
  },
  {
    key: "footer.instagramUrl",
    label: "الفوتر: رابط إنستغرام",
    value: "https://instagram.com",
    category: "PROFILE"
  },
  {
    key: "footer.whatsappLabel",
    label: "الفوتر: تسمية رابط واتساب",
    value: "WhatsApp",
    category: "PROFILE"
  },
  {
    key: "footer.whatsappUrl",
    label: "الفوتر: رابط واتساب",
    value: "https://wa.me/966552214490",
    category: "PROFILE"
  },
  {
    key: "footer.copyRight",
    label: "الفوتر: سطر الحقوق",
    value: "© 2026 Lift Control. جميع الحقوق محفوظة.",
    category: "PROFILE"
  },
  {
    key: "footer.bottomNote",
    label: "الفوتر: السطر السفلي",
    value: "تركيب، صيانة، وتحديث أنظمة المصاعد وفق معايير السلامة.",
    category: "PROFILE"
  },
  {
    key: "pages.home.productsEyebrow",
    label: "الرئيسية: سطر تعريفي لقسم المنتجات",
    value: "منتجاتنا",
    category: "PROFILE"
  },
  {
    key: "pages.home.productsTitle",
    label: "الرئيسية: عنوان قسم المنتجات",
    value: "الأقسام المتوفرة",
    category: "PROFILE"
  },
  {
    key: "pages.home.productsDescription",
    label: "الرئيسية: وصف قسم المنتجات",
    value: "استعرض أقسام المنتجات المتاحة واضغط استعراض لفتح صفحة كل قسم.",
    category: "PROFILE"
  },
  {
    key: "pages.services.primaryCtaLabel",
    label: "الخدمات: زر CTA أساسي",
    value: "اطلب معاينة فنية",
    category: "PROFILE"
  },
  {
    key: "pages.services.secondaryCtaLabel",
    label: "الخدمات: زر CTA ثانوي",
    value: "تصفح المشاريع",
    category: "PROFILE"
  },
  {
    key: "pages.products.title",
    label: "المنتجات: عنوان الصفحة",
    value: "تصفح الأقسام",
    category: "PROFILE"
  },
  {
    key: "pages.products.description",
    label: "المنتجات: وصف الصفحة",
    value: "اختر القسم المطلوب لعرض كل منتجاته في صفحة مستقلة.",
    category: "PROFILE"
  },
  {
    key: "pages.products.inquiryTitle",
    label: "المنتجات: عنوان صندوق الاستفسار",
    value: "بحاجة منتج غير موجود؟",
    category: "PROFILE"
  },
  {
    key: "pages.products.inquiryDescription",
    label: "المنتجات: وصف صندوق الاستفسار",
    value: "تواصل معنا بالمواصفات المطلوبة وسنجهز لك خيارات توريد مناسبة مع السعر ومدة التسليم.",
    category: "PROFILE"
  },
  {
    key: "pages.products.primaryCtaLabel",
    label: "المنتجات: زر الاستفسار الأساسي",
    value: "طلب عرض سعر",
    category: "PROFILE"
  },
  {
    key: "pages.products.secondaryCtaLabel",
    label: "المنتجات: زر الاستفسار الثانوي",
    value: "اتصال مباشر",
    category: "PROFILE"
  },
  {
    key: "pages.projects.eyebrow",
    label: "المشاريع: سطر تعريفي",
    value: "معرض المشاريع",
    category: "PROFILE"
  },
  {
    key: "pages.projects.title",
    label: "المشاريع: عنوان الصفحة",
    value: "استعرض مشاريع التركيب والصيانة",
    category: "PROFILE"
  },
  {
    key: "pages.projects.description",
    label: "المشاريع: وصف الصفحة",
    value: "هذه نماذج من أعمالنا في المباني السكنية والتجارية والطبية. كل مشروع يحتوي على المواصفات الفنية والحالة التشغيلية.",
    category: "PROFILE"
  },
  {
    key: "pages.about.ctaTitle",
    label: "عن الشركة: عنوان صندوق CTA",
    value: "ابدأ مشروعك معنا",
    category: "PROFILE"
  },
  {
    key: "pages.about.ctaDescription",
    label: "عن الشركة: وصف صندوق CTA",
    value: "شاركنا تفاصيل المبنى أو المصعد الحالي، وسنقترح المسار الأنسب: تركيب جديد، تحديث جزئي، أو عقد صيانة شامل.",
    category: "PROFILE"
  },
  {
    key: "pages.about.primaryCtaLabel",
    label: "عن الشركة: زر CTA أساسي",
    value: "تواصل الآن",
    category: "PROFILE"
  },
  {
    key: "pages.about.secondaryCtaLabel",
    label: "عن الشركة: زر CTA ثانوي",
    value: "تصفح مشاريعنا",
    category: "PROFILE"
  },
  {
    key: "pages.contact.hoursTitle",
    label: "التواصل: عنوان صندوق ساعات العمل",
    value: "ساعات العمل والدعم",
    category: "PROFILE"
  },
  {
    key: "pages.contact.hoursDescription",
    label: "التواصل: وصف صندوق ساعات العمل",
    value: "نستقبل طلبات المعاينة والاستفسارات طوال أيام الأسبوع، كما نوفر دعم فني للحالات العاجلة.",
    category: "PROFILE"
  },
  {
    key: "pages.contact.hoursCard1Title",
    label: "التواصل: بطاقة ساعات 1 عنوان",
    value: "الاستفسارات العامة",
    category: "PROFILE"
  },
  {
    key: "pages.contact.hoursCard1Value",
    label: "التواصل: بطاقة ساعات 1 قيمة",
    value: "من 9 ص إلى 7 م",
    category: "PROFILE"
  },
  {
    key: "pages.contact.hoursCard2Title",
    label: "التواصل: بطاقة ساعات 2 عنوان",
    value: "الدعم الطارئ",
    category: "PROFILE"
  },
  {
    key: "pages.contact.hoursCard2Value",
    label: "التواصل: بطاقة ساعات 2 قيمة",
    value: "24/7",
    category: "PROFILE"
  },
  {
    key: "pages.contact.hoursCard3Title",
    label: "التواصل: بطاقة ساعات 3 عنوان",
    value: "قنوات التواصل",
    category: "PROFILE"
  },
  {
    key: "pages.contact.hoursCard3Value",
    label: "التواصل: بطاقة ساعات 3 قيمة",
    value: "هاتف + بريد + دخول العملاء",
    category: "PROFILE"
  }
];

export const defaultSystemSettingsByKey = new Map(defaultSystemSettings.map((item) => [item.key, item]));

const defaultProductSections: Array<{ name: string; description: string; imageUrl: string; sortOrder: number }> = [
  {
    name: "الإكسسوارات",
    description: "ملحقات المصاعد والقطع التكميلية.",
    imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1280&q=80",
    sortOrder: 10
  },
  {
    name: "الأبواب",
    description: "أبواب المصاعد بأنواعها ومقاساتها.",
    imageUrl: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1280&q=80",
    sortOrder: 20
  },
  {
    name: "ماكينات Gearless",
    description: "ماكينات بدون جيربوكس للمشاريع الحديثة.",
    imageUrl: "https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=1280&q=80",
    sortOrder: 30
  },
  {
    name: "السكك (Rails)",
    description: "سكك التوجيه وملحقات التثبيت.",
    imageUrl: "https://images.unsplash.com/photo-1677358075329-96f93f5c6a2f?auto=format&fit=crop&w=1280&q=80",
    sortOrder: 40
  },
  {
    name: "الكبائن",
    description: "كبائن المصاعد الداخلية والتشطيبات.",
    imageUrl: "https://images.unsplash.com/photo-1529429612778-1d48d34d95b0?auto=format&fit=crop&w=1280&q=80",
    sortOrder: 50
  },
  {
    name: "لوحات التحكم",
    description: "لوحات التحكم الرئيسية وأنظمة التشغيل.",
    imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1280&q=80",
    sortOrder: 60
  },
  {
    name: "ماكينات مع جيربوكس",
    description: "محركات مع جيربوكس للأحمال المختلفة.",
    imageUrl: "https://images.unsplash.com/photo-1707245479405-5bd89389e89f?auto=format&fit=crop&w=1280&q=80",
    sortOrder: 70
  },
  {
    name: "لوحات المصعد الداخلية",
    description: "لوحات الأزرار والشاشات داخل الكبائن.",
    imageUrl: "https://images.unsplash.com/photo-1573511860302-28c524319d2a?auto=format&fit=crop&w=1280&q=80",
    sortOrder: 80
  }
];

let settingsBootstrapPromise: Promise<void> | null = null;
let productSectionsBootstrapPromise: Promise<void> | null = null;
let customersBootstrapPromise: Promise<void> | null = null;

export async function ensureDefaultSystemSettings(): Promise<void> {
  if (!settingsBootstrapPromise) {
    settingsBootstrapPromise = Promise.all(
      defaultSystemSettings.map((item) =>
        db.systemSetting.upsert({
          where: { key: item.key },
          update: {},
          create: item
        })
      )
    )
      .then(() => undefined)
      .catch((error) => {
        settingsBootstrapPromise = null;
        throw error;
      });
  }

  await settingsBootstrapPromise;
}

export async function ensureDefaultProductSections(): Promise<void> {
  if (!productSectionsBootstrapPromise) {
    productSectionsBootstrapPromise = (async () => {
      const existingSectionsCount = await db.productSection.count();

      if (existingSectionsCount > 0) {
        return;
      }

      await db.productSection.createMany({
        data: defaultProductSections
      });
    })()
      .then(() => undefined)
      .catch((error) => {
        productSectionsBootstrapPromise = null;
        throw error;
      });
  }

  await productSectionsBootstrapPromise;
}

function normalizeCustomerName(value: string): string {
  return normalizeNameKey(value);
}

export async function ensureDefaultCustomersFromProjects(): Promise<void> {
  if (!customersBootstrapPromise) {
    customersBootstrapPromise = (async () => {
      const existingCustomers = await db.customer.count();

      if (existingCustomers > 0) {
        return;
      }

      const projects = await db.liftProject.findMany({
        select: {
          clientName: true,
          location: true
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      if (projects.length === 0) {
        return;
      }

      const uniqueCustomers = new Map<string, { name: string; location?: string }>();

      for (const project of projects) {
        const trimmedName = project.clientName.trim();

        if (trimmedName.length === 0) {
          continue;
        }

        const key = normalizeCustomerName(trimmedName);

        if (!uniqueCustomers.has(key)) {
          uniqueCustomers.set(key, {
            name: trimmedName,
            location: toOptionalString(project.location)
          });
        }
      }

      if (uniqueCustomers.size === 0) {
        return;
      }

      await db.customer.createMany({
        data: [...uniqueCustomers.values()].map((item) => ({
          name: item.name,
          location: item.location,
          isActive: true
        }))
      });
    })().catch((error) => {
      customersBootstrapPromise = null;
      throw error;
    });
  }

  await customersBootstrapPromise;
}

const toDate = (value: Date): string => value.toISOString().slice(0, 10);

export const mapUser = (
  user: Pick<User, "id" | "name" | "email" | "phone" | "role" | "avatarUrl" | "createdAt">
): PlatformUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? undefined,
  role: roleToApp[user.role],
  avatarUrl: ensureImageUrl(user.avatarUrl, DEFAULT_IMAGE_URLS.employeeAvatar),
  createdAt: toDate(user.createdAt)
});

export const mapProject = (project: LiftProject): LiftProjectView => ({
  id: project.id,
  title: project.title,
  location: project.location,
  clientName: project.clientName,
  type: typeToApp[project.type],
  floors: project.floors,
  status: statusToApp[project.status],
  nextVisit: toDate(project.nextVisit),
  summary: project.summary,
  specs: {
    speedMps: project.speedMps,
    loadKg: project.loadKg,
    warrantyMonths: project.warrantyMonths
  },
  coverImage: ensureImageUrl(project.coverImage, DEFAULT_IMAGE_URLS.project),
  createdAt: toDate(project.createdAt)
});

export const toOptionalString = (value?: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const mapProduct = (product: Product): ProductItemView => ({
  id: product.id,
  sectionId: product.sectionId,
  name: product.name,
  sku: toOptionalString(product.sku ?? undefined),
  brand: toOptionalString(product.brand ?? undefined),
  summary: product.summary,
  imageUrl: ensureImageUrl(product.imageUrl, DEFAULT_IMAGE_URLS.product),
  isActive: product.isActive,
  sortOrder: product.sortOrder,
  createdAt: toDate(product.createdAt),
  updatedAt: toDate(product.updatedAt)
});

export const mapProductSection = (section: ProductSection & { products: Product[] }): ProductSectionView => ({
  id: section.id,
  name: section.name,
  description: toOptionalString(section.description ?? undefined),
  imageUrl: ensureImageUrl(section.imageUrl, DEFAULT_IMAGE_URLS.section),
  sortOrder: section.sortOrder,
  products: section.products.map(mapProduct),
  createdAt: toDate(section.createdAt),
  updatedAt: toDate(section.updatedAt)
});

export const mapCustomer = (customer: CustomerModel): CustomerView => ({
  id: customer.id,
  name: customer.name,
  email: toOptionalString(customer.email ?? undefined),
  phone: toOptionalString(customer.phone ?? undefined),
  location: toOptionalString(customer.location ?? undefined),
  notes: toOptionalString(customer.notes ?? undefined),
  isActive: customer.isActive,
  createdAt: toDate(customer.createdAt),
  updatedAt: toDate(customer.updatedAt)
});

export const mapSetting = (setting: SystemSetting): AppSystemSetting => ({
  key: setting.key,
  label: setting.label,
  value: setting.value,
  category: settingCategoryToApp[setting.category]
});

export const mapNotification = (item: Notification): NotificationItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  channel: channelToApp[item.channel],
  createdAt: item.createdAt.toISOString(),
  read: item.read
});
