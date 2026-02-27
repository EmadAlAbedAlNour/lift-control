import { SectionsManager } from "@/components/products/sections-manager";
import { requireAdminUser } from "@/lib/auth-guards";
import { listProductSectionsWithProducts } from "@/lib/data-access";

export default async function SectionsPage() {
  await requireAdminUser();

  const sections = await listProductSectionsWithProducts();

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-shell">
        <SectionsManager initialSections={sections} />
      </div>
    </section>
  );
}
