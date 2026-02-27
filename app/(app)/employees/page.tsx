import { EmployeesManager } from "@/components/employees/employees-manager";
import { requireAdminUser } from "@/lib/auth-guards";
import { listUsers } from "@/lib/data-access";

export default async function EmployeesPage() {
  const user = await requireAdminUser();

  const employees = await listUsers();

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-shell">
        <EmployeesManager employees={employees} currentUserId={user.id} />
      </div>
    </section>
  );
}
