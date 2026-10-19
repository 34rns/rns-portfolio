import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import {
  Archivo,
  DM_Mono,
  IBM_Plex_Mono,
  Newsreader,
  Press_Start_2P,
  VT323,
} from "next/font/google";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/**
 * Synthwave faces. They are declared here so the theme can stay out of the
 * root layout's module graph without dragging a font loader into the registry
 * tests. `preload: false` means the files are only fetched on pages whose CSS
 * actually uses the family, so the rest of the site pays nothing.
 */
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

/**
 * Set the font custom properties inline instead of through next/font's
 * generated `variable` classes. Those classes carry a per-compilation hash;
 * after a hot update the server and client can disagree on it, which React
 * reports as an <html> hydration mismatch. The family strings are stable.
 */
const fontVars = {
  "--font-archivo": archivo.style.fontFamily,
  "--font-newsreader": newsreader.style.fontFamily,
  "--font-dm-mono": dmMono.style.fontFamily,
  "--font-vt323": vt323.style.fontFamily,
  "--font-press-start": pressStart.style.fontFamily,
  "--font-plex-mono": plexMono.style.fontFamily,
} as CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#E9EAE4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={fontVars}>
      <body>{children}</body>
    </html>
  );
}
