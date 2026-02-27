import { ProjectManagement } from "@/components/catalog/project-management";
import { requireAuthenticatedUser } from "@/lib/auth-guards";
import { getAllContent } from "@/lib/data-access";

export default async function CatalogPage() {
  const user = await requireAuthenticatedUser();

  const projects = await getAllContent();
  const canEdit = user.role === "admin" || user.role === "supervisor";
  const canDelete = user.role === "admin";

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-shell">
        <ProjectManagement initialProjects={projects} canEdit={canEdit} canDelete={canDelete} />
      </div>
    </section>
  );
}
