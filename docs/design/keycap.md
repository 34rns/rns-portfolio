# Keycap theme — design notes

The brief: a case study for a Bengali keyboard that reads as a printed type
specimen, not a phone-app landing page. The project is Shobdo Keyboard — warm
paper, letterpress keycaps, a brick-red accent and a bottle-green structure,
with Tiro Bangla carrying every line of Bangla display type.

## Concept

**A type specimen from a Dhaka print shop.** The page is set like a broadsheet:
a masthead, a two-column hero with the "deck" plate on the right, a green ticker
across the fold, then numbered sections that behave like spreads. The keyboard
is treated as physical object — the hero capture sits in a tilted platen frame
with a registration border, and tags are rendered as keycaps with a raised
bottom edge.

The composition deliberately differs from the other themes: Professional is an
editorial register, Anime 3D is a manga page grid, Synthwave is a full-bleed
arcade poster, Cyberpunk is a field-ops dashboard. Keycap is a **printed
specimen sheet**: paper ground, hairline rules, numbered contents rail, one
photographic plate per language, a horizontal theme strip, and a proof panel on
near-black.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| background | `#F4EFE2` | warm paper |
| surface | `#EAE2CE` | tinted section ground |
| text | `#191712` | black-brown ink (15.6:1) |
| muted | `#615A4B` | captions and metadata (6.0:1) |
| accent | `#B5341F` | brick red: buttons, links, rules (5.3:1) |
| accentText | `#FFF9EE` | cream on brick |
| line | `rgba(25, 23, 18, 0.16)` | hairlines |
| radius | `8px` | keycap corners |
| display | Archivo (`wdth` 108–112) | titles and section heads |
| body | Newsreader | prose |
| mono | DM Mono | labels, metadata, code |

The admin accent override drives `--theme-accent`, so it changes the buttons,
numbering, rules and key shadows, never the paper or the photography.

Secondary colours live only in the stylesheet: bottle green `#174A3C` for the
ticker and Banglish band, gold `#C99A3E` for ticker diamonds and the Roman
column, and `#FFFDF6` for the lifted face of a keycap.

## Type

- **Archivo** (variable width) — title, section heads, facts, next specimen.
  Tight `-0.045em` to `-0.06em` tracking and 0.86–0.94 line-height, so the
  display type reads as stamped rather than typed.
- **Newsreader** — body at 1.16rem / 1.78, 68ch, with an italic second word in
  the title. A serif is the point: it separates the specimen from every
  sans-serif product page.
- **DM Mono** — eyebrows, labels, captions, facts, the ticker and the terminal
  proof block, at 0.54–0.62rem with 0.08–0.18em tracking.
- **Tiro Bangla** — loaded once in the root layout with `preload: false`, so it
  is fetched only on pages that reference it. Used for the `শব্দ` stamp, the
  language plate chips and the Bangla column of the decoder.

## Layout

```
RNS/TYPE     SPECIMEN 06 · ANDROID IME · 2026        THE DECK  THEMES  PROOF  ALL WORK
────────────────────────────────────────────────────────────────────────────────────
CASE STUDY / 2026 / 4 MIN READ              ┌ LIVE CAPTURE / ANDROID 15 ┐
SHOBBO                                      │  ● ● ●      বাং · BL · EN │
Keyboard                                    │   [ composite cover ]     │
Bangla, Banglish and English…               └───────────────────────────┘
[Android][Kotlin][Compose][IME][Bengali]     শব্দ stamp behind the plate
→ DOWNLOAD APK   → VIEW SOURCE
PLATFORM │ RELEASE │ LICENCE │ BUILT WITH
───────────────────────── green ticker ─────────────────────────
01 THE BRIEF      contents rail (sticky)  │  prose (68ch)
02 THE LANGUAGES  three plates            │
03 THE THEMES     thirteen-card strip     │
04 BANGLISH       green decoder band      │
05 THE CAPTURES   twelve-column gallery   │
06 THE PROOF      four cells + aapt block │
OTHER SPECIMENS   three top-ruled cards   │
NEXT SPECIMEN →   oversized title
footer: Shobdo Keyboard / Android IME / 2026 · RETURN TO TOP
```

