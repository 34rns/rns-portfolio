/**
 * Scoped to `.anime-*` classes and the theme wrapper. Kept as a single string
 * so the CSS only ships with the theme's pages instead of every route.
 */
export const animeCss = `
[data-theme="anime"] {
  --anime-ink: var(--theme-text);
  --anime-paper: var(--theme-bg);
  --anime-sakura: #F2A7BE;
  --anime-cyan: #1C8FA3;
}

.anime-root {
  position: relative;
  overflow-x: clip;
  background: var(--anime-paper);
  color: var(--anime-ink);
}

.anime-frame {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}
@media (min-width: 768px) {
  .anime-frame { padding: 0 40px; }
}

.anime-speedlines {
  position: absolute;
  top: -9rem;
  right: -12rem;
  width: 56rem;
  height: 56rem;
  z-index: 0;
  pointer-events: none;
  background: repeating-conic-gradient(
    from 205deg at 100% 0%,
    transparent 0deg 2.4deg,
    color-mix(in srgb, var(--anime-ink) 26%, transparent) 2.4deg 2.9deg
  );
  -webkit-mask-image: radial-gradient(closest-side, #000 18%, transparent 74%);
  mask-image: radial-gradient(closest-side, #000 18%, transparent 74%);
  opacity: 0.6;
}

.anime-sakura {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.anime-petal {
  position: absolute;
  top: 0;
  width: 9px;
  height: 12px;
  background: var(--anime-sakura);
  border-radius: 80% 0 80% 0;
  opacity: 0.72;
  animation-name: anime-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes anime-fall {
  0% { transform: translate3d(0, -12vh, 0) rotate(0deg); }
  100% { transform: translate3d(-70px, 112vh, 0) rotate(330deg); }
}

.anime-halftone {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(var(--anime-ink) 1px, transparent 1.15px);
  background-size: 7px 7px;
  opacity: 0.1;
}

.anime-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem 0 0.85rem;
  border-bottom: 2px solid var(--anime-ink);
}

.anime-logo {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.18rem;
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: 1.55rem;
  line-height: 0.9;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.anime-logo span {
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  margin-top: 0.15rem;
}

.anime-header-meta,
.anime-kicker,
.anime-mono {
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.anime-header-meta { display: none; }
@media (min-width: 640px) {
  .anime-header-meta { display: block; opacity: 0.66; }
}

.anime-header-link {
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-bottom: 2px solid var(--anime-ink);
  padding-bottom: 0.1rem;
}
.anime-header-link:hover { color: var(--theme-accent); border-color: var(--theme-accent); }

.anime-panel {
  position: relative;
  border: 2px solid var(--anime-ink);
  background: var(--anime-paper);
  box-shadow: 6px 6px 0 var(--anime-ink);
  animation: anime-slam 0.66s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--delay, 0s);
}

.anime-panel--accent { box-shadow: 7px 7px 0 var(--theme-accent); }

@keyframes anime-slam {
  from { opacity: 0; transform: translateY(20px) rotate(-1.1deg); }
  to { opacity: 1; transform: none; }
}

.anime-rise {
  animation: anime-slam 0.72s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.anime-hero { padding: 2.2rem 0 0; }
@media (min-width: 768px) { .anime-hero { padding-top: 3.4rem; } }

.anime-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.anime-title {
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.75rem, 9.4vw, 8.4rem);
  line-height: 0.83;
  letter-spacing: -0.055em;
  text-transform: uppercase;
  text-wrap: balance;
}

.anime-outline {
  color: transparent;
  -webkit-text-stroke: 2px var(--anime-ink);
}
@media (min-width: 768px) {
  .anime-outline { -webkit-text-stroke-width: 2.5px; }
}

.anime-title-rule {
  margin-top: 1rem;
  height: 10px;
  width: min(320px, 52vw);
  background: var(--theme-accent);
  transform: skewX(-22deg);
  transform-origin: left;
}

.anime-tagline {
  margin-top: 1.1rem;
  max-width: 42ch;
  font-size: clamp(1.05rem, 1.5vw, 1.28rem);
  line-height: 1.6;
}

.anime-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 1.3rem;
}

.anime-chip {
  border: 1.5px solid var(--anime-ink);
  padding: 0.18rem 0.48rem;
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.6rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.anime-stamp {
  align-self: flex-start;
  display: grid;
  place-items: center;
  width: 4.8rem;
  height: 4.8rem;
  margin-left: auto;
  border: 2px solid var(--theme-accent);
  border-radius: 999px;
  color: var(--theme-accent);
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: 0.66rem;
  line-height: 1.05;
  letter-spacing: 0.12em;
  text-align: center;
  text-transform: uppercase;
  transform: rotate(-9deg);
}

.anime-hero-grid {
  margin-top: 2.2rem;
  display: grid;
  gap: 1.5rem;
}

/* The WebGL canvas reports a pixel width; let the column shrink around it. */
.anime-hero-grid > * { min-width: 0; }
@media (min-width: 1024px) {
  .anime-hero-grid {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.8fr);
    gap: 2rem;
    align-items: start;
  }
}

.anime-stage-shell {
  position: relative;
  border: 2px solid var(--anime-ink);
  background: var(--theme-surface);
  box-shadow: 10px 10px 0 var(--anime-ink);
}

.anime-stage {
  aspect-ratio: 4 / 3;
  width: 100%;
}
@media (min-width: 768px) {
  .anime-stage { aspect-ratio: 16 / 11; }
}

.anime-stage-shell .anime-halftone { z-index: 2; }

/* Let a vertical swipe scroll the page; OrbitControls keeps horizontal drags. */
.anime-stage-shell canvas { touch-action: pan-y !important; }

.anime-stage-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 2px solid var(--anime-ink);
  padding: 0.5rem 0.75rem;
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  background: var(--anime-paper);
}

.anime-stage-bar span:last-child { color: var(--theme-accent); }

.anime-stage-foot {
  border-top: 2px solid var(--anime-ink);
  padding: 0.5rem 0.75rem;
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  background: var(--anime-paper);
  opacity: 0.72;
}

.anime-side {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.anime-side .anime-panel { padding: 1rem 1.1rem; }

.anime-side h2 {
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: 1rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.anime-filelist {
  margin-top: 0.8rem;
  display: grid;
  gap: 0.45rem;
}
.anime-filelist div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--anime-ink) 26%, transparent);
  padding-bottom: 0.38rem;
  font-size: 0.78rem;
}
.anime-filelist dt {
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.6;
}
.anime-filelist dd { font-weight: 600; text-align: right; }

.anime-linkrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 2px solid var(--anime-ink);
  background: var(--anime-paper);
  padding: 0.85rem 1rem;
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.anime-linkrow:hover,
.anime-linkrow:focus-visible {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--theme-accent);
}

.anime-read {
  display: grid;
  gap: 1.5rem;
  margin-top: 4rem;
  padding-top: 1.6rem;
  border-top: 2px solid var(--anime-ink);
}
@media (min-width: 1024px) {
  .anime-read {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 3.5rem;
  }
}

.anime-read-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.anime-read-meta span:first-child { color: var(--theme-accent); }

.anime-prose {
  max-width: 68ch;
  font-size: 1.1rem;
  line-height: 1.78;
}
.anime-prose > * + * { margin-top: 1.1em; }

.anime-prose h2 {
  border-bottom: 2px solid var(--anime-ink);
  padding-bottom: 0.35rem;
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(1.5rem, 3vw, 2.15rem);
  line-height: 1.02;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  margin-top: 2.4em;
}
.anime-prose h2::before {
  content: "";
  display: inline-block;
  width: 0.5em;
  height: 0.5em;
  margin-right: 0.45rem;
  background: var(--theme-accent);
}
.anime-prose h2:first-child { margin-top: 0; }

.anime-prose h3 {
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.anime-prose p:first-of-type::first-letter {
  float: left;
  padding-right: 0.12em;
  color: var(--theme-accent);
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: 3.3rem;
  line-height: 0.76;
}

.anime-prose ul,
.anime-prose ol { padding-left: 0; list-style: none; display: grid; gap: 0.5rem; }
.anime-prose ol { counter-reset: anime; }
.anime-prose li { position: relative; padding-left: 1.6rem; }
.anime-prose ul li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 0.7rem;
  height: 2px;
  background: var(--theme-accent);
}
.anime-prose ol li::before {
  counter-increment: anime;
  content: counter(anime, decimal-leading-zero);
  position: absolute;
  left: 0;
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--theme-accent);
  top: 0.35em;
}

.anime-prose a {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-decoration-color: var(--theme-accent);
  text-underline-offset: 3px;
}

.anime-prose blockquote {
  border-left: 8px solid var(--theme-accent);
  padding-left: 1.1rem;
  font-style: italic;
  color: var(--theme-muted);
}

.anime-prose code {
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.84em;
  background: var(--theme-surface);
  border: 1px solid color-mix(in srgb, var(--anime-ink) 30%, transparent);
  padding: 0.1em 0.32em;
}

.anime-prose pre {
  background: var(--anime-ink);
  color: var(--anime-paper);
  padding: 1.1rem 1.2rem;
  overflow-x: auto;
}
.anime-prose pre code { background: transparent; border: 0; padding: 0; }

.anime-prose img { width: 100%; height: auto; border: 2px solid var(--anime-ink); }

.anime-prose hr { border: 0; border-top: 2px solid var(--anime-ink); }

.anime-unlock { margin-top: 3.5rem; }

.anime-ticket {
  border: 2px solid var(--anime-ink);
  background: var(--anime-paper);
  box-shadow: 9px 9px 0 var(--theme-accent);
  padding: clamp(1.2rem, 3vw, 2rem);
  position: relative;
}
.anime-ticket::before {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px dashed color-mix(in srgb, var(--anime-ink) 45%, transparent);
  pointer-events: none;
}

.anime-ticket section { border: 0 !important; padding: 0; }
.anime-ticket h2 {
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(1.5rem, 3vw, 2rem);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}
.anime-ticket p { font-size: 1rem; }

.anime-ticket button,
.anime-ticket a:not(.underline) {
  display: inline-block;
  border: 2px solid var(--anime-ink);
  background: var(--theme-accent);
  color: var(--theme-accent-text);
  padding: 0.75rem 1.15rem;
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  box-shadow: 4px 4px 0 var(--anime-ink);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.anime-ticket button:hover,
.anime-ticket a:not(.underline):hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--anime-ink);
}
.anime-ticket a.underline { text-decoration-thickness: 2px; text-underline-offset: 3px; }

.anime-gallery {
  display: grid;
  gap: 1.5rem;
  margin-top: 3.5rem;
}
@media (min-width: 768px) {
  .anime-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.anime-gallery figure {
  border: 2px solid var(--anime-ink);
  background: var(--anime-paper);
  box-shadow: 6px 6px 0 var(--anime-ink);
}
.anime-gallery figure:nth-child(even) { transform: rotate(0.35deg); }
.anime-gallery figure:nth-child(odd) { transform: rotate(-0.35deg); }

.anime-gallery img { display: block; width: 100%; height: auto; }

.anime-gallery figcaption {
  border-top: 2px solid var(--anime-ink);
  padding: 0.45rem 0.7rem;
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
}

.anime-next {
  margin-top: 5rem;
  border-top: 2px solid var(--anime-ink);
  padding-top: 1.2rem;
}
.anime-next-label {
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.7;
}
.anime-next-title {
  display: block;
  margin-top: 0.4rem;
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 0.9;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  transition: color 0.2s ease;
}
.anime-next a:hover .anime-next-title,
.anime-next a:focus-visible .anime-next-title { color: var(--theme-accent); }

.anime-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 4rem;
  border-top: 2px solid var(--anime-ink);
  padding: 1.1rem 0 3rem;
  font-family: var(--font-dm-mono), monospace;
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.75;
}

.anime-end {
  font-family: var(--font-archivo), system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.6rem, 11vw, 7rem);
  line-height: 0.85;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--anime-ink);
  opacity: 0.4;
  padding-bottom: 1rem;
}

[data-theme="anime"] .cursor-dot {
  border-radius: 0;
  background: var(--theme-accent);
  box-shadow: 3px 3px 0 var(--theme-text);
  width: 12px;
  height: 12px;
}

@media (prefers-reduced-motion: reduce) {
  .anime-panel,
  .anime-petal { animation: none; }
  .anime-gallery figure { transform: none; }
}
`;
