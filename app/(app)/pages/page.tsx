import { PublicPagesEditor } from "@/components/pages/public-pages-editor";
import { requireAdminUser } from "@/lib/auth-guards";
import { listSettings } from "@/lib/data-access";

export default async function PagesPage() {
  await requireAdminUser();

  const settings = await listSettings();

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-shell">
        <PublicPagesEditor initialSettings={settings} canEdit />
      </div>
    </section>
  );
}
