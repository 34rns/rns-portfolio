# RNS landing redesign — local review

Project: D:/CustomCodex/rns-portfolio. Verified 13 November 2026 on
`landing-redesign`. Review URL: http://127.0.0.1:3000.
Local only: no push, deployment, paid service or database write.

## Checkpoint and scope

- Part 1: `e7bac43` — brand sources, tokens, optimized marks and social assets.
- Part 2: `52f879c` — first Professional landing redesign.
- Part 3: `38f7c29` — accessibility, metadata and initial production review.
- Follow-up: `e21b1f6` — first reference-inspired orbit gallery.
- Current refinement: larger selectable showcase, compact editorial hero,
  yellow about section, alternating project layouts and future content seam.

This checkpoint supersedes the round-2 design and performance notes. The latest
user instruction removes the duplicate header image and retains one static hero
mark. The banner has right-aligned navigation; its small note hides on mobile.
All project pages and other themes retain their existing source.

Read repository AGENTS.md, phase-1 handoff, repair checkpoint, deploy-later
checklist and theme design notes. The requested portfolio/AGENTS.md is the
repository AGENTS.md. docs/deployed.md does not exist in this checkout.
Historical deployment authorization does not apply to this local-only redesign.

Pre-existing user edits to AGENTS.md and four untracked alternate logo images
are preserved and excluded from commits. Evidence and helpers are ignored under
screenshots/landing-redesign-round-3/.

## Design and critique

