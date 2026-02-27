import Link from "next/link";
import { notFound } from "next/navigation";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { StatusPill } from "@/components/ui/status-pill";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { PROJECT_TYPE_LABELS_LONG_AR } from "@/lib/constants/projects";
import { getAllContent, getContentById } from "@/lib/data-access";
import { ensureImageUrl } from "@/lib/utils/image";

interface PublicProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PublicProjectDetailPage({ params }: PublicProjectDetailPageProps) {
  const { id } = await params;
  const project = await getContentById(id);

  if (!project) {
    notFound();
  }

  const relatedProjects = (await getAllContent())
    .filter((item) => item.id !== project.id && item.type === project.type)
    .slice(0, 3);

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell space-y-8">
        <Link
          href="/projects"
          className="btn-secondary px-4 py-2"
        >
          العودة إلى كل المشاريع
        </Link>

        <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <ImageWithFallback
            src={ensureImageUrl(project.coverImage, DEFAULT_IMAGE_URLS.project)}
            alt={`صورة مشروع ${project.title}`}
            width={1400}
            height={900}
            className="h-80 w-full object-cover"
            priority
            kind="project"
            placeholderClassName="bg-surface-soft"
          />

          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{project.title}</h1>
              <StatusPill status={project.status} />
            </div>

            <p className="max-w-2xl text-base leading-relaxed text-subtext">{project.summary}</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="mb-2 text-sm text-subtext">نوع المصعد</p>
                <p className="text-base font-semibold text-ink">{PROJECT_TYPE_LABELS_LONG_AR[project.type]}</p>
              </article>
              <article className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="mb-2 text-sm text-subtext">الحمولة</p>
                <p className="text-base font-semibold text-ink">{project.specs.loadKg} كجم</p>
              </article>
              <article className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="mb-2 text-sm text-subtext">السرعة</p>
                <p className="text-base font-semibold text-ink">{project.specs.speedMps} م/ث</p>
              </article>
              <article className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="mb-2 text-sm text-subtext">مدة الضمان</p>
                <p className="text-base font-semibold text-ink">{project.specs.warrantyMonths} شهر</p>
              </article>
            </div>

            <div className="grid gap-4 text-base text-subtext sm:grid-cols-2 lg:grid-cols-4">
              <p>
                <span className="font-semibold text-ink">العميل:</span> {project.clientName}
              </p>
              <p>
                <span className="font-semibold text-ink">الموقع:</span> {project.location}
              </p>
              <p>
                <span className="font-semibold text-ink">عدد الطوابق:</span> {project.floors}
              </p>
              <p>
                <span className="font-semibold text-ink">الزيارة القادمة:</span> {project.nextVisit}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">طلب عرض سعر لهذا النوع</h2>
          <p className="mb-6 max-w-2xl text-base leading-relaxed text-subtext">
            فريقنا يجهز لك عرضا فنيا وماليا خلال 24 ساعة بعد المعاينة. يمكنك التواصل مباشرة عبر الهاتف أو
            البريد.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="tel:+966552214490" className="btn-primary px-6">
              اتصل الآن
            </a>
            <a href="mailto:support@liftcontrol.sa" className="btn-secondary bg-page px-6">
              إرسال بريد
            </a>
          </div>
        </article>

        {relatedProjects.length > 0 ? (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-ink">مشاريع مشابهة</h2>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {relatedProjects.map((item) => (
                <article key={item.id} className="rounded-xl border border-border bg-surface p-6 shadow-card sm:p-8">
                  <h3 className="mb-3 text-lg font-bold tracking-tight text-ink">{item.title}</h3>
                  <p className="mb-4 text-sm text-subtext">{item.location}</p>
                  <Link
                    href={`/projects/${item.id}`}
                    className="btn-secondary bg-page px-4 py-2"
                  >
                    فتح المشروع
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
