import { SystemSetting } from "@/lib/types";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { ensureImageUrl } from "@/lib/utils/image";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";
import { toTelHref } from "@/lib/utils/text";

export interface LandingContent {
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    stats: Array<{ label: string; value: string }>;
    cardImage: string;
    cardTitle: string;
    cardDescription: string;
    cardPhone: string;
    cardEmail: string;
    cardCity: string;
  };
  services: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ title: string; description: string; points: string[] }>;
  };
  featured: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{ title: string; detail: string }>;
    whyTitle: string;
    whyDescription: string;
    strengths: string[];
    readinessLabel: string;
    readinessValue: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    phoneLabel: string;
    phoneHref: string;
    emailLabel: string;
    emailHref: string;
    loginLabel: string;
    loginHref: string;
  };
}

function readLines(settings: Map<string, string>, key: string, fallback: string[]): string[] {
  const raw = readSetting(settings, key, fallback.join("\n"));
  const lines = raw
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return lines.length > 0 ? lines : fallback;
}

export function buildLandingContent(settingsList: SystemSetting[]): LandingContent {
  const settings = toSettingsMap(settingsList);
  const supportPhone = readSetting(settings, "profile.supportPhone", "+966 55 221 4490");
  const supportEmail = readSetting(settings, "profile.supportEmail", "support@liftcontrol.sa");
  const city = readSetting(settings, "profile.city", "الرياض - المملكة العربية السعودية");
  const normalizedPhoneHref = toTelHref(supportPhone);
  const primaryCtaHrefRaw = readSetting(settings, "landing.hero.primaryCtaHref", "/contact");
  const primaryCtaHref = primaryCtaHrefRaw === "#contact" ? "/contact" : primaryCtaHrefRaw;

  return {
    hero: {
      eyebrow: readSetting(settings, "landing.hero.eyebrow", "شركة مصاعد متخصصة"),
      titleLine1: readSetting(settings, "landing.hero.titleLine1", "تركيب وصيانة المصاعد"),
      titleLine2: readSetting(settings, "landing.hero.titleLine2", "بمعايير أمان عالية"),
      description: readSetting(
        settings,
        "landing.hero.description",
        "نقدم حلولا متكاملة للمشاريع السكنية والتجارية والطبية: من المعاينة والتصميم، إلى التنفيذ، ثم الصيانة الدورية والدعم الفني."
      ),
      primaryCtaLabel: readSetting(settings, "landing.hero.primaryCtaLabel", "اطلب عرض سعر"),
      primaryCtaHref,
      secondaryCtaLabel: readSetting(settings, "landing.hero.secondaryCtaLabel", "استعرض مشاريعنا"),
      secondaryCtaHref: readSetting(settings, "landing.hero.secondaryCtaHref", "/projects"),
      stats: [
        {
          label: readSetting(settings, "landing.hero.stat1Label", "مشاريع منجزة"),
          value: readSetting(settings, "landing.hero.stat1Value", "+180")
        },
        {
          label: readSetting(settings, "landing.hero.stat2Label", "عقود صيانة فعالة"),
          value: readSetting(settings, "landing.hero.stat2Value", "74 عقد")
        },
        {
          label: readSetting(settings, "landing.hero.stat3Label", "متوسط الاستجابة"),
          value: readSetting(settings, "landing.hero.stat3Value", "2.5 ساعة")
        }
      ],
      cardImage: ensureImageUrl(
        readSetting(settings, "landing.hero.cardImage", DEFAULT_IMAGE_URLS.heroCard),
        DEFAULT_IMAGE_URLS.heroCard
      ),
      cardTitle: readSetting(settings, "landing.hero.cardTitle", "ابدأ بخطوة بسيطة"),
      cardDescription: readSetting(
        settings,
        "landing.hero.cardDescription",
        "تواصل معنا وحدد نوع المبنى، وسنرتب معاينة فنية مع عرض واضح للتنفيذ أو الصيانة."
      ),
      cardPhone: supportPhone,
      cardEmail: supportEmail,
      cardCity: city
    },
    services: {
      eyebrow: readSetting(settings, "landing.services.eyebrow", "خدماتنا"),
      title: readSetting(settings, "landing.services.title", "حلول مصاعد تناسب نوع مشروعك"),
      description: readSetting(
        settings,
        "landing.services.description",
        "ننفذ دورة العمل كاملة من الدراسة والتوريد والتركيب إلى التشغيل والصيانة طويلة المدى."
      ),
      cards: [
        {
          title: readSetting(settings, "landing.services.card1.title", "تركيب المصاعد للمباني الجديدة"),
          description: readSetting(
            settings,
            "landing.services.card1.description",
            "ننفذ المصعد من أول دراسة حتى التسليم النهائي مع مطابقة اشتراطات السلامة والاعتماد."
          ),
          points: readLines(settings, "landing.services.card1.points", [
            "زيارة ومعاينة الموقع",
            "تصميم مناسب للمساحة والحمولة",
            "اختبارات تشغيل قبل التسليم"
          ])
        },
        {
          title: readSetting(settings, "landing.services.card2.title", "عقود صيانة وقائية وتشغيلية"),
          description: readSetting(
            settings,
            "landing.services.card2.description",
            "برنامج صيانة دوري يقلل الأعطال المفاجئة ويرفع عمر المكونات الأساسية للمصعد."
          ),
          points: readLines(settings, "landing.services.card2.points", [
            "زيارات دورية مجدولة",
            "بلاغات طوارئ على مدار الساعة",
            "تقارير فنية واضحة"
          ])
        },
        {
          title: readSetting(settings, "landing.services.card3.title", "تحديث المصاعد القديمة"),
          description: readSetting(
            settings,
            "landing.services.card3.description",
            "تطوير لوحات التحكم والمحركات وأنظمة الأمان للمصاعد القديمة دون تغيير كامل البنية."
          ),
          points: readLines(settings, "landing.services.card3.points", [
            "رفع كفاءة التشغيل",
            "تقليل استهلاك الطاقة",
            "تحسين مستوى الأمان"
          ])
        }
      ]
    },
    featured: {
      eyebrow: readSetting(settings, "landing.featured.eyebrow", "مشاريع مختارة"),
      title: readSetting(settings, "landing.featured.title", "نماذج من أعمالنا الحديثة"),
      description: readSetting(
        settings,
        "landing.featured.description",
        "استعرض مشاريعنا المنفذة لمعرفة التفاصيل الفنية، الحالة التشغيلية، وخطة الزيارات القادمة."
      ),
      ctaLabel: readSetting(settings, "landing.featured.ctaLabel", "عرض كل المشاريع")
    },
    about: {
      eyebrow: readSetting(settings, "landing.about.eyebrow", "آلية العمل"),
      title: readSetting(settings, "landing.about.title", "طريقة تنفيذ واضحة من البداية للنهاية"),
      description: readSetting(
        settings,
        "landing.about.description",
        "نعتمد خطوات تشغيل ثابتة تضمن الجودة، السلامة، والالتزام بالوقت."
      ),
      steps: [
        {
          title: readSetting(settings, "landing.about.step1.title", "1) المعاينة الفنية"),
          detail: readSetting(
            settings,
            "landing.about.step1.detail",
            "فحص الموقع، تحديد المتطلبات، ورفع تقرير فني أولي خلال وقت قصير."
          )
        },
        {
          title: readSetting(settings, "landing.about.step2.title", "2) العرض الفني والمالي"),
          detail: readSetting(
            settings,
            "landing.about.step2.detail",
            "إرسال عرض واضح يشمل المواصفات، الجدول الزمني، وتكلفة التنفيذ."
          )
        },
        {
          title: readSetting(settings, "landing.about.step3.title", "3) التنفيذ والمتابعة"),
          detail: readSetting(
            settings,
            "landing.about.step3.detail",
            "تركيب أو صيانة مع متابعة مستمرة وتقارير حتى اكتمال العمل."
          )
        }
      ],
      whyTitle: readSetting(settings, "landing.about.whyTitle", "لماذا Lift Control؟"),
      whyDescription: readSetting(
        settings,
        "landing.about.whyDescription",
        "نركز على الاعتمادية والأمان وسرعة الاستجابة، مع فريق متخصص في مصاعد المشاريع والفلل والمرافق الطبية."
      ),
      strengths: readLines(settings, "landing.about.strengths", [
        "فريق هندسي وفني معتمد",
        "التزام بمواعيد الزيارات والصيانة",
        "تغطية مشاريع سكنية وتجارية وطبية",
        "قنوات تواصل سريعة طوال أيام الأسبوع"
      ]),
      readinessLabel: readSetting(settings, "landing.about.readinessLabel", "جاهزية الفرق الميدانية"),
      readinessValue: readSetting(settings, "landing.about.readinessValue", "24/7")
    },
    contact: {
      eyebrow: readSetting(settings, "landing.contact.eyebrow", "تواصل معنا"),
      title: readSetting(settings, "landing.contact.title", "نسعد بخدمتك في أي وقت"),
      description: readSetting(
        settings,
        "landing.contact.description",
        "إذا لديك مشروع جديد أو مصعد يحتاج صيانة، أرسل لنا التفاصيل وسنعود لك بعرض مناسب."
      ),
      phoneLabel: readSetting(settings, "landing.contact.phoneLabel", "اتصل الآن"),
      phoneHref: normalizedPhoneHref,
      emailLabel: readSetting(settings, "landing.contact.emailLabel", "إرسال بريد"),
      emailHref: `mailto:${supportEmail}`,
      loginLabel: readSetting(settings, "landing.contact.loginLabel", "دخول العملاء الحاليين"),
      loginHref: readSetting(settings, "landing.contact.loginHref", "/auth/login")
    }
  };
}
