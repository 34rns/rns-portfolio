/**
 * Scoped to `.kc-*` classes and the theme wrapper. One string so the CSS only
 * ships with Keycap project pages, the same pattern as the other bespoke
 * themes. Four global selectors are intentional: the shared intro and cursor
 * are suppressed, the document behind the page is painted to match, and the
 * skip link is re-coloured so it does not flash the Professional blue.
 */
export const keycapCss = `
.kc-root {
  --kc-paper: #F4EFE2;
  --kc-paper-deep: #EAE2CE;
  --kc-paper-light: #FFFDF6;
  --kc-ink: #191712;
  --kc-ink-soft: #3B352B;
  --kc-faded: #615A4B;
  --kc-red: #B5341F;
  --kc-green: #174A3C;
  --kc-gold: #DAB05A;
  --kc-rule: rgba(25, 23, 18, 0.16);
  --kc-rule-strong: rgba(25, 23, 18, 0.28);
  --kc-ease: cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  background: var(--kc-paper);
  color: var(--kc-ink);
  font-family: var(--font-newsreader), Georgia, serif;
}

.intro,
.cursor-dot { display: none !important; }

body {
  background: #F4EFE2;
  color-scheme: light;
}

.skip-link {
  background: var(--kc-red);
  color: #FFF9EE;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
}

.kc-root ::selection {
  background: var(--kc-red);
  color: #FFF9EE;
}

.kc-root :focus-visible {
  outline: 2px solid var(--kc-red);
  outline-offset: 3px;
}

.kc-grain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    radial-gradient(rgba(25, 23, 18, 0.055) 0.6px, transparent 0.6px),
    radial-gradient(rgba(255, 253, 246, 0.5) 0.6px, transparent 0.6px);
  background-position: 0 0, 2px 2px;
  background-size: 4px 4px;
  mix-blend-mode: multiply;
}

.kc-wrap {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: clamp(1.25rem, 4vw, 2.5rem);
}

.kc-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.62rem;
  line-height: 1.4;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-eyebrow::before {
  content: "";
  width: 2rem;
  height: 1px;
  background: var(--theme-accent);
}

.kc-display {
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-variation-settings: "wdth" 112;
  letter-spacing: -0.045em;
  line-height: 0.92;
}

/* ----------------------------------------------------------------- header */

.kc-header {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-block: 1.4rem;
  border-bottom: 1px solid var(--kc-rule);
}

.kc-logo {
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.3rem;
  font-weight: 650;
  letter-spacing: -0.05em;
}

.kc-logo span {
  color: var(--theme-accent);
}

.kc-header-meta {
  margin: 0;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-left: auto;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.kc-nav a {
  position: relative;
  padding-bottom: 2px;
}

.kc-nav a::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s var(--kc-ease);
}

.kc-nav a:hover::after,
.kc-nav a:focus-visible::after {
  transform: scaleX(1);
}

/* ------------------------------------------------------------------- hero */

.kc-hero {
  position: relative;
  z-index: 2;
  padding-block: clamp(3.5rem, 8vw, 7rem) clamp(3rem, 6vw, 5rem);
}

.kc-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(2.5rem, 6vw, 6rem);
  align-items: center;
}

.kc-hero-copy {
  position: relative;
  z-index: 2;
}

.kc-title {
  margin: 0.9rem 0 0;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-variation-settings: "wdth" 108;
  font-size: clamp(3.2rem, 8vw, 7rem);
  font-weight: 620;
  line-height: 0.86;
  letter-spacing: -0.06em;
  text-wrap: balance;
}

.kc-title em {
  display: block;
  font-family: var(--font-newsreader), Georgia, serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.035em;
  color: var(--theme-accent);
}

.kc-tagline {
  max-width: 34ch;
  margin: 1.5rem 0 0;
  font-size: clamp(1.15rem, 1.7vw, 1.42rem);
  line-height: 1.5;
  color: var(--kc-ink-soft);
}

.kc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.6rem 0 0;
  padding: 0;
  list-style: none;
}

.kc-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.34rem 0.55rem 0.4rem;
  background: linear-gradient(180deg, var(--kc-paper-light), #EDE4D0);
  border: 1px solid var(--kc-rule-strong);
  border-bottom-width: 3px;
  border-radius: 5px;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--kc-ink-soft);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.kc-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 2rem;
}

.kc-button {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.72rem 1.05rem;
  background: var(--theme-accent);
  color: var(--theme-accent-text);
  border: 1px solid color-mix(in srgb, var(--theme-accent) 74%, #000 12%);
  border-bottom-width: 3px;
  border-radius: 6px;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.22) inset;
  transition: transform 0.14s var(--kc-ease), filter 0.14s var(--kc-ease);
}

.kc-button:hover {
  transform: translateY(1px);
  filter: brightness(1.05);
}

.kc-button--ghost {
  background: var(--kc-paper-light);
  color: var(--kc-ink);
  border-color: var(--kc-rule-strong);
}

.kc-button-version {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.62rem;
}

.kc-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2rem;
  margin: 2rem 0 0;
  padding-top: 1.1rem;
  border-top: 1px solid var(--kc-rule);
}

.kc-fact {
  margin: 0;
}

.kc-fact dt {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.55rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-fact dd {
  margin: 0.2rem 0 0;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-size: 0.86rem;
  font-weight: 500;
}

/* -------------------------------------------------------------------- deck */

.kc-deck {
  position: relative;
  isolation: isolate;
}

.kc-stamp {
  position: absolute;
  right: -2rem;
  bottom: -2.6rem;
  z-index: -1;
  font-family: var(--font-tiro-bangla), "Noto Sans Bengali", "Nirmala UI", sans-serif;
  font-size: clamp(4.5rem, 10vw, 9.5rem);
  line-height: 1;
  color: var(--kc-red);
  opacity: 0.13;
  transform: rotate(-8deg);
  animation: kc-stamp 0.9s var(--kc-ease) 0.2s both;
}

@keyframes kc-stamp {
  from {
    opacity: 0;
    transform: scale(1.3) rotate(-16deg);
  }
  to {
    opacity: 0.13;
    transform: scale(1) rotate(-8deg);
  }
}

.kc-deck-frame {
  position: relative;
  z-index: 1;
  padding: 0.65rem;
  background: linear-gradient(160deg, #FFFDF6 0%, #F0E7D3 52%, #E4D9C1 100%);
  border: 1px solid var(--kc-rule-strong);
  border-radius: 14px;
  box-shadow:
    0 34px 60px -34px rgba(25, 23, 18, 0.55),
    0 1px 0 #FFFDF6 inset,
    0 -2px 0 rgba(25, 23, 18, 0.09) inset;
  transform: rotate(-1.3deg);
  transition: transform 0.55s var(--kc-ease);
}

.kc-deck:hover .kc-deck-frame {
  transform: rotate(0deg) translateY(-4px);
}

.kc-deck-frame::after {
  content: "";
  position: absolute;
  inset: 0.65rem;
  border: 1px solid rgba(25, 23, 18, 0.2);
  border-radius: 4px;
  pointer-events: none;
}

.kc-deck-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.05rem 0.2rem 0.55rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.54rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-lights {
  display: flex;
  gap: 0.3rem;
}

.kc-light {
  display: block;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--kc-green);
  box-shadow: 0 0 0 1px rgba(25, 23, 18, 0.2) inset;
}

.kc-light--red { background: var(--kc-red); }
.kc-light--gold { background: var(--kc-gold); }

.kc-frame {
  position: relative;
  overflow: hidden;
  background: var(--kc-paper-deep);
}

.kc-deck .kc-frame {
  border-radius: 4px;
  border: 1px solid rgba(25, 23, 18, 0.18);
}

.kc-frame img {
  display: block;
}

.kc-deck-caption {
  padding: 0.6rem 0.25rem 0.1rem;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--kc-faded);
}

/* ----------------------------------------------------------------- ticker */

.kc-ticker {
  position: relative;
  z-index: 2;
  overflow: hidden;
  border-block: 1px solid #0E2F26;
  background: var(--kc-green);
  color: #F4EFE2;
}

.kc-ticker-track {
  display: flex;
  width: max-content;
  animation: kc-marquee 38s linear infinite;
}

.kc-ticker:hover .kc-ticker-track {
  animation-play-state: paused;
}

.kc-ticker-run {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  padding: 0.72rem 1.25rem;
  white-space: nowrap;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.kc-ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 2.5rem;
}

.kc-ticker-item::after {
  content: "◆";
  color: var(--kc-gold);
  font-size: 0.48rem;
}

@keyframes kc-marquee {
  to { transform: translateX(-50%); }
}

/* ----------------------------------------------------------------- sections */

.kc-section {
  position: relative;
  z-index: 2;
  padding-block: clamp(4rem, 8vw, 7rem);
}

.kc-section--tint {
  background: var(--kc-paper-deep);
  border-block: 1px solid var(--kc-rule);
}

.kc-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: clamp(2rem, 4vw, 3rem);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--kc-rule-strong);
}

.kc-section-title {
  margin: 0.55rem 0 0;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-variation-settings: "wdth" 108;
  font-size: clamp(2rem, 4.4vw, 3.5rem);
  font-weight: 600;
  line-height: 0.94;
  letter-spacing: -0.045em;
}

.kc-section-note {
  max-width: 34ch;
  margin: 0;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--kc-faded);
  text-align: right;
}

/* ------------------------------------------------------------------- brief */

.kc-brief-grid {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
}

.kc-index {
  position: sticky;
  top: 2rem;
}

.kc-index-title {
  margin: 0 0 0.8rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-index ol {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--kc-rule);
}

.kc-index li {
  border-bottom: 1px solid var(--kc-rule);
}

.kc-index a {
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
  padding: 0.6rem 0;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.04em;
  color: var(--kc-ink-soft);
  transition: color 0.25s var(--kc-ease), padding-left 0.25s var(--kc-ease);
}

.kc-index a:hover {
  padding-left: 0.3rem;
  color: var(--theme-accent);
}

.kc-index-num {
  color: var(--theme-accent);
}

.kc-index-note {
  margin: 1.2rem 0 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--kc-faded);
}

.kc-prose {
  max-width: 68ch;
}

.kc-prose > * + * {
  margin-top: 1.15em;
}

.kc-prose p,
.kc-prose li {
  font-size: 1.16rem;
  line-height: 1.78;
  color: var(--kc-ink-soft);
}

.kc-prose h2 {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 2.5em 0 0;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-variation-settings: "wdth" 108;
  font-size: clamp(1.45rem, 2.4vw, 1.95rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--kc-ink);
}

.kc-prose h2::before {
  content: "";
  flex: none;
  width: 0.5em;
  height: 0.5em;
  border: 1px solid var(--theme-accent);
  background: color-mix(in srgb, var(--theme-accent) 14%, transparent);
  border-radius: 1px;
}

.kc-prose h3 {
  margin-top: 2em;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--kc-ink);
}

.kc-prose strong {
  color: var(--kc-ink);
  font-weight: 600;
}

.kc-prose ul {
  padding-left: 0;
  list-style: none;
}

.kc-prose ul > li {
  position: relative;
  padding-left: 1.55rem;
}

.kc-prose ul > li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.68em;
  width: 0.55rem;
  height: 0.55rem;
  border: 1px solid var(--kc-rule-strong);
  border-radius: 1px;
  background: linear-gradient(180deg, var(--kc-paper-light), #E8DFCB);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset;
}

.kc-prose ol {
  padding-left: 1.3em;
}

.kc-prose ol > li {
  padding-left: 0.3em;
}

.kc-prose a {
  color: var(--theme-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

.kc-prose code {
  padding: 0.12em 0.32em;
  background: var(--kc-paper-deep);
  border: 1px solid var(--kc-rule);
  border-radius: 3px;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.84em;
  color: var(--kc-ink);
}

.kc-prose h2:first-child + p::first-letter {
  float: left;
  margin: 0.04em 0.12em 0 0;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-size: 4.1em;
  font-weight: 600;
  line-height: 0.74;
  color: var(--theme-accent);
}

.kc-prose blockquote {
  margin-left: 0;
  padding-left: 1.2em;
  border-left: 2px solid var(--theme-accent);
  font-style: italic;
  color: var(--kc-faded);
}

/* --------------------------------------------------------------- languages */

.kc-plates {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.1rem;
}

.kc-plate {
  display: flex;
  flex-direction: column;
  padding: 0.55rem;
  background: var(--kc-paper);
  border: 1px solid var(--kc-rule-strong);
  border-radius: 12px;
  box-shadow: 0 22px 40px -34px rgba(25, 23, 18, 0.5);
  transition: transform 0.4s var(--kc-ease), box-shadow 0.4s var(--kc-ease);
}

.kc-plate:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 50px -32px rgba(25, 23, 18, 0.55);
}

.kc-plate-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.15rem 0.3rem 0.6rem;
}

.kc-plate-name {
  margin: 0;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.kc-plate-caption {
  margin: 0.12rem 0 0;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.54rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.4rem;
  height: 2.1rem;
  padding: 0 0.5rem;
  background: linear-gradient(180deg, var(--kc-paper-light), #E8DFCB);
  border: 1px solid var(--kc-rule-strong);
  border-bottom-width: 3px;
  border-radius: 5px;
  font-family: var(--font-tiro-bangla), var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.9rem;
  color: var(--kc-ink);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.kc-plate .kc-frame {
  border-radius: 6px;
  border: 1px solid var(--kc-rule);
  background: #0B1220;
}

.kc-plate-note {
  margin: 0;
  padding: 0.8rem 0.4rem 0.3rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--kc-faded);
}

/* ------------------------------------------------------------------ themes */

.kc-theme-note {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--kc-green);
}

.kc-theme-note::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--kc-green);
}

.kc-theme-strip {
  display: flex;
  gap: 0.9rem;
  overflow-x: auto;
  padding: 0.2rem 0.1rem 1.2rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--kc-rule-strong) transparent;
}

.kc-theme-strip::-webkit-scrollbar {
  height: 6px;
}

.kc-theme-strip::-webkit-scrollbar-thumb {
  background: var(--kc-rule-strong);
  border-radius: 999px;
}

.kc-theme-card {
  flex: 0 0 clamp(150px, 15vw, 196px);
  scroll-snap-align: start;
  padding: 0.4rem;
  background: var(--kc-paper-deep);
  border: 1px solid var(--kc-rule);
  border-radius: 9px;
  transition: transform 0.35s var(--kc-ease);
}

.kc-theme-card:hover {
  transform: translateY(-4px);
}

.kc-theme-card .kc-frame {
  border-radius: 5px;
  border: 1px solid var(--kc-rule);
  background: #0B1220;
}

.kc-theme-name {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.15rem 0.15rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.55rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--kc-ink-soft);
}

.kc-theme-index {
  color: var(--kc-faded);
}

/* ---------------------------------------------------------------- specimen */

.kc-specimen {
  background: var(--kc-green);
  color: #F4EFE2;
  border-block: 1px solid #0E2F26;
}

.kc-specimen .kc-eyebrow,
.kc-specimen .kc-section-note {
  color: rgba(244, 239, 226, 0.68);
}

.kc-specimen .kc-eyebrow::before {
  background: var(--kc-gold);
}

.kc-specimen .kc-section-head {
  border-bottom-color: rgba(244, 239, 226, 0.28);
}

.kc-specimen .kc-section-title {
  color: #F4EFE2;
}

.kc-banglish {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: clamp(2rem, 6vw, 5rem);
  margin: 0;
  border-top: 1px solid rgba(244, 239, 226, 0.26);
}

.kc-banglish-row {
  display: grid;
  grid-template-columns: minmax(4.5rem, auto) 1.4rem minmax(0, 1fr) auto;
  gap: 0.7rem;
  align-items: baseline;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgba(244, 239, 226, 0.18);
}

.kc-roman {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 1.02rem;
  color: var(--kc-gold);
}

.kc-arrow {
  color: rgba(244, 239, 226, 0.45);
  font-family: var(--font-dm-mono), ui-monospace, monospace;
}

.kc-bangla {
  font-family: var(--font-tiro-bangla), "Noto Sans Bengali", "Nirmala UI", sans-serif;
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  line-height: 1.35;
  color: #FFF9EE;
}

.kc-meaning {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(244, 239, 226, 0.68);
  text-align: right;
}

.kc-specimen-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.6rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(244, 239, 226, 0.68);
}

/* ----------------------------------------------------------------- gallery */

.kc-gallery-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1.1rem;
}

.kc-shot {
  grid-column: span 4;
  margin: 0;
}

.kc-shot--wide {
  grid-column: span 6;
}

.kc-shot .kc-frame {
  border: 1px solid var(--kc-rule-strong);
  border-radius: 9px;
  background: #0B1220;
  box-shadow: 0 24px 45px -38px rgba(25, 23, 18, 0.55);
}

.kc-shot figcaption {
  display: flex;
  gap: 0.55rem;
  margin-top: 0.55rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  line-height: 1.5;
  letter-spacing: 0.04em;
  color: var(--kc-faded);
}

.kc-shot-index {
  color: var(--theme-accent);
}

/* ------------------------------------------------------------------- proof */

.kc-proof {
  background: var(--kc-ink);
  color: var(--kc-paper);
  border-block: 1px solid #0B0907;
}

.kc-proof .kc-eyebrow,
.kc-proof .kc-section-note {
  color: rgba(244, 239, 226, 0.6);
}

.kc-proof .kc-eyebrow::before {
  background: var(--kc-gold);
}

.kc-proof .kc-section-head {
  border-bottom-color: rgba(244, 239, 226, 0.22);
}

.kc-proof .kc-section-title {
  color: var(--kc-paper);
}

.kc-proof-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: rgba(244, 239, 226, 0.2);
  border: 1px solid rgba(244, 239, 226, 0.2);
}

.kc-proof-cell {
  padding: 1.4rem 1.2rem;
  background: var(--kc-ink);
}

.kc-proof-value {
  margin: 0;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-variation-settings: "wdth" 104;
  font-size: clamp(2.4rem, 4.2vw, 3.6rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--kc-paper);
}

.kc-proof-label {
  margin: 0.4rem 0 0;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(244, 239, 226, 0.6);
}

.kc-proof-code {
  margin: 2rem 0 0;
  padding: 1.1rem 1.3rem;
  background: #0E0C09;
  border: 1px solid rgba(244, 239, 226, 0.16);
  border-radius: 6px;
  overflow-x: auto;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.76rem;
  line-height: 1.75;
  color: rgba(244, 239, 226, 0.82);
}

.kc-proof-code .kc-ok {
  color: #8FD19E;
}

.kc-proof-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 1.2rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(244, 239, 226, 0.5);
}

/* ----------------------------------------------------------------- related */

.kc-related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.1rem;
}

.kc-related-card {
  display: block;
  padding-top: 0.9rem;
  border-top: 2px solid var(--kc-ink);
  transition: transform 0.35s var(--kc-ease);
}

.kc-related-card:hover {
  transform: translateY(-3px);
}

.kc-related-index {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  color: var(--theme-accent);
}

.kc-related-title {
  display: block;
  margin-top: 0.55rem;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.35rem, 2.4vw, 1.9rem);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.035em;
}

.kc-related-meta {
  display: block;
  margin-top: 0.45rem;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-next {
  margin-top: clamp(3rem, 6vw, 5rem);
  padding-top: 1.4rem;
  border-top: 1px solid var(--kc-rule-strong);
}

.kc-next-label {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-next-link {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 0.4rem;
}

.kc-next-title {
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-variation-settings: "wdth" 106;
  font-size: clamp(2.4rem, 6vw, 5.2rem);
  font-weight: 600;
  line-height: 0.94;
  letter-spacing: -0.05em;
  transition: color 0.3s var(--kc-ease);
}

.kc-next-link:hover .kc-next-title {
  color: var(--theme-accent);
}

.kc-next-arrow {
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
  color: var(--theme-accent);
}

/* ------------------------------------------------------------------ footer */

.kc-footer {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
  padding-block: 1.5rem 2.4rem;
  border-top: 1px solid var(--kc-rule);
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--kc-faded);
}

.kc-footer a {
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ------------------------------------------------------------------ motion */

.kc-reveal {
  opacity: 1;
}

@supports (animation-timeline: view()) {
  .kc-reveal {
    animation: kc-rise 0.8s var(--kc-ease) both;
    animation-timeline: view();
    animation-range: entry 6% cover 24%;
  }
}

@keyframes kc-rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ------------------------------------------------------------- responsive */

@media (max-width: 1020px) {
  .kc-hero-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 3.5rem;
  }

  .kc-deck {
    max-width: 680px;
  }

  .kc-stamp {
    right: -1rem;
    bottom: -1.5rem;
  }

  .kc-brief-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }

  .kc-index {
    position: static;
  }

  .kc-index ol {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 1.5rem;
  }

  .kc-proof-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .kc-header-meta {
    display: none;
  }

  .kc-plates {
    display: flex;
    overflow-x: auto;
    padding-bottom: 1rem;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    scrollbar-color: var(--kc-rule-strong) transparent;
  }

  .kc-plate {
    flex: 0 0 min(78vw, 360px);
    scroll-snap-align: start;
  }

  .kc-banglish {
    grid-template-columns: minmax(0, 1fr);
  }

  .kc-gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
  }

  .kc-shot,
  .kc-shot--wide {
    grid-column: span 1;
  }

  .kc-related-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .kc-section-note {
    display: none;
  }
}

@media (max-width: 620px) {
  .kc-nav {
    gap: 0.8rem;
    font-size: 0.55rem;
  }

  .kc-nav a:not(:last-child) {
    display: none;
  }

  .kc-title {
    font-size: clamp(2.9rem, 15vw, 4.6rem);
  }

  .kc-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .kc-button {
    justify-content: center;
  }

  .kc-proof-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .kc-gallery-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .kc-specimen-foot,
  .kc-proof-foot {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kc-stamp,
  .kc-reveal,
  .kc-ticker-track {
    animation: none !important;
  }

  .kc-deck-frame,
  .kc-plate,
  .kc-theme-card,
  .kc-related-card,
  .kc-next-title {
    transition: none;
  }

  .kc-deck-frame {
    transform: none;
  }
}
`;
