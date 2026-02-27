import bcrypt from "bcryptjs";
import {
  NotificationChannel,
  PrismaClient,
  ProjectStatus,
  ProjectType,
  SettingCategory,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

async function seedUsers() {
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const supervisorPassword = await bcrypt.hash("Supervisor@1234", 12);
  const userPassword = await bcrypt.hash("User@1234", 12);

  await prisma.user.createMany({
    data: [
      {
        id: "user-001",
        name: "Emad Khaled",
        email: "emad@liftcontrol.sa",
        passwordHash: adminPassword,
        phone: "+966552214490",
        role: UserRole.ADMIN,
        avatarUrl:
          "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=400&q=80",
        createdAt: new Date("2025-08-05T09:00:00Z")
      },
      {
        id: "user-002",
        name: "Sara Nasser",
        email: "sara@liftcontrol.sa",
        passwordHash: supervisorPassword,
        phone: "+966501122334",
        role: UserRole.SUPERVISOR,
        avatarUrl:
          "https://images.unsplash.com/photo-1551836022-8b2858c9c69b?auto=format&fit=crop&w=400&q=80",
        createdAt: new Date("2025-10-14T12:00:00Z")
      },
      {
        id: "user-003",
        name: "Omar Fahad",
        email: "omar.client@example.com",
        passwordHash: userPassword,
        phone: "+966530987654",
        role: UserRole.USER,
        avatarUrl:
          "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80",
        createdAt: new Date("2026-01-07T10:00:00Z")
      }
    ]
  });
}

async function seedProjects() {
  await prisma.liftProject.createMany({
    data: [
      {
        id: "lift-001",
        title: "برج الوادي السكني",
        location: "الرياض - حي الياسمين",
        clientName: "شركة الواحة للتطوير",
        type: ProjectType.PASSENGER,
        floors: 12,
        status: ProjectStatus.IN_PROGRESS,
        nextVisit: new Date("2026-03-02T08:00:00Z"),
        summary: "مشروع تركيب مصعدين بسرعات مختلفة مع نظام استدعاء ذكي وتقارير صيانة شهرية.",
        speedMps: 1.75,
        loadKg: 1000,
        warrantyMonths: 24,
        coverImage:
          "https://images.unsplash.com/photo-1677358075329-96f93f5c6a2f?auto=format&fit=crop&w=1280&q=80",
        createdAt: new Date("2026-01-10T09:00:00Z")
      },
      {
        id: "lift-002",
        title: "مستشفى الرحمة",
        location: "جدة - حي السلامة",
        clientName: "مجموعة الرحمة الطبية",
        type: ProjectType.HOSPITAL,
        floors: 8,
        status: ProjectStatus.PLANNED,
        nextVisit: new Date("2026-03-05T08:00:00Z"),
        summary: "تصميم وتنفيذ مصعد طبي بحمولة عالية مع باب أوتوماتيكي واسع وخطة طوارئ.",
        speedMps: 1,
        loadKg: 1600,
        warrantyMonths: 36,
        coverImage:
          "https://images.unsplash.com/photo-1707245479405-5bd89389e89f?auto=format&fit=crop&w=1280&q=80",
        createdAt: new Date("2026-01-21T09:00:00Z")
      },
      {
        id: "lift-003",
        title: "مول المدينة",
        location: "الدمام - طريق الملك فهد",
        clientName: "شركة المدار التجارية",
        type: ProjectType.PANORAMIC,
        floors: 5,
        status: ProjectStatus.COMPLETED,
        nextVisit: new Date("2026-04-12T08:00:00Z"),
        summary: "تركيب مصعد بانورامي بواجهة زجاجية مقاومة للكسر مع صيانة دورية كل 45 يوما.",
        speedMps: 1.25,
        loadKg: 1350,
        warrantyMonths: 18,
        coverImage:
          "https://images.unsplash.com/photo-1529429612778-1d48d34d95b0?auto=format&fit=crop&w=1280&q=80",
        createdAt: new Date("2025-11-30T11:00:00Z")
      },
      {
        id: "lift-004",
        title: "مصنع الشرق اللوجستي",
        location: "الخبر - المدينة الصناعية",
        clientName: "الشرق للخدمات اللوجستية",
        type: ProjectType.CARGO,
        floors: 4,
        status: ProjectStatus.NEW,
        nextVisit: new Date("2026-02-28T08:00:00Z"),
        summary: "دراسة موقع وتركيب مصعد بضائع ثقيل مع نظام تحكم ضد التحميل الزائد.",
        speedMps: 0.8,
        loadKg: 2500,
        warrantyMonths: 24,
        coverImage:
          "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1280&q=80",
        createdAt: new Date("2026-02-18T13:00:00Z")
      }
    ]
  });
}

async function seedCustomers() {
  await prisma.customer.createMany({
    data: [
      {
        id: "customer-001",
        name: "شركة الواحة للتطوير",
        phone: "+966552200001",
        email: "sales@oasis-dev.sa",
        location: "الرياض",
        notes: "عميل استراتيجي للمشاريع السكنية.",
        isActive: true
      },
      {
        id: "customer-002",
        name: "مجموعة الرحمة الطبية",
        phone: "+966552200002",
        email: "projects@rahma-med.sa",
        location: "جدة",
        notes: "مشاريع طبية تتطلب سرعة استجابة عالية.",
        isActive: true
      },
      {
        id: "customer-003",
        name: "شركة المدار التجارية",
        phone: "+966552200003",
        email: "ops@almadar.sa",
        location: "الدمام",
        notes: "متابعة شهرية لعقود الصيانة.",
        isActive: true
      },
      {
        id: "customer-004",
        name: "الشرق للخدمات اللوجستية",
        phone: "+966552200004",
        email: "support@east-logistics.sa",
        location: "الخبر",
        notes: "عميل جديد يحتاج خطة تنفيذ أولية.",
        isActive: true
      }
    ]
  });
}

async function seedSettings() {
  await prisma.systemSetting.createMany({
    data: [
      {
        key: "profile.companyName",
        label: "اسم الشركة",
        value: "Lift Control",
        category: SettingCategory.PROFILE
      },
      {
        key: "profile.supportEmail",
        label: "بريد الدعم",
        value: "support@liftcontrol.sa",
        category: SettingCategory.PROFILE
      },
      {
        key: "notifications.emailDailyDigest",
        label: "ملخص يومي عبر البريد",
        value: "enabled",
        category: SettingCategory.NOTIFICATIONS
      },
      {
        key: "security.twoFactor",
        label: "التحقق بخطوتين",
        value: "optional",
        category: SettingCategory.SECURITY
      },
      {
        key: "billing.installmentPolicy",
        label: "سياسة الدفع",
        value: "50% قبل التركيب - 50% بعد التسليم",
        category: SettingCategory.BILLING
      }
    ]
  });
}

async function seedNotifications() {
  await prisma.notification.createMany({
    data: [
      {
        id: "note-001",
        title: "موعد صيانة قادم",
        description: "برج الوادي يحتاج زيارة فنية يوم 2 مارس.",
        channel: NotificationChannel.IN_APP,
        createdAt: new Date("2026-02-24T09:30:00Z"),
        read: false,
        userId: "user-001"
      },
      {
        id: "note-002",
        title: "تحديث طلب جديد",
        description: "تمت إضافة مشروع مصنع الشرق اللوجستي إلى قائمة الانتظار.",
        channel: NotificationChannel.EMAIL,
        createdAt: new Date("2026-02-23T11:05:00Z"),
        read: true,
        userId: "user-001"
      }
    ]
  });
}

async function seedProductCatalog() {
  const sections = await Promise.all(
    [
      { id: "section-001", name: "الإكسسوارات", description: "ملحقات وقطع تكميلية للمصاعد.", sortOrder: 10 },
      { id: "section-002", name: "الأبواب", description: "أبواب المصاعد بمقاسات مختلفة.", sortOrder: 20 },
      { id: "section-003", name: "ماكينات Gearless", description: "ماكينات بدون جيربوكس.", sortOrder: 30 },
      { id: "section-004", name: "السكك (Rails)", description: "سكك التوجيه وملحقاتها.", sortOrder: 40 },
      { id: "section-005", name: "الكبائن", description: "كبائن وتشطيبات داخلية.", sortOrder: 50 },
      { id: "section-006", name: "لوحات التحكم", description: "لوحات التحكم الرئيسية.", sortOrder: 60 },
      { id: "section-007", name: "ماكينات مع جيربوكس", description: "محركات مع جيربوكس.", sortOrder: 70 },
      { id: "section-008", name: "لوحات المصعد الداخلية", description: "لوحات التشغيل داخل الكابينة.", sortOrder: 80 }
    ].map((item) =>
      prisma.productSection.create({
        data: item
      })
    )
  );

  const sectionByName = new Map(sections.map((item) => [item.name, item.id]));

  await prisma.product.createMany({
    data: [
      {
        id: "product-001",
        sectionId: sectionByName.get("الأبواب"),
        name: "باب أوتوماتيكي مركزي 90 سم",
        sku: "DR-CN-90",
        brand: "LiftTech",
        summary: "باب أوتوماتيكي مركزي بآلية إغلاق ناعمة مناسب للمباني السكنية.",
        imageUrl:
          "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1280&q=80",
        isActive: true,
        sortOrder: 10
      },
      {
        id: "product-002",
        sectionId: sectionByName.get("ماكينات Gearless"),
        name: "ماكينة Gearless حمولة 1000 كجم",
        sku: "GL-1000",
        brand: "Monta",
        summary: "ماكينة بدون جيربوكس بكفاءة عالية وضوضاء منخفضة للمشاريع الحديثة.",
        imageUrl:
          "https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=1280&q=80",
        isActive: true,
        sortOrder: 10
      },
      {
        id: "product-003",
        sectionId: sectionByName.get("لوحات التحكم"),
        name: "لوحة تحكم VVVF - 8 طوابق",
        sku: "CP-VVVF-8",
        brand: "Arkel",
        summary: "لوحة تحكم تدعم نظام VVVF مع تشخيص أعطال سريع.",
        imageUrl:
          "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1280&q=80",
        isActive: true,
        sortOrder: 10
      }
    ]
  });
}

async function main() {
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productSection.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.liftProject.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  await seedUsers();
  await seedProjects();
  await seedCustomers();
  await seedSettings();
  await seedNotifications();
  await seedProductCatalog();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
