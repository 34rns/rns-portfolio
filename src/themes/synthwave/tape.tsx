import Link from "next/link";
import { SmartImage } from "@/components/smart-image";
import type { ProjectLink } from "@/lib/projects/view";

export function TapeCard({
  src,
  index,
  title,
  year,
}: {
  src: string;
  index: number;
  title: string;
  year: number;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <figure className="synth-tape">
      <div className="synth-tape-body">
        <div className="synth-tape-top">
          <span className="synth-tape-reels" aria-hidden="true">
            <span className="synth-tape-reel" />
            <span className="synth-tape-reel" />
          </span>
          <span className="synth-tape-no">Tape {number} / T-120</span>
        </div>

        <div className="synth-tape-window">
          <SmartImage
            src={src}
            alt={`${title} — capture ${number}`}
            fill
            sizes="(min-width: 800px) 44vw, 100vw"
            className="synth-tape-img"
          />
          <span className="synth-tape-scan" aria-hidden="true" />
          <span className="synth-tape-play" aria-hidden="true">
            Play
          </span>
        </div>

        <div className="synth-tape-label">
          <span className="synth-tape-name">{title}</span>
          <span className="synth-tape-meta">
            Capture {number} / {year} / SP
          </span>
        </div>
      </div>
      <figcaption className="synth-tape-caption">
        Capture {number} / {title}
      </figcaption>
    </figure>
  );
}

export function CartridgeCard({
  project,
  index,
}: {
  project: ProjectLink;
  index: number;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="synth-cart"
      data-cursor="view"
    >
      <span className="synth-cart-no">
        Cart {String(index + 1).padStart(2, "0")}
      </span>
      <span className="synth-cart-name">{project.title}</span>
      <span className="synth-cart-year">{project.year} / Case file</span>
    </Link>
  );
}
