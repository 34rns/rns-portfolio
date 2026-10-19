# Anime 3D theme — design notes

The brief: a project page that feels like a printed manga chapter, with the
project itself rendered as a cel-shaded object you can turn in your hands. It has
to stay legible, fast, and usable without WebGL.

## Concept

A case file from a hunter's archive. Ink-black rules, warm paper, vermilion
stamps, halftone screens and speed lines. The 3D stage is the chapter's centre
spread — not a background toy — framed by a technical bar and footer so it reads
as an instrument, then the written case study follows like pages.

The theme is project-page only. The site keeps the Professional landing so the
portfolio still reads as one publication rather than two sites.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| background | `#F2EEE3` | Warm manga paper |
| surface | `#FBF8EF` | Panels and stage housing |
| text | `#12100E` | Ink |
| muted | `#5E574B` | Secondary copy, captions |
| accent | `#E8381F` | Vermilion: stamps, rules, links |
| accentText | `#FFF6EC` | Text on accent |
| line | `rgba(18,16,14,0.85)` | 2px panel outlines |
| radius | `0px` | Hard printed corners |

Project `themeOptions.accent` overrides the accent per project, and the stamp,
rules, links and toon outlines follow it.

## Type

- **Archivo** black, condensed tracking, uppercase, for titles and labels. The
  final word of the title is outlined with `-webkit-text-stroke` so one word
  carries the manga treatment instead of the whole heading.
- **Newsreader** for the case study at 1.1rem/1.78, max 68ch, with a drop cap.
- **DM Mono** for file metadata, panel numbers and stage readouts.

## Layout

- 1440px frame, bordered header with file metadata.
- Hero: outlined title, skewed accent rule, stamp, tagline and chips; below it a
  16/11 stage beside a session-data panel and link rows (single column on
  mobile).
- Case study: 220px meta rail plus prose. Markdown gets square bullets, numbered
  lists, hard-ruled headings and inverted code blocks.
- Gallery: two-up panels with alternating 0.35° tilt and captions.
- Footer: oversized outlined "To be continued", next-file link, back to top.

## Motion

- Panels slam in with one cubic-bezier overshoot; delays stagger the stage, rail
  and unlock ticket. Sakura petals fall continuously at 12–22s.
- Stage: auto-rotate, pointer parallax, scroll-linked camera tilt/FOV, orbit
  controls with damping.
- All decorative motion stops under `prefers-reduced-motion`; the stage becomes
  a poster with a one-click opt-in.

## 3D and performance

- three.js is a separate chunk loaded only when the stage enters the viewport
  (300px margin), and only for devices with more than four cores, at least 4 GB
  of memory, and no reduced-motion preference.
- The render loop pauses off-screen. A cover image (or a dot screen) stands in
  until the model is ready, with a loading readout in the stage footer.
- Uploaded models are measured, centered at the origin and scaled to fill about
  70% of the stage height, whatever units the GLB uses. The per-project scale
  and offset multiply on top of that fit. Missing or broken models fall back to
  a built-in icosahedron scene or the poster, never an empty frame.
- Toon mode swaps standard materials for `MeshToonMaterial` with a four-step
  gradient and adds back-face ink outlines. The theme's scoped CSS is a single
  string, so it ships only with anime project pages.

## Accessibility

Semantic header/main/footer, skip link from the site layout, visible focus,
`role="group"` plus a descriptive label on the stage, buttons (not divs) for the
3D opt-in, and no content that requires motion or WebGL to read. The stage can
be scrolled past on touch: vertical swipes scroll, horizontal drags orbit.
