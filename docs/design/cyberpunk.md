# Cyberpunk theme — design notes

The brief: a cyberpunk theme that reads as commissioned art direction, not a
purple-and-neon recolour. The project arrives as an intercepted case file on a
field-ops terminal: optic feed, acid HUD, glitch title, one trace line that never
stops moving.

## Concept

**Night City intercept, 03:00.** The page is not a poster and not a magazine; it
is a workstation. The header is a sticky status bar, the hero is split into a
briefing on the left and a live optic feed on the right, and every section is
announced by a numbered rail (`01 / DOSSIER`, `02 / CAPTURE SLATE`). The only
warm colour on the page is the alert red used for "recording" and glitch fringing;
everything else is near-black, paper white, acid yellow and cyan.

The composition deliberately differs from the other three themes: Professional
is an editorial register, Anime 3D is a manga page grid, Synthwave is a
full-bleed arcade poster. Cyberpunk is a **dashboard**: asymmetric two-column
hero, sticky metadata sidebar, row-based onward navigation.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| background | `#05070A` | near-black ground (not navy) |
| surface | `#0B1116` | panels |
| text | `#E8F4F8` | paper white, cool (17:1) |
| muted | `#94AAB5` | metadata (8:1) |
| accent | `#E6FF3D` | acid yellow: the only interactive colour |
| accentText | `#05070A` | text on acid |
| line | `rgba(232,244,248,0.14)` | hairlines |
| radius | `0px` | hard corners everywhere |
| cyan | `#34E1F5` | telemetry, section rails, crosshair |
| rose | `#FF3B5C` | recording dot, alerts, glitch ghost |

The admin accent override drives `--theme-accent`, so it changes buttons, links,
brackets and the progress line, never the scene artwork.

## Type

- **Archivo** (variable width, `wdth 118`) — display: title, section heads,
  prices, next-transmission. Uppercase, -0.045em tracking, 0.86 line-height.
  Squared and industrial without a novelty face.
- **IBM Plex Mono** — body, metadata, labels. Labels run at 0.5–0.62rem with
  0.18–0.22em tracking; body at 1rem / 1.78, 66ch.
- Both families already ship in the root layout; the theme adds no font loader,
  so the registry and its tests stay free of build-time transforms.

## Layout

```
RNS//   FIELD OPS / INTERCEPT      ● NODE 09 · 2026    DOSSIER  CAPTURES  ALL WORK
──────────────────────────────────────────────────────────────────────────────
CASE FILE 2026 / OPEN CHANNEL          ┌ OPTIC FEED / WEBGL        CACHE 09 ┐
GHOSTLINE 09                           │  ⌐                        ¬        │
A courier dispatch console…            │      [ 3D stage ]     +           │
TAG  [Next.js][WebGL][Realtime]        │  ⌐     TARGET / GHOSTLINE   ¬      │
YEAR │ ACCESS │ READ │ RIG             └ DRAG TO ORBIT · SCROLL TO TILT ────┘
→ LIVE SITE        → REPOSITORY
──────────────────────────────────────
REQUISITION / LOCKED      CLEARANCE REQUIRED → buy panel
01 / DOSSIER              prose (66ch)        │ FILE METADATA (sticky)
02 / CAPTURE SLATE        two-up frames       │
03 / OTHER SIGNALS        rows + signal bars  │
NEXT TRANSMISSION →       large title
footer: RNS//INTERCEPT · NEXT.JS / WEBGL · NODE 26 / 88.9 MHz · RETURN TO START
```

On desktop the hero is two columns (1.06fr / 0.94fr). Below 980px it stacks and
the optic feed becomes a full-width 4:3 screen. The dossier prose and metadata
sidebar split at 900px; below that the metadata sits after the prose. The
capture grid goes two-up at 820px.

The 3D stage is the shared `ModelStage` — auto-fit, admin scale/offset and the
lighting preset are untouched. Only the viewfinder chrome, brackets, crosshair,
scan sweep and caption are the theme's.

## Motion

Personality: **surveillance** — precise, mechanical, never bouncy.

| Property | Choice |
| --- | --- |
| Easing | `cubic-bezier(0.2, 0.9, 0.2, 1)` |
| Taps | 140ms colour/border transitions |
| Entrance | 460ms rise after the handshake, 90ms stagger to the optic feed |
| Loops | linear/steps only: trace drift, scan sweep, rec blink, window lights |
| Glitch | 7.5s cycle with three short clip bursts; no continuous shaking |
| Restraint | one wow: the handshake and the optic feed. No scroll-jacking |

- **Handshake:** a session-scoped overlay (not a full boot) with a meter that
  fills once, four log lines and `ESTABLISH FEED`. Enter/Escape, focus trap,
  scroll lock, skip button. Dismissal sets `data-booted`, which starts the hero
  choreography; the overlay is skipped on repeat visits and under reduced
  motion. Without `data-booted` the hero is simply visible, so skipping never
  leaves an invisible page.
- **Backdrop:** one rAF loop advances the scan offset (`trace.ts`, tested) and
  writes it to `--cyber-trace-y`; a scroll listener writes
  `--cyber-progress` and `--cyber-depth`. The loop stops when the tab is hidden
  and under reduced motion.
- **Sections:** `animation-timeline: view()` behind `@supports`; browsers
  without support show the content immediately.

## Surface treatment

- **Skyline:** 30 deterministic blocks with a window grid painted as two
  repeating gradients, plus one acid light strip that blinks on a steps
  timeline. Index arithmetic, not `Math.random`, so server and client agree.
- **Trace:** a repeating 96px line layer translated by the wrapped offset. One
  compositor-friendly transform, no canvas.
- **Finder ring:** a large dashed ring with a 120s rotation, mostly off the right
  edge, plus a cyan crosshair in the optic frame.
- **Scanlines:** 3px gradients at 45% opacity, behind text; never a filter pass.
- **Glitch title:** a duplicated, `aria-hidden` text layer with a clip-path
  animation and cyan/rose offsets. No blur, so glyphs stay sharp at 2× DPI.

## Cards

Gallery images become **capture frames**: 16:10 window, cyan frame number,
bracket hover, a scan sweep on hover, and a caption split into project / frame.
Onward navigation is **Other signals**: a table-like row with index, title, year,
five deterministic signal bars (`signalStrength`, tested by slug) and an arrow.
It gives the page onward navigation even when a project has no gallery.

## Paid section

Rendered only when the route passes `access`. The theme adds a requisition rail
("LOCKED"), a heading, and the shared `ProjectAccess` panel with scoped
selectors: mono eyebrow, Archivo price, an acid outline button that inverts on
hover. Error copy is re-coloured to the alert rose on the dark panel.

## Accessibility and performance

- WCAG AA is asserted for body, muted, accent and accent-on-accent pairs.
- Skip link, focus-visible rings, real headings, labelled sections.
- The handshake is a labelled dialog with a focus trap, Escape and scroll lock.
- The reticle cursor is fine-pointer only and disabled under reduced motion,
  where the native cursor returns.
- `prefers-reduced-motion` removes the handshake, trace drift, scan sweep, rec
  blink, ring rotation, title glitch, hover transforms and reveals.
- No new dependencies, no canvas backdrop, no SVG filters. Two lightweight rAF
  consumers (scene, cursor) park when hidden or still; three.js loads only when
  the stage nears the viewport.
- Project pages remain statically generated; every client component is
  decorative or interaction-only.

## Demo

`Ghostline 09` is the unlisted seed project that carries the theme, with
generated poster art in `public/demo`. The landing page stays Professional; the
theme ships no `Landing`.
