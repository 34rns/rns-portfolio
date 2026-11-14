import type { Metadata } from "next";
import { adminStyles } from "./admin-styles";
import { licensingStyles } from "./licensing-styles";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-app">
      <style>{adminStyles}</style>
      <style>{licensingStyles}</style>
      {children}
    </div>
  );
}
