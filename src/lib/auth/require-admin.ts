import { redirect } from "next/navigation";
import { auth } from "./index";
import { requireCapability } from "./principal";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    redirect("/account/purchases");
  }
  await requireCapability("portfolio.write");
  return session.user;
}
