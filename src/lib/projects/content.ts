/**
 * The projects added by `scripts/add-projects.ts`.
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
  theme:
    | "professional"
    | "anime"
    | "synthwave"
    | "cyberpunk"
    | "keycap"
    | "folderdock";
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
export const FOLDERDOCK_DOWNLOAD =
  "https://github.com/34rns/FolderDock/releases/download/v1.0.2/FolderDock-1.0.2-preview.zip";

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
  {
    slug: "shobdo-keyboard",
    title: "Shobdo Keyboard",
    tagline:
      "Bangla, Banglish and English on Android — offline, private and designed key by key.",
    year: 2026,
    theme: "keycap",
    tags: ["Android", "Kotlin", "Jetpack Compose", "IME", "Bengali", "Open source"],
    liveUrl:
      "https://github.com/34rns/shobdo-keyboard/releases/latest/download/Shobdo-Keyboard-v0.3.0.apk",
    repoUrl: "https://github.com/34rns/shobdo-keyboard",
    themeOptions: {},
    sortOrder: 1,
    description: `## Why another keyboard

Most Android keyboards treat Bangla as an afterthought: a transliteration mode bolted onto a QWERTY grid, or a desktop-era layout with no composing rules behind it. The good ones tend to be online, and the ones that are offline tend to look like utilities. Shobdo started from the opposite end — a keyboard built around the way Bangla is actually typed, then designed like a product rather than a settings screen.

It is a real Android input method, not a web wrapper and not a demo. Kotlin and Jetpack Compose, a canvas keyboard core, six layout pages and a settings app that ships in the same APK. API 26 and up, target 35, MIT licensed.

## How the three modes work

**Bangla** is a fixed Probhat-style layout for people who already know the letters. The positions follow the published chart, so muscle memory transfers. Kar signs attach to the base letter, hasanta joins conjuncts, and one press of backspace removes a base letter together with its kar instead of leaving a stray mark behind.

**Banglish** is the phonetic path for people who think in Roman letters. You type \`ami\` and the suggestion bar offers আমি; press space to accept, or tap the Roman chip to keep the English. The scheme follows the widely used Avro conventions — \`kh\` is খ, \`sh\` is শ, \`Sh\` is ষ, \`Ng\` is ঙ, \`T\` and \`Th\` are ট and ঠ, and \`pr\` becomes the conjunct প্র.

**English** is a full QWERTY deck one tap away, with a number row, long-press accents (hold a vowel for é è ê ë), two symbol pages and a shift key that shows whether it is in single-capital or caps-lock state. The globe key cycles only the languages you enabled; at least one always stays on.

## Ranking, not guessing

v0.3.0 ships a Bangla frequency list of 83,433 words inside the APK. Every possible reading of the Roman buffer is scored against it and the common word comes first, which is the difference between a transliteration gimmick and something you can type a message with. The suggestion strip expands into a full candidate panel, and the keyboard can remember the words you pick so the next sentence is faster.

Nothing about that ranking leaves the device. The list is a bundled asset, read locally.

## A theme collection, not a palette

The theme collection was rebuilt for 0.3.0 rather than recoloured: Studio Light, Studio Dark, Onyx, Frost, Aurora, Sakura, Tokyo Night, Pixel Arcade, Cassette, Obsidian Gold, Cloudline, Evergreen and Dynamic, which follows Material You on Android 12 and newer. The picker shows a live keyboard preview of each one, so you are choosing a keyboard rather than a swatch.

Every pair is checked against a 4.5:1 contrast floor on the composited key colour — not just the theme's nominal background. Themes are plain JSON with key depth, key shape, a font role, a secondary accent and a pressed-key scale; schema 1 files still load, and you can duplicate, create, export and import your own.

## The small things

- Hold backspace to delete continuously after a short delay.
- Two symbol pages, plus a Bangla digits page with ৳ and Bengali punctuation.
- A settings app translated into Bangla, with every control carrying a content description and at least a 48dp touch target.
- Key height, spacing, corner radius, font size, bold, borders, number row, haptic strength and one-handed mode are all adjustable.
- Dark and light follow the system.

## Private by construction

Shobdo has no \`INTERNET\` permission. That is not a promise in a policy document; the operating system will not let the app open a connection. There is no analytics SDK, no ad library, no crash reporter and no remote font. The only permission in the release manifest is \`VIBRATE\`.

## Under the hood

The release is R8-shrunk, resource-shrunk and signed, and lands at 1.9 MB. Eighty unit tests cover the Banglish rules, the layout data, the theme schema and contrast, and the composing logic; lint reports zero errors. Four Python validators check layouts, themes, strings and the phonetic fixture without needing an Android build, and a PowerShell guard runs the same checks from both git hooks.

Screenshots are real captures: the debug build running on Android 15, taken with \`adb exec-out screencap\` while Shobdo was the active input method, in a debug-only demo chat that never ships in a release APK.

## Install

Download the APK from the latest release, open it on the phone, allow installing from that source, then follow the three setup steps — enable the keyboard, choose it, pick your languages and theme. Requires Android 8.0 (API 26) or newer.

## Still on the bench

Automatic reph is not implemented yet, so \`kormo\` produces করমো rather than কর্ম. The Probhat uppercase alternates still want a native speaker's review, and a Jatiya layout plus a phonetic Bangla layout are the next decks on the list.`,
    defaultImages: {
      cover: "/projects/shobdo/cover.png",
      gallery: [
        "/projects/shobdo/00-onboarding.png",
        "/projects/shobdo/01-english.png",
        "/projects/shobdo/02-bangla.png",
        "/projects/shobdo/03-banglish.png",
        "/projects/shobdo/04-candidates.png",
        "/projects/shobdo/05-themes.png",
        "/projects/shobdo/composite-themes.png",
        "/projects/shobdo/composite-settings.png",
      ],
    },
  },
  {
    slug: "folderdock",
    title: "FolderDock",
    tagline: "Your asset folders, inside Premiere Pro and After Effects.",
    year: 2026,
    theme: "folderdock",
    tags: ["Adobe CEP", "JavaScript", "ExtendScript", "Local-first", "Open source"],
    liveUrl: FOLDERDOCK_DOWNLOAD,
    repoUrl: "https://github.com/34rns/FolderDock",
    themeOptions: { accent: "#FF8A3D" },
    sortOrder: 1,
    description: `## Keep the library beside the timeline

FolderDock is a free, open-source CEP panel for editors and motion designers whose assets live across ordinary folders. Instead of leaving Premiere Pro or After Effects to search in Explorer, it keeps those folders available inside the editing workspace so you can browse, inspect and place media with less context switching.

## A folder-first workflow

Add a parent folder, move through its tree, then search by filename or tag. Type filters, sorting, favorites and recent imports help narrow a large library without changing the files on disk. Images and videos can be previewed before placement, while audio stays silent until you deliberately press play and provides a full-file waveform when supported.

Placement remains host-aware: media goes to an active Premiere sequence or After Effects composition, with manual fallbacks where Adobe's CEP APIs do not expose a safe automatic path. Optional local FFmpeg support can create extra previews and waveforms, but FolderDock never downloads it and never sends media to a service.

## Free release

Version 1.0.2 is a free, unsigned CEP release. It passed local regression, browser interaction and large-library component checks. The manifest's host range is registration data rather than a tested compatibility matrix, so compatibility should be checked in your Adobe setup before production work. CEP support is required, Premiere preset imports and some track setup remain manual, and native panel-to-timeline file dragging is not available.

FolderDock is built with plain JavaScript, CSS and ExtendScript. It stores library preferences locally, keeps generated previews in its local cache, makes no network requests and is independent from Adobe.`,
    defaultImages: {
      cover: "/projects/folderdock/library.webp",
      gallery: [
        "/projects/folderdock/library.webp",
        "/projects/folderdock/audio.webp",
      ],
    },
  },
];

/** Limit a one-directional content insert to one known slug when requested. */
export function selectContentEntries(
  slug: string | null | undefined,
  entries: readonly ContentEntry[] = projectEntries,
): readonly ContentEntry[] {
  if (!slug) return entries;
  const selected = entries.filter((entry) => entry.slug === slug);
  if (selected.length === 0) throw new Error(`Unknown project slug "${slug}".`);
  return selected;
}

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
