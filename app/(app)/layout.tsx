import { AppShell } from "@/components/layout/app-shell";
import { AppStateProvider } from "@/components/providers/app-state-provider";
import { requireAuthenticatedUser } from "@/lib/auth-guards";
import { countUnreadNotifications } from "@/lib/data-access";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthenticatedUser();
  const unread = await countUnreadNotifications(user.id);

  return (
    <AppStateProvider initialUnread={unread}>
      <AppShell userName={user.name} userAvatarUrl={user.avatarUrl} isAuthenticated userRole={user.role}>
        {children}
      </AppShell>
    </AppStateProvider>
  );
}
