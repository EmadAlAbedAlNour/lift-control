import { PublicProjectsCatalog } from "@/components/public/projects-catalog";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllContent, listSettings } from "@/lib/data-access";
import { readSetting, toSettingsMap } from "@/lib/utils/settings";

export default async function PublicProjectsPage() {
  const [projects, settingsList] = await Promise.all([getAllContent(), listSettings()]);
  const settings = toSettingsMap(settingsList);
  const eyebrow = readSetting(settings, "pages.projects.eyebrow", "معرض المشاريع");
  const title = readSetting(settings, "pages.projects.title", "استعرض مشاريع التركيب والصيانة");
  const description = readSetting(
    settings,
    "pages.projects.description",
    "هذه نماذج من أعمالنا في المباني السكنية والتجارية والطبية. كل مشروع يحتوي على المواصفات الفنية والحالة التشغيلية."
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell space-y-8">
        <header className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </header>

        <PublicProjectsCatalog projects={projects} />
      </div>
    </section>
  );
}
