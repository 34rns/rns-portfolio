export const folderdockStyles = String.raw`
.fd-page {
  min-height: 100vh;
  overflow-x: clip;
  background:
    linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px),
    var(--theme-bg);
  background-size: 32px 32px;
  color: var(--theme-text);
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
}

.fd-shell {
  width: min(1180px, calc(100% - 48px));
  margin-inline: auto;
}

.fd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-block: 1.3rem;
  border-bottom: 1px solid var(--theme-line);
}

.fd-brand {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: .82rem;
  font-weight: 500;
  letter-spacing: .08em;
}

.fd-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: .55rem 1.25rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: .7rem;
  color: var(--theme-muted);
}

.fd-nav a,
.fd-text-link {
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: .25rem;
  transition: color .2s ease, text-decoration-color .2s ease;
}

.fd-nav a {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
}

.fd-nav a:hover,
.fd-nav a:focus-visible,
.fd-text-link:hover,
.fd-text-link:focus-visible {
  color: var(--theme-text);
  text-decoration-color: var(--theme-accent);
}

.fd-hero {
  display: grid;
  grid-template-columns: minmax(0, .82fr) minmax(0, 1.38fr);
  gap: clamp(2.5rem, 6vw, 5.5rem);
  align-items: center;
  padding-block: clamp(4.5rem, 9vw, 8rem);
}

.fd-kicker,
.fd-section-label,
.fd-meta,
.fd-caption,
.fd-limit-title {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
}

.fd-kicker {
  display: inline-flex;
  align-items: center;
  gap: .65rem;
  margin: 0;
  color: var(--theme-muted);
  font-size: .68rem;
  line-height: 1.5;
}

.fd-kicker::before {
  content: "";
  width: .55rem;
  height: .55rem;
  border-radius: 2px;
  background: var(--theme-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-accent) 14%, transparent);
}

.fd-title {
  margin: 1.35rem 0 0;
  font-size: clamp(3.6rem, 6.8vw, 6rem);
  font-weight: 660;
  line-height: .88;
  letter-spacing: -.065em;
  white-space: nowrap;
}

.fd-headline {
  max-width: 18ch;
  margin: 1.55rem 0 0;
  font-size: clamp(1.45rem, 2.8vw, 2.15rem);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -.035em;
}

.fd-lede {
  max-width: 54ch;
  margin: 1.15rem 0 0;
  color: var(--theme-muted);
  font-size: 1.04rem;
  line-height: 1.72;
}

.fd-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  margin-top: 1.8rem;
}

.fd-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: .75rem 1rem;
  border: 1px solid var(--theme-line);
  border-radius: 6px;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: .72rem;
  font-weight: 500;
  transition: background .2s ease, border-color .2s ease, color .2s ease;
}

.fd-button--primary {
  border-color: var(--theme-accent);
  background: var(--theme-accent);
  color: var(--theme-accent-text);
}

.fd-button--primary:hover,
.fd-button--primary:focus-visible {
  background: #FF9D5C;
  border-color: #FF9D5C;
}

.fd-button--secondary:hover,
.fd-button--secondary:focus-visible {
  border-color: var(--theme-accent);
  color: var(--theme-accent);
}

.fd-meta {
  margin: .85rem 0 0;
  color: var(--theme-muted);
  font-size: .63rem;
  line-height: 1.55;
}

.fd-window {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--theme-line);
  border-radius: 10px;
  background: #151515;
  box-shadow: 0 28px 70px rgba(0,0,0,.38);
}

.fd-window::after {
  content: "";
  position: absolute;
  inset: 0 0 0 auto;
  width: 4px;
  background: var(--theme-accent);
}

.fd-window-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 .85rem;
  border-bottom: 1px solid var(--theme-line);
  background: var(--theme-surface);
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: .58rem;
  color: var(--theme-muted);
}

.fd-window-dots {
  display: flex;
  gap: .35rem;
}

.fd-window-dot {
  width: .45rem;
  height: .45rem;
  border-radius: 50%;
  background: #56565A;
}

.fd-window-dot:first-child { background: var(--theme-accent); }

.fd-frame {
  position: relative;
  aspect-ratio: 32 / 21;
  background: #161616;
}

.fd-frame img {
  object-fit: contain;
}

.fd-section {
  padding-block: clamp(4.5rem, 8vw, 7rem);
  border-top: 1px solid var(--theme-line);
}

.fd-section-label {
  margin: 0;
  color: var(--theme-accent);
  font-size: .66rem;
  letter-spacing: .05em;
}

.fd-section-title {
  max-width: 22ch;
  margin: .9rem 0 0;
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  font-weight: 620;
  line-height: 1;
  letter-spacing: -.052em;
}

.fd-section-intro {
  max-width: 62ch;
  margin: 1rem 0 0;
  color: var(--theme-muted);
  font-size: 1.04rem;
  line-height: 1.72;
}

.fd-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 2.5rem;
  border: 1px solid var(--theme-line);
  background: var(--theme-line);
  gap: 1px;
}

.fd-step {
  min-height: 220px;
  padding: 1.4rem;
  background: var(--theme-surface);
}

.fd-step-num {
  display: block;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  color: var(--theme-accent);
  font-size: .68rem;
}

.fd-step h3,
.fd-feature h3,
.fd-story h3,
.fd-install-panel h3 {
  margin: 3rem 0 0;
  font-size: 1.25rem;
  font-weight: 560;
  letter-spacing: -.025em;
}

.fd-step p,
.fd-feature p,
.fd-story p,
.fd-install-panel p,
.fd-install-panel li,
.fd-limit-list li {
  color: var(--theme-muted);
  font-size: .98rem;
  line-height: 1.68;
}

.fd-step p,
.fd-feature p,
.fd-story p,
.fd-install-panel p { margin: .7rem 0 0; }

.fd-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.5rem;
}

.fd-feature {
  min-height: 230px;
  padding: 1.5rem;
  border: 1px solid var(--theme-line);
  border-radius: var(--theme-radius);
  background: color-mix(in srgb, var(--theme-surface) 92%, transparent);
}

.fd-feature-mark {
  display: block;
  width: 2.4rem;
  height: 3px;
  background: var(--theme-accent);
}

.fd-feature h3 { margin-top: 2.7rem; }

.fd-showcase {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.5rem;
}

.fd-shot {
  margin: 0;
}

.fd-shot .fd-window {
  box-shadow: 0 18px 50px rgba(0,0,0,.26);
}

.fd-caption {
  margin-top: .8rem;
  color: var(--theme-muted);
  font-size: .62rem;
  line-height: 1.6;
}

.fd-story-grid,
.fd-install-grid {
  display: grid;
  grid-template-columns: minmax(0, .75fr) minmax(0, 1.25fr);
  gap: clamp(2rem, 7vw, 6rem);
  align-items: start;
}

.fd-story h3,
.fd-install-panel h3 { margin-top: 0; }

.fd-tech-line {
  display: flex;
  flex-wrap: wrap;
  gap: .55rem;
  margin-top: 1.5rem;
}

.fd-tech-line span {
  padding: .38rem .55rem;
  border: 1px solid var(--theme-line);
  border-radius: 4px;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  color: var(--theme-muted);
  font-size: .58rem;
}

.fd-install-panel {
  padding: 1.5rem;
  border: 1px solid var(--theme-line);
  border-radius: var(--theme-radius);
  background: var(--theme-surface);
}

.fd-install-panel ol {
  margin: 1.2rem 0 0;
  padding-left: 1.25rem;
}

.fd-install-panel li + li { margin-top: .65rem; }

.fd-limit-title {
  margin: 2rem 0 .75rem;
  color: var(--theme-accent);
  font-size: .64rem;
}

.fd-limit-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.fd-limit-list li {
  position: relative;
  padding-left: 1rem;
}

.fd-limit-list li + li { margin-top: .45rem; }
.fd-limit-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: .68em;
  width: .35rem;
  height: .35rem;
  background: var(--theme-accent);
}

.fd-final {
  padding-block: clamp(4rem, 8vw, 7rem);
  border-block: 1px solid var(--theme-line);
  background: linear-gradient(115deg, var(--theme-surface), #211A16);
}

.fd-final-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
}

.fd-final h2 {
  max-width: 17ch;
  margin: 0;
  font-size: clamp(2.3rem, 5vw, 4.6rem);
  font-weight: 620;
  line-height: .98;
  letter-spacing: -.055em;
}

.fd-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem 2rem;
  padding-block: 1.6rem 2.4rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  color: var(--theme-muted);
  font-size: .58rem;
  line-height: 1.6;
}

.fd-footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: .7rem 1.1rem;
}

.fd-footer-links a {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
}

@media (max-width: 900px) {
  .fd-hero,
  .fd-story-grid,
  .fd-install-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .fd-hero { gap: 3.5rem; }
  .fd-hero-copy { max-width: 680px; }
  .fd-steps { grid-template-columns: minmax(0, 1fr); }
  .fd-step { min-height: 0; }
  .fd-step h3 { margin-top: 2rem; }
}

@media (max-width: 680px) {
  .fd-shell { width: min(100% - 36px, 1180px); }
  .fd-header { align-items: flex-start; flex-direction: column; gap: .9rem; }
  .fd-nav { justify-content: flex-start; }
  .fd-hero { padding-block: 4rem; }
  .fd-title { font-size: clamp(3.3rem, 18vw, 5.1rem); }
  .fd-feature-grid,
  .fd-showcase { grid-template-columns: minmax(0, 1fr); }
  .fd-actions { flex-direction: column; align-items: stretch; }
  .fd-button { width: 100%; }
  .fd-final-inner { align-items: stretch; flex-direction: column; }
  .fd-final .fd-actions { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .fd-nav a,
  .fd-text-link,
  .fd-button { transition: none; }
}
`;
