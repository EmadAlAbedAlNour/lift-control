import { CustomerWithInsight, CustomersManager } from "@/components/customers/customers-manager";
import { requireAdminUser } from "@/lib/auth-guards";
import { getAllContent, listCustomers } from "@/lib/data-access";
import { addDaysKey, toDateKey } from "@/lib/utils/date";
import { normalizeNameKey } from "@/lib/utils/text";

export default async function CustomersPage() {
  await requireAdminUser();

  const [customers, projects] = await Promise.all([listCustomers(), getAllContent()]);

  const todayKey = toDateKey(new Date());
  const nextWeekKey = addDaysKey(new Date(), 7);

  const projectInsights = new Map<
    string,
    {
      projects: number;
      activeProjects: number;
      completedProjects: number;
      overdueProjects: number;
      dueSoonProjects: number;
      latestVisit?: string;
    }
  >();

  for (const project of projects) {
    const key = normalizeNameKey(project.clientName);
    const current = projectInsights.get(key);

    if (!current) {
      projectInsights.set(key, {
        projects: 1,
        activeProjects: project.status === "completed" ? 0 : 1,
        completedProjects: project.status === "completed" ? 1 : 0,
        overdueProjects: project.status !== "completed" && project.nextVisit < todayKey ? 1 : 0,
        dueSoonProjects:
          project.status !== "completed" && project.nextVisit >= todayKey && project.nextVisit <= nextWeekKey ? 1 : 0,
        latestVisit: project.nextVisit
      });
      continue;
    }

    current.projects += 1;
    current.activeProjects += project.status === "completed" ? 0 : 1;
    current.completedProjects += project.status === "completed" ? 1 : 0;
    current.overdueProjects += project.status !== "completed" && project.nextVisit < todayKey ? 1 : 0;
    current.dueSoonProjects +=
      project.status !== "completed" && project.nextVisit >= todayKey && project.nextVisit <= nextWeekKey ? 1 : 0;
    current.latestVisit =
      current.latestVisit && current.latestVisit > project.nextVisit ? current.latestVisit : project.nextVisit;
  }

  const customerData: CustomerWithInsight[] = customers.map((customer) => {
    const insight = projectInsights.get(normalizeNameKey(customer.name));

    return {
      ...customer,
      projects: insight?.projects ?? 0,
      activeProjects: insight?.activeProjects ?? 0,
      completedProjects: insight?.completedProjects ?? 0,
      overdueProjects: insight?.overdueProjects ?? 0,
      dueSoonProjects: insight?.dueSoonProjects ?? 0,
      latestVisit: insight?.latestVisit
    };
  });

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-shell">
        <CustomersManager initialCustomers={customerData} />
      </div>
    </section>
  );
}
