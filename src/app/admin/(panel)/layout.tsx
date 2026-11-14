import { requirePrincipal } from "@/lib/auth/principal";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLicenseStore } from "@/lib/licensing/transaction-store";
import { logoutAction } from "../actions";
import { AdminShell } from "../admin-shell";
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session=await auth();if(!session?.user)redirect("/admin/login");
  const principal=await requirePrincipal();
  const [row]=await getLicenseStore().read(tx=>tx.query<{preferences:{theme?:"light"|"dark"|"system"}}>("SELECT preferences FROM admin_preferences WHERE member_id=$1",[principal.id]));
  return <AdminShell email={session.user.email} principal={principal} initialTheme={row?.preferences.theme??"system"} logout={<form action={logoutAction}><button type="submit">Sign out ↗</button></form>}>{children}</AdminShell>;
}
