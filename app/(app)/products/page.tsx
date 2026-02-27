import { ProductsManager } from "@/components/products/products-manager";
import { requireAdminUser } from "@/lib/auth-guards";
import { listProductSectionsWithProducts } from "@/lib/data-access";

export default async function ProductsPage() {
  await requireAdminUser();

  const sections = await listProductSectionsWithProducts();

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-shell">
        <ProductsManager initialSections={sections} />
      </div>
    </section>
  );
}