References: [Oversight Supply](https://supply.madebyoversight.com/) and
[sections](https://supply.madebyoversight.com/sections), including public Vortex,
Collage and Signal & Soil previews. Spatial composition and responsive motion
informed the design; no source was copied or assets purchased.

The opening pairs “Built to work. Made to feel.” with one RNS mark. A large
project preview, desktop side previews and six project tabs replace the earlier
small orbit tiles. Tabs, previous/next buttons and side previews update the
caption, image and case-study destination. All six projects come from the
existing database query; project data is not hardcoded.

Pointer tilt is bounded to ±3°/±5°. A yellow signal follows a curved ribbon;
pause/play, keyboard focus and reduced motion hold ambient animation still.
Native scrolling, magnetic actions and existing route transitions remain.
Yellow about, alternating wide/paired project cards, four-column skills and a
Newsreader contact statement provide a different rhythm below the showcase.

Archivo carries display and body copy: its compact geometry fits the mark.
Newsreader supplies a contrasting reading voice for about/contact. No brand
font was provided; no shared font or dependency changed.

The static logo has intrinsic dimensions and a marked
`data-logo-slot="future-3d"` mount. Desktop uses the existing 1400px WebP; mobile
uses the existing 640px export embedded in static HTML. A custom logo omits
that embedded source so an older logo cannot override it. No 3D logo was added.

Critique and fixes: the earlier miniatures did not give the work enough
presence. The new preview is substantially larger. An inherited tablet row gap
made the mobile hero too tall; removing it brings the preview into the initial
viewport. Tabs sit above the preview, side previews hide on mobile, fallback
titles were reduced, the contact curve moved above text and both wide cards
request suitable image widths. Two projects still lack cover artwork and use
real title/year/tag fallbacks. Contact still opens the existing GitHub profile.

## Admin customization requirement

The selected final remodel must be customizable through admin. This requirement
is remembered; the current admin does not yet edit the entire landing.

`landing-content.ts` centralizes serializable local defaults for logo, header,
hero, showcase labels, about, work heading, skills, capabilities, contact and
motion enable/intensity. `ProfessionalLanding` accepts these as a prop.
Customized copy/contact/logo, disabled motion, reordered projects, empty data
and one project were verified.

Existing project admin controls still own project content, order and placement.
The landing stays statically generated with one-hour revalidation. No settings
UI, persistence, schema, API, migration or database save was added. After design
selection, explicitly expand scope for authenticated settings, validation,
preview/save and revalidation. Choose editable colors, fonts, layout and content
controls in that pass.

## Brand and contrast

Original palette: charcoal #17191C, yellow #FFC900, white #FFFFFF and grey
#F3F4F5. Scoped light/dark roles remain unchanged.
Yellow on white is **1.54:1** and on grey **1.40:1**: both fail WCAG AA.
Charcoal on yellow is **11.41:1**, the applied pairing. #917300 remains a proposed
compliant yellow text shade, never an applied brand replacement. Original 12
foreground checks pass at 6.193:1 or higher; four border checks pass at 3.059:1
or higher. The yellow about section uses charcoal primary/secondary text.
Lighthouse reports no contrast failures. No brand colors changed silently.

## Production verification

Evidence: screenshots/landing-redesign-round-3/.

| Check | Result | Evidence |
| --- | --- | --- |
| Lint | Pass, zero warnings | lint.log |
| Typecheck | Pass | typecheck.log, build.log |
| All tests | 253 tests in 30 files pass | tests.log |
| Production build | Pass with dev stopped | dev-stop.log, build.log |
| Static generation | Landing ○ / with 1h revalidation; eight SSG project routes | build.log |
| Production pages | 18 checks at 390/1440px: 200; no page errors, broken images, overflow or missing anchors | browser-after.json |
| Responsive | 360,390,768,1024,1440,1920px; one logo; no header image; nav right aligned; six cards/tabs; no clipped headings | landing-responsive.json |
| Selection | All tabs update caption/destination; arrows wrap; desktop side previews select | interactions-final.json |
| Keyboard/motion | Home/End/arrow focus, 3px focus, pointer/reset, pause/play and focus pause | interactions-final.json |
| Navigation | Skip → main, hash → case study → browser Back | interactions-final.json |
| Reduced/no JS | Static logo and all six project links remain | interactions-final.json, no-js-mobile.png |
| Content seam | Copy/contact/logo/motion overrides; order, empty/single project, one logo | config-check.log |
| Protected source | All 163 baseline files unchanged | scope-proof.json |
| Project content | All 16 comparisons retain headings, links, backgrounds and themes | project-page-comparison.json |
| Pixel regression | All 32 project hero/full-page PNGs exact against round 2 | pixel-comparison.json |
| Metadata/assets | OG/Twitter/canonical present; four icon/social routes return 200 | interactions-final.json |
| Sharp screenshots | Original PNGs at 2× density, fonts ready, images decoded; no saved resizing | screenshot-manifest.json |

Visual inspection covered opening, about, all project cards, skills/contact,
360/390px mobile, desktop and three alternate themes. Landing review captures
pause motion and disable screenshot animations. Only during capture, the
scroll-progress line is hidden to avoid full-page animation capture artifacts.
Other themes use their existing reduced-motion static preview, awaited before
final capture. Screenshot styling is not saved in application source.

Desktop opening: **2880×2836**; full page: **2880×11732**.
Mobile opening: **780×2342**; full page: **780×13110**.
360px full page: **720×13208**. Separate viewport and original desktop/mobile
Anime, Synthwave and Cyberpunk PNGs are available. Inspect originals at 100%;
the app may fit large images to chat width. Gallery: index.html.

## Lighthouse mobile

Lighthouse 13.6.0 on the isolated local production server, default simulated
mobile throttling; no run warnings or accessibility failures.

| Metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| SEO | 100 |
| LCP | 0.913 seconds |
| CLS | 0.000649 |
| JavaScript transferred | 208,374 bytes / 203.5 KiB |
| JavaScript decoded | 658,345 bytes / 642.9 KiB |

The introductory paragraph is the LCP element in this run. Round 2 measured
89 performance / 3.775s LCP. These are local lab measurements; production field
performance remains unmeasured. Report: lighthouse-mobile.report.html/.json.
Metadata origin remains the existing local development configuration, to be set
correctly before a future authorized deployment.

## Every file in git diff against main

| File | Why it changed |
| --- | --- |
| AGENTS.md | Pre-existing user instructions, preserved and excluded from commits |
| brand/Color_Swatches.png | Original supplied palette source from Part 1 |
| brand/RNS_Avatar_1024.png | Original supplied avatar/icon source from Part 1 |
| brand/RNS_Square_Black_4K_Crisp.png | Original supplied logo source from Part 1 |
| public/brand/rns-mark.png | Cropped optimized PNG used in social artwork |
| public/brand/rns-mark.svg | Clean flat contour export for reusable branding |
| public/brand/rns-mark.webp | Optimized high-resolution static desktop mark |
| public/brand/rns-mark-mobile.webp | Small mobile export embedded in static HTML |
| src/app/(site)/page.tsx | Landing title/canonical/social metadata and theme color |
| src/app/apple-icon.png | Avatar-based 180px Apple touch icon |
| src/app/favicon.ico | Avatar-based multiresolution favicon |
| src/app/icon.svg | Scalable avatar-based favicon |
| src/app/opengraph-image.tsx | Prerendered logo/palette social artwork |
| src/brand/README.md | Asset provenance, typography, palette and contrast decisions |
| src/brand/tokens.ts | Original palette and scoped light/dark roles |
| src/themes/professional/landing-content.ts | New typed local content seam for future admin integration |
| src/themes/professional/components/hero.tsx | Compact introduction, one logo/reserved 3D slot, configured copy, public project fields |
| src/themes/professional/components/work-stage.tsx | Large database showcase, keyboard tabs, arrows, side previews, tilt and pause/reduced motion |
| src/themes/professional/components/landing-motion.tsx | Scoped route transition/skip history from Part 2/3 |
| src/themes/professional/components/magnetic-link.tsx | Lightweight magnet, reduced motion and hash navigation from Part 2 |
| src/themes/professional/components/work-index.tsx | All featured cards, configured heading, alternating layout, matching image sizes |
| src/themes/professional/landing-styles.ts | Landing-only typography, contrast, showcase animation, spacing and focus |
| src/themes/professional/landing.tsx | Configured sections, navigation banner, yellow about and serif contact |
| src/themes/professional/REVIEW.md | Verified checkpoint, admin requirement, metrics and every file explanation |

## Review and next steps

- Select the remodel and review copy, logo scale and gallery behavior.
- Provide a preferred contact channel if GitHub should change.
- After selection, authorize the separate admin-settings scope and choose which
  content/design controls should be editable.
- The 3D logo remains a later task.
- Optional: provide RISE/OfficeChaos cover artwork through project admin.

Final handoff: local refinement commit only; production stopped; dev restarted
on 127.0.0.1:3000; original user AGENTS.md restored exactly; diff --stat main
saved to evidence. Wait for user review.
