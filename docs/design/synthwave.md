# Synthwave theme — design notes

The brief: a retro 1980s theme that reads as a commissioned art direction, not a
purple recolor. Deep purple ground, hot magenta, cyan, sunset orange, a pixel
display face, a clean mono for reading.

## Concept

**Broadcast from 1986.** The project arrives as a transmission: boot it, read
the case file, play the captures. The page is a CRT console standing on a neon
grid, with the title as the poster above the horizon and the 3D stage as the
machine's screen. Nothing is decorated for its own sake; every piece of chrome
is framed as hardware or broadcast language.

The composition deliberately differs from the other two themes: Professional is
an editorial register, Anime 3D is a manga page grid, Synthwave is a full-bleed
poster with a fixed scene behind it.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| background | `#1A0B2E` | deep purple ground |
| surface | `#241041` | panels, cartridges |
| text | `#F4E9FF` | warm white-violet (16:1) |
| muted | `#B9A3D6` | metadata (8:1) |
| accent | `#FF2E88` | hot magenta: interaction (5.3:1) |
| accentText | `#1A0B2E` | text on magenta |
| line | `rgba(244,233,255,0.16)` | hairlines |
| radius | `2px` | CRT bezel; cards are clipped, not rounded |
| cyan | `#2DE2E6` | structure, labels, grid |
| sunset | `#FF8A3D` | sun and one status LED |
| void | `#0D0518` | page ground, stage bezel |

The theme accent is still driven by the admin override. The sun and grid keep
their own magenta/cyan so an override changes the interface, not the artwork.

## Type

- **VT323** — display, titles, prices, cartridge names. Pixel but condensed, so
  a long project title can still run at 8rem without breaking the layout.
- **Press Start 2P** — chrome only: nav, labels, kickers, buttons. Small sizes,
  never a paragraph.
- **IBM Plex Mono** — body and metadata at 1.03rem / 1.78, 68ch max.

All three are loaded through `next/font` in the root layout with
`preload: false`: the CSS declarations are global, but the files are only
fetched on pages that actually use the family. The theme module itself stays
free of the font loader so the registry (and its tests) can be imported
anywhere without pulling a build-time transform into the graph.

## Layout

```
RNS//NEON        CASE FILE 2026        ALL WORK
──────────────────────────────────────────────
CASE FILE / 2025                  ╭ CASE DATA ╮
WORKWING                          │ YEAR 2025 │
A focus timer that stays…         │ ACCESS    │
[Web][CSS][JS]                    ╰───────────╯
        ╭──── CRT CABINET ─────────────────╮
        │ LIVE RENDER // WEBGL   ORBIT: ON │
        │        [ 3D scene ]              │
        │ DRAG TO ORBIT · SCROLL TO TILT   │
        ╰──────────────────────────────────╯
TRANSMISSION LOG / prose
CAPTURE LOG / VHS tapes (when the project has a gallery)
MORE CARTRIDGES / three related projects
NEXT STAGE / large link
END OF FILE                        BACK TO TOP
```

On desktop the title and case-data ledger share the row above a full-width
stage. Below 900px they stack, and the stage becomes a 300px 4:3-ish screen.
The 3D stage is the shared `ModelStage`: auto-fit, admin scale/offset and the
lighting preset are untouched. Only the cabinet, scanlines and screen glare are
the theme's.

## Motion

Personality: **Energetic** (kinetic + sharp).

| Property | Choice |
| --- | --- |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` for entrances and lifts |
| Base unit | 120ms taps, 520ms entrances |
| Stagger | 70ms, hero copy → ledger |
| Loops | linear only: grid drift, sun stripes, scanline flicker |
| Exit | 420ms CRT power-off (scaleY collapse + brightness) |
| Restraint | one wow: the boot and power-on. No text flicker, no scroll-jacking |

- **Intro:** five BIOS lines type in with `steps()`; PRESS START appears at
  2.15s. Enter/Space/Escape or a click dismisses; the sequence plays once per
  session and is skipped entirely under reduced motion. Dismissal sets
  `data-booted` on the theme root, which starts the hero choreography, so it is
  never played behind the overlay.
- **Scroll:** one rAF loop advances the floor by idle drift plus a boost from
  scroll velocity (pure math in `motion.ts`, tested). The sun dips slightly over
  the first viewport and the horizon line fades with it, so the bright rule never
  cuts through body copy. A 2px spectrum bar reports scroll progress.
- **Sections:** scroll-driven reveals using `animation-timeline: view()` behind
  `@supports`. Browsers without support simply show the content — no
  opacity-zero trap.

## Surface treatment

- Striped sunset: a gradient circle with a masked repeating stripe layer and a
  slow 9s drift.
- Grid: one 3D-rotated plane with two repeating gradients; the horizontal lines
  advance via `transform`, wrapped at one cell so it never grows unbounded.
  `will-change: transform` and a compositor-friendly animation keep it cheap.
- Scanlines and vignette are gradients, not SVG filters. They sit behind the
  text so body copy stays crisp; the stage gets its own scanline layer.
- Curvature is simulated with a vignette and a 2px bezel. A displacement filter
  would soften every glyph and cost a filter pass on scroll.
- Chromatic aberration is two text shadows on the title and large links; no
  blur, so it remains sharp at 2× DPI.

## Cards

Gallery images become VHS cassettes: black shell, two reels, a tape number, a
scanline window, and a label strip with the project title. Hover ejects the
cassette 6px, lights the cyan edge, and blinks a PLAY tag.

Because a project may have no gallery, the brief's card requirement is also met
by **More cartridges**: three related published projects, rendered as arcade
cartridges with PCB contacts, a clipped corner, and a pressed label. It gives
the page onward navigation without inventing content.

## Paid section

Rendered only when the route passes `access`. The theme adds the cabinet
marquee ("One credit / Unlock the build"), then styles the shared
`ProjectAccess` panel through scoped selectors: pixel heading, VT323 price, and
an inset coin-slot button with a press animation. Error copy is re-coloured to
the sunset orange for contrast on the dark panel. Fixing the shared
`--theme-background` typo to `--theme-bg` was required for that button to have
readable text at all.

## Accessibility and performance

- WCAG AA minimums are asserted by a test for body, muted, accent and
  accent-on-accent pairs.
- Skip link, focus-visible rings and real headings. The boot is a labelled
  dialog, traps Tab between its two controls, supports Escape, and locks scroll
  only while open.
- The custom crosshair is fine-pointer only and is never enabled for reduced
  motion, where the native cursor returns.
- `prefers-reduced-motion` removes the boot, grid motion, sun parallax, star
  twinkle, scanline flicker, sparkle trail, hover transforms and reveals; the
  shared stage already falls back to its poster with a one-click opt-in.
- No canvas for the background and no new dependencies. Two lightweight rAF
  loops (grid, cursor) pause when the tab is hidden or the pointer is still;
  three.js loads only when the stage nears the viewport.
- Project pages remain statically generated. Everything client-side is
  decorative or interaction-only; the case file, tags, gallery and links are in
  the server-rendered HTML.

## Demo

`WorkWing` is the unlisted seed project that carries the theme, so the
Professional landing page is unchanged. No landing layout is provided; the site
home remains Professional.
