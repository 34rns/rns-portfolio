import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brandPalette } from "@/brand/tokens";

export const alt = "RNS — Full-stack engineer and interface designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand/rns-mark.png"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: brandPalette.charcoal,
          color: brandPalette.white,
          padding: "58px 68px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24 }}>
          <span>Engineering &amp; interface design</span>
          <span style={{ color: brandPalette.yellow }}>34rns</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#000000", borderRadius: 24, padding: 24 }}>
          {/* ImageResponse renders image pixels rather than an HTML page. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="" width={720} height={286} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 25 }}>
          <span>Web products, tools &amp; interactive experiences</span>
          <span style={{ color: brandPalette.yellow }}>Selected work</span>
        </div>
      </div>
    ),
    size,
  );
}
