/**
 * The two projects added by `scripts/add-projects.ts`.
 *
 * Kept in `src/` so the planning rule is unit-testable without a database.
 * The script owns all I/O; this module is pure.
 */

export type ContentImages = { cover: string; gallery: string[] };

export type ContentEntry = {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  theme: "professional" | "anime" | "synthwave" | "cyberpunk";
  tags: string[];
  liveUrl: string;
  repoUrl: string;
  themeOptions: Record<string, unknown>;
  sortOrder: number;
  description: string;
  /** Used when no --images-file entry exists for this slug. */
  defaultImages: ContentImages;
};

export const LOUPE_DOWNLOAD =
  "https://github.com/34rns/loupe/releases/latest/download/loupe.zip";
export const QUICKKIT_DOWNLOAD =
  "https://github.com/34rns/QuickKit/releases/latest/download/quickkit.zip";

export const projectEntries: ContentEntry[] = [
  {
    slug: "loupe",
    title: "Loupe",
    tagline: "Scroll to zoom any photo or video — right at your cursor.",
    year: 2026,
    theme: "cyberpunk",
    tags: ["Chrome Extension", "Manifest V3", "JavaScript", "UX"],
    liveUrl: LOUPE_DOWNLOAD,
    repoUrl: "https://github.com/34rns/loupe",
    themeOptions: {},
    sortOrder: 5,
    description: `## The problem

A photo lands in your feed at whatever size the site decided. You want to check the focus on a face, read a line of type in a screenshot, or inspect the stitching on a product listing. So you right-click, open the image in a new tab and pinch-zoom — or you don't, and you squint.

## What it does

Loupe removes that step. Point at any photo, video or piece of artwork and scroll up: the spot under your pointer grows in place, centred on that exact pixel. Scroll down to put it back. Hold the left button and drag to pan around the magnified image. Esc or a double-click ends it.

Scroll while moving the mouse and the zoom re-centres wherever you are now, so you can sweep across a large image instead of restarting.

## Who it is for

Photographers checking focus, designers reading type in a screenshot, artists studying linework, buyers inspecting a listing photo, anyone reading a dense diagram on a deadline.

## What counts as media

- \`<img>\` pictures and \`<canvas>\` drawings
- \`<video>\`, including streaming players that feed the element through MediaSource — Instagram Reels, YouTube, X and most modern video sites keep playing inside the zoom
- CSS \`background-image\` art, when you switch that option on

Everything is size-gated at 120×120 on screen, so icons, avatars and card chrome stay out of the way and scrolling over them still scrolls the page.

## Two zoom modes

**Whole page** lets the image grow past its own frame and paints the zoom above the page, so fixed headers, like rails, sticky bars and modals can never cover it. Nothing on the page is rearranged either, so a carousel never leaks its neighbours.

**In frame** clips the zoom to the picture's own box, like a loupe resting on the page — the layout around the image stays exactly where it was.

## Settings

Response, max zoom, the scroll trigger (plain wheel, hold Alt, or hold any key or mouse button you pick), zoom area, smooth motion, pause-video-while-zoomed, background art, and the on-screen readout pill. \`Alt+Shift+Z\` toggles Loupe everywhere.

## Install and updates

Chromium only — Chrome, Brave, Edge, Opera and Vivaldi. It is not in a store, so it installs **load unpacked**: download the zip, extract it somewhere permanent, turn on Developer mode on the extensions page, and pick the folder that contains \`manifest.json\`.

Unpacked extensions cannot update themselves, so moving to a new version is: download the zip again from the same link, replace the folder, hit the reload arrow on the extension card, refresh the tab. The Chrome Web Store is the option for automatic updates later.

## Privacy

No network requests. No analytics, no telemetry, no crash reporting, no update check, no remote assets. The only permission is \`storage\`, which is how it remembers its own settings. Every image it zooms is one the page already loaded.

## Under the hood

Plain JavaScript — no bundler and no build step. Nineteen unit tests cover the zoom maths and the settings contract; forty-one Playwright tests load the extension into a real Chromium and drive the gestures, the panel and the readout. The content script runs in every frame, and target detection ignores anything under the size threshold before the engine is ever touched.`,
    defaultImages: {
      cover: "/projects/loupe/cover.webp",
      gallery: [
        "/projects/loupe/1.webp",
        "/projects/loupe/2.webp",
        "/projects/loupe/3.webp",
        "/projects/loupe/4.webp",
      ],
    },
  },
  {
    slug: "quickkit",
    title: "QuickKit",
    tagline: "Seven motion tools for After Effects and Premiere Pro, in one local panel.",
    year: 2026,
    theme: "professional",
    tags: ["Adobe CEP", "ExtendScript", "JavaScript", "Windows"],
    liveUrl: QUICKKIT_DOWNLOAD,
    repoUrl: "https://github.com/34rns/QuickKit",
    themeOptions: { accent: "#7C5CFF" },
    sortOrder: 6,
    description: `## What it is

One CEP panel that loads in **both** Adobe After Effects and Adobe Premiere Pro. Seven tools, no account, no cloud, no tracking, no admin rights — it installs for your Windows user only.

## Who it is for

Motion designers and video editors who do the same small mechanical jobs dozens of times per session: moving an anchor point, renaming a stack, staggering start times, easing a keyframe. Every one of them is a minute of hand-work in the timeline, repeated across comps.

## The tools

### Anchor

A 3×3 grid. Click a cell and the anchor point moves there **without shifting the layer on screen**, even with scale, rotation or a parent applied. It works on every selected layer at once, text and shape layers included.

**Center of selected layers** puts each selected layer's anchor at the middle of the group's combined bounds — the thing you actually want when a group has to rotate around its own centre.

### Layers

Bulk rename with prefix, suffix, find/replace and optional numbering. Stagger the selection's start times in frames or seconds. Drop a null at the selection centre and parent to it without moving anything. Sequence the selection end-to-end in timeline order. Precompose into a new comp with transforms preserved.

### Easing

Easy ease, strong, overshoot and bounce, applied to the selected keyframes with a live curve preview. Overshoot and bounce add real keyframes after the selected one — and when a keyframe can't take them, the tool names it and says why instead of failing silently.

### Text

Six presets for titles and lower thirds, each with an independent **Animate in** / **Animate out** edge placed at the layer's own in and out points.

Fade, slide and scale pop write normal keyframes on the layer's own opacity, position or scale. Typewriter, character stagger and blur reveal add a **named, editable text animator** and key its Range Selector — so the Source Text is never changed, the words stay editable, and pressing the same preset twice replaces its animator instead of stacking a second one.

### Presets, Silence, Bridge

The remaining slots. A tab that doesn't apply to the app you're in says **Available in Premiere Pro** or **Available in After Effects** rather than disappearing, so the panel looks the same in both.

## One undo group per press

Every tool press is a single undo group. Press Ctrl+Z once in After Effects and the whole action reverses.

## Install in three steps

Download the zip, extract it, double-click \`scripts\\install.bat\`. It copies the panel to \`%APPDATA%\\Adobe\\CEP\\extensions\\QuickKit\` and turns on \`PlayerDebugMode\` for CSXS 9–13 — the flag Adobe requires before it will load an unsigned panel.

No services, no scheduled tasks, no certificates and nothing in \`Program Files\`. Then close both apps **completely** and reopen: panels are only scanned at startup. After that it is \`Window > Extensions > QuickKit\`.

## Updates

No auto-updater — download the new zip, run \`install.bat\` again, restart both apps.

## Privacy

Everything runs on your machine. The panel makes no network requests, has no analytics, no crash reporting, no update check, and no remote fonts or icons: Inter is bundled. A static check fails the build if an \`http://\` or \`https://\` reference appears in a shipped file.

## Under the hood

No bundler and no build step: plain HTML, CSS and JavaScript plus ExtendScript in \`host/quickkit.jsx\`. Every host call sits behind one adapter folder, so a future UXP port replaces that folder rather than the panel — Adobe's own roadmap retires CEP from the flagship apps by the end of the decade, and the structure is built around that.

Static checks and a host-logic test suite run with \`node tests/...\` and have no dependencies at all.`,
    defaultImages: {
      cover: "/projects/quickkit/cover.webp",
      gallery: [
        "/projects/quickkit/1.webp",
        "/projects/quickkit/2.webp",
        "/projects/quickkit/3.webp",
        "/projects/quickkit/4.webp",
      ],
    },
  },
];

/**
 * Decide what the script may write. Anything whose slug already exists is
 * skipped outright — the script has no update or delete path, by design.
 */
export function planContentInsertions<T extends { slug: string }>(
  existing: readonly T[],
  entries: readonly ContentEntry[] = projectEntries,
): { toInsert: ContentEntry[]; skipped: T[] } {
  const known = new Set(existing.map((row) => row.slug));
  const toInsert: ContentEntry[] = [];
  const skipped: T[] = [];

  for (const entry of entries) {
    const match = existing.find((row) => row.slug === entry.slug);
    if (known.has(entry.slug) && match) skipped.push(match);
    else toInsert.push(entry);
  }

  return { toInsert, skipped };
}