On desktop the hero splits 1.05fr / 0.95fr. At 1020px it stacks, the contents
rail becomes static, and the proof grid goes two-up. At 860px the language
plates become a snap-scrolling rail, the decoder drops to one column and the
gallery falls back to two columns. At 620px the gallery is single column, the
nav keeps only "All work", and the actions stack full-width.

## Motion

Personality: **tactile, not bouncy.** A key press settles; it does not spring.

| Property | Choice |
| --- | --- |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Buttons | 140ms press: 1px down, one brightness step |
| Plates | 400ms lift on hover, deck frame straightens from -1.3° |
| Entrance | `kc-rise` 800ms, `animation-timeline: view()` behind `@supports` |
| Ticker | 38s linear marquee, paused on hover |
| Stamp | one 900ms settle from 1.3× / -16° to 1× / -8° |
| Restraint | no scroll-jacking, no parallax, no ambient loop besides the ticker |

Under `prefers-reduced-motion` the ticker, stamp and reveals stop, all hover
transitions are removed, and the deck sits flat. Content is visible without
support for scroll-driven animation because the default state is opacity 1.

## Surface treatment

- **Paper grain:** two offset radial-gradient dot layers at 4px, multiplied at
  50% opacity; fixed, pointer-events none, behind content.
- **Keycaps:** a light-to-deep vertical gradient, one hairline border, a 3px
  bottom border and an inset white highlight. Used for tags, buttons, facts
  chips and the theme plate. Depth comes from borders, never from blur.
- **Platen frame:** 0.65rem paper rim, 14px radius, double registration border,
  large soft shadow and a -1.3° tilt that straightens on hover.
- **Rules:** 1px hairlines separate every section head and index row, so the
  page reads as a ruled sheet rather than a stack of cards.
- **Green band:** the Banglish decoder and ticker are full-bleed bottle green
  with cream type; it is the one saturated field on the page.

## Content model

The page is data-driven where it matters:

- Title, tagline, tags, year, links, description and gallery come from the
  project row, so the theme is reusable and the admin edit flow stays live.
- Language plates, the thirteen theme names/paths, the decoder rows, gallery
  captions/ratios and proof points are fixed specimen data in `specimen.ts`
  (no React import), which keeps the contrast and content tests light.
- `gallerySources` filters out images already used as language plates or the
  cover, so a project row can list all 22 assets without repeating one.
- `ReleaseVersion` reads the live release tag from GitHub; the button says
  "Download APK" only when the URL is a stable `/releases/latest/download/`
  link. Shobdo uses `/releases/latest`, labelled "Latest release", because its
  APK filenames contain the version. This follows new tags without a broken
  asset URL; the badge updates automatically. Proof figures explicitly refer
  to the verified v0.4.0 snapshot.

## Accessibility and performance

- WCAG AA is asserted for text, muted, accent and accent-on-accent pairs.
- The skip link is re-coloured brick so it does not flash the Professional blue;
  focus-visible is a 2px brick ring at 3px offset.
- Real landmarks and headings: one `h1`, one `h2` per section, labelled navs,
  `lang="bn"` on Bangla specimen text, `aria-hidden` on the stamp, ticker and
  decorative arrows.
- The theme strip is a labelled, focusable region, so it scrolls by keyboard
  and trackpad; the language rail inherits native scroll.
- All images go through `SmartImage`; the hero is the only `priority` image,
  and every other frame declares its aspect ratio so nothing reflows.
- No new dependencies, no canvas, no WebGL, no client component. Project pages
  stay statically generated.
- The root layout adds one `preload: false` font loader; the rest of the site
  does not download Tiro Bangla.

## Demo

`shobdo-keyboard` is the project that carries the theme. Its 22 real captures
live in `public/projects/shobdo/`; the landing page stays Professional and the
theme ships no `Landing`.

## Files

- `tokens.ts` — palette and type stacks
- `specimen.ts` — fixed plates, theme shots, decoder rows, proof, ticker
- `preview.tsx` — admin picker miniature
- `project-page.tsx` — page composition
- `styles.ts` — all `.kc-*` CSS, scoped to one string
- `theme.tsx` — registry entry
