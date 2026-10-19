import { Cursor } from "@/components/cursor";
import { SiteIntro } from "@/components/site-intro";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteIntro />
      <Cursor />
      {children}
    </>
  );
}
