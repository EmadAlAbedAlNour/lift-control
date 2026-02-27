import { SettingsEditor } from "@/components/settings/settings-editor";
import { requireAuthenticatedUser } from "@/lib/auth-guards";
import { listSettings } from "@/lib/data-access";

export default async function SettingsPage() {
  const user = await requireAuthenticatedUser();

  const settings = await listSettings();
  const canEdit = user.role === "admin";

  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="container-shell">
        <SettingsEditor initialSettings={settings} canEdit={canEdit} />
      </div>
    </section>
  );
}
