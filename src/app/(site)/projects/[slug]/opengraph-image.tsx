import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/db/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  const title = (project?.title ?? "Project").slice(0, 80);
  const tagline = (project?.tagline ?? "").slice(0, 120);
  const accent = project?.themeOptions?.accent ?? "#1B3BFF";
  const year = project?.year ?? "";
  const fontSize = title.length > 22 ? 62 : 84;

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
          padding: "60px 68px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#5C615E",
          }}
        >
          <span>RNS</span>
          <span>{year}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span
            style={{
              fontSize,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: 30, color: "#5C615E" }}>{tagline}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 56, height: 6, background: accent }} />
          <span style={{ fontSize: 22, color: "#5C615E" }}>Case study</span>
        </div>
      </div>
    ),
    size,
  );
}
