import { ImageResponse } from "next/og";

export const alt = "RNS — Full-stack engineer and interface designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#E9EAE4",
          color: "#14171A",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#5C615E" }}>
          <span>RNS</span>
          <span>2026</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 210, fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 0.86 }}>
            RNS
          </span>
          <span style={{ marginTop: 28, fontSize: 38, color: "#14171A" }}>
            Full-stack engineer and interface designer
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 64, height: 6, background: "#1B3BFF" }} />
          <span style={{ fontSize: 24, color: "#5C615E" }}>Portfolio</span>
        </div>
      </div>
    ),
    size,
  );
}
