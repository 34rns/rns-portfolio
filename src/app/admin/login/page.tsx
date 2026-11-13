import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <main className="admin-login">
      <section className="admin-login-art"><Link href="/" className="admin-brand"><span />RNS<small>STUDIO</small></Link><div><h2>The workspace<br />behind <span>the work.</span></h2><p>Projects, ideas and the little details that make this studio yours.</p></div><small>RNS / DESIGN + ENGINEERING</small></section>
      <section className="admin-login-form"><div><span className="admin-eyebrow">WELCOME BACK</span><h1 className="mt-3">Sign in to your studio.</h1><p>Your projects and portfolio, in one place.</p><LoginForm /><Link href="/" className="admin-login-back">← Back to portfolio</Link></div></section>
    </main>
  );
}
