import { redirect } from "next/navigation";
import { auth } from "./index";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session.user;
}
