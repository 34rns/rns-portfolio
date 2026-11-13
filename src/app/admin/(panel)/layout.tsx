import { requireAdmin } from "@/lib/auth/require-admin";
import { logoutAction } from "../actions";
import { AdminShell } from "../admin-shell";
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell email={user.email} logout={<form action={logoutAction}><button type="submit">Sign out ↗</button></form>}>{children}</AdminShell>;
}
