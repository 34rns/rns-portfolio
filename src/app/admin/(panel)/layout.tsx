import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logoutAction } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="mx-auto grid min-h-screen max-w-[1240px] gap-8 px-5 py-8 md:grid-cols-[210px_1fr] md:gap-12 md:px-8">
      <aside className="flex flex-col justify-between gap-8 md:sticky md:top-8 md:h-[calc(100vh-4rem)]">
        <div>
          <Link href="/admin" className="display text-2xl font-semibold">
            RNS
          </Link>
          <p className="mono mt-1 text-[#6B6B64]">Admin</p>

          <nav aria-label="Admin" className="mt-8 flex flex-col gap-1 text-sm">
            <Link
              href="/admin"
              className="px-2 py-1.5 hover:bg-[#E7E7E0]"
            >
              Overview
            </Link>
            <Link
              href="/admin/projects"
              className="px-2 py-1.5 hover:bg-[#E7E7E0]"
            >
              Projects
            </Link>
            <Link
              href="/admin/projects/new"
              className="px-2 py-1.5 hover:bg-[#E7E7E0]"
            >
              New project
            </Link>
            <Link
              href="/admin/orders"
              className="px-2 py-1.5 hover:bg-[#E7E7E0]"
            >
              Orders
            </Link>
            <Link
              href="/admin/licenses"
              className="px-2 py-1.5 hover:bg-[#E7E7E0]"
            >
              Licenses
            </Link>
            <Link
              href="/admin/models"
              className="px-2 py-1.5 hover:bg-[#E7E7E0]"
            >
              3D models
            </Link>
            <Link
              href="/admin/checkouts"
              className="px-2 py-1.5 hover:bg-[#E7E7E0]"
            >
              Checkouts
            </Link>
            <Link
              href="/"
              target="_blank"
              className="px-2 py-1.5 hover:bg-[#E7E7E0]"
            >
              View site
            </Link>
          </nav>
        </div>

        <div className="text-sm text-[#6B6B64]">
          <p className="truncate">{user.email}</p>
          <form action={logoutAction} className="mt-2">
            <button type="submit" className="underline hover:text-[#14171A]">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 pb-16">{children}</main>
    </div>
  );
}
