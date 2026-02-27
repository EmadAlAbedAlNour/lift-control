import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusPill } from "@/components/ui/status-pill";
import { DEFAULT_IMAGE_URLS } from "@/lib/constants/images";
import { PROJECT_TYPE_LABELS_LONG_AR } from "@/lib/constants/projects";
import { getContentById } from "@/lib/data-access";
import { ensureImageUrl } from "@/lib/utils/image";

interface DetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CatalogDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const project = await getContentById(id);

  if (!project) {
    notFound();
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container-shell space-y-8">
        <Link
          href="/catalog"
          className="btn-secondary px-4 py-2 font-medium"
        >
          العودة إلى صفحة القائمة
        </Link>

        <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
          <ImageWithFallback
            src={ensureImageUrl(project.coverImage, DEFAULT_IMAGE_URLS.project)}
            alt={`مشهد من مشروع ${project.title}`}
            width={1400}
            height={900}
            className="h-80 w-full object-cover"
            priority
            kind="project"
            placeholderClassName="bg-surface-soft"
          />
          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-ink">{project.title}</h1>
              <StatusPill status={project.status} />
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-subtext">{project.summary}</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="mb-2 text-sm text-subtext">النوع</p>
                <p className="text-base font-semibold text-ink">{PROJECT_TYPE_LABELS_LONG_AR[project.type]}</p>
              </article>
              <article className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="mb-2 text-sm text-subtext">الحمولة</p>
                <p className="text-base font-semibold text-ink">{project.specs.loadKg} كجم</p>
              </article>
              <article className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="mb-2 text-sm text-subtext">السرعة</p>
                <p className="text-base font-semibold text-ink">{project.specs.speedMps} متر/ثانية</p>
              </article>
              <article className="rounded-lg border border-border bg-surface-soft p-4">
                <p className="mb-2 text-sm text-subtext">الضمان</p>
                <p className="text-base font-semibold text-ink">{project.specs.warrantyMonths} شهر</p>
              </article>
            </div>

            <div className="grid gap-4 text-base text-subtext sm:grid-cols-2">
              <p>
                <span className="font-semibold text-ink">العميل:</span> {project.clientName}
              </p>
              <p>
                <span className="font-semibold text-ink">الموقع:</span> {project.location}
              </p>
              <p>
                <span className="font-semibold text-ink">الطوابق:</span> {project.floors}
              </p>
              <p>
                <span className="font-semibold text-ink">الزيارة القادمة:</span> {project.nextVisit}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

