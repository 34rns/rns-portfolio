# RNS landing redesign — local review

Project: D:/CustomCodex/rns-portfolio. Verified 13 November 2026 on
`landing-redesign`. Review URL: http://127.0.0.1:3000.
Local only: no push, deployment, paid service or database write.

## Checkpoint and scope

- Part 1: `e7bac43` — brand sources, roles, optimized marks and social assets.
- Part 2: `52f879c` — first Professional landing redesign.
- Part 3: `38f7c29` — accessibility, metadata and initial production review.
- Follow-up: this commit — reference-inspired interactive gallery and typography,
  one hero logo, mobile export and fresh production verification.

This checkpoint supersedes the earlier header, typography and performance notes.
The latest user instruction removes the duplicate header image and retains the
large static hero mark. The header remains a banner landmark, with right-aligned
navigation. All other project pages and themes retain their existing source.

Read repository AGENTS.md, phase-1 handoff, repair checkpoint, deploy-later
checklist and theme design notes. The requested portfolio/AGENTS.md is the
repository AGENTS.md. docs/deployed.md does not exist in this checkout.

Pre-existing user edits to AGENTS.md and four untracked alternate logo images
are preserved and excluded from commits. Screenshot evidence and QA helpers are
ignored under screenshots/landing-redesign-round-2/.

## Design and references

Reviewed the public [Oversight Supply gallery](https://supply.madebyoversight.com/)
and [sections](https://supply.madebyoversight.com/sections), including Vortex,
Collage and Signal & Soil previews. The original implementation borrows the idea
of spatial project composition and responsive motion, without copying source.

The black opening matches the supplied logo matte. A single static RNS image sits
among four linked previews selected from actual featured database records.
Pointer movement creates bounded parallax; a quiet orbit signal and tile drift
provide ambient motion. Pause/play is explicit, keyboard focus pauses the loops,
and reduced motion retains a static angled composition. Native scrolling,
magnetic buttons and progressive route transitions remain.

Archivo now carries both display and body text: its compact geometry fits the
logo and the stronger reference typography. Newsreader is reserved for the large
about statement. No brand font was supplied; no shared font or dependency changed.
Light reading sections, varied project cards and the charcoal contact section
keep the rest of the page quieter than the opening.

Mobile places the explanation and actions before the project stage. Intrinsic
image dimensions and the marked `data-logo-slot="future-3d"` stage reserve the
future 3D mount. The logo remains a static raster. The 640px mobile WebP is
8,548 bytes, generated locally from the existing optimized mark. It is embedded
in the initial static HTML via a server-only read, avoiding a competing mobile
image request. Desktop retains the 1400px export. No asset data enters the client
JavaScript bundle.

The existing database query, published/featured filters and one-hour static
revalidation are unchanged. All six featured cards remain; the preview stage
receives only public slug/title/cover fields. Empty data keeps the logo and the
existing repository fallback message.

Honest critique: the new opening has more personality and interaction, while the
lower page stays deliberately restrained. The mobile gallery labels are small
secondary captions, and the full project index begins below the opening.
Two projects without cover imagery retain real typographic fallback covers.
Contact still opens the existing GitHub profile; it does not send a message.

## Brand and contrast

Original colors remain charcoal #17191C, yellow #FFC900, white #FFFFFF and grey
#F3F4F5. Semantic light/dark roles are scoped to the landing.

Yellow text on white is **1.54:1**, and on grey **1.40:1**: both fail WCAG AA.
Charcoal text on yellow is **11.41:1** and is the applied pairing.
#917300 remains a proposed compliant yellow text shade, never an applied
replacement. The original 12 foreground role checks pass at 6.193:1 or higher;
four border role checks pass at 3.059:1 or higher. New captions use white or
compliant muted text on black/charcoal; yellow is used for decoration and
charcoal-text buttons. Lighthouse finds no text-contrast failure.

## Fresh production verification

Evidence: screenshots/landing-redesign-round-2/.

| Check | Result | Evidence |
| --- | --- | --- |
| Lint | Pass, zero warnings | lint.log |
| Typecheck | Pass | typecheck.log, build.log |
| All tests | 253 tests in 30 files pass | tests.log |
| Production build | Pass with dev server stopped | dev-stop.log, build.log |
| Static generation | Landing ○ / with 1h revalidation; eight SSG project routes | build.log |
| Production pages | 18 checks at 390/1440px: 200, no errors, broken images, overflow or missing anchors | browser-after.json |
| Responsive landing | 360, 390, 768, 1024, 1440, 1920px pass; one logo; no header image; nav right aligned; six cards/four previews | landing-responsive.json |
| Interaction and keyboard | Pointer/reset, pause/play, 3px focus, focus pauses loops, skip → main, hash → project → Back pass | interactions-final.json |
| Reduced motion/no JS | Static readable logo and six project links remain | interactions-final.json, no-js-mobile.png |
| Empty data | Logo, hero, embedded mobile mark and project fallback remain; no preview tiles | check-empty.tsx, empty-state.log |
| Protected source | All 163 files unchanged from the previous verified pass | scope-proof.json |
| Project content | All 16 comparisons retain headings, links, backgrounds and themes | project-page-comparison.json |
| Pixel comparison | All 16 project heroes exact; 30/32 total images exact; all requested alternate themes exact | pixel-comparison.json |
| Two QuickKit full-page differences | Earlier captures had blank lazy gallery images; final captures show decoded images. Same source/URLs/content/dimensions | quickkit-pixel-regions.json |
| Icons/social metadata | OG, Twitter and canonical tags present; OG, favicon, Apple and SVG icons respond 200 | interactions-final.json |
| Screenshot gallery | Desktop/mobile landing plus every published page; normal and reduced-motion captures | index.html, landing-review.png, theme-proof.png |

One interaction harness run timed out waiting for unrelated network-idle activity.
The corrected harness waits for DOM, font and control readiness and passes.
An initial standalone empty-state fixture needed Next router context; the final
check renders the hero and work index directly. Neither issue required a
project-page or shared configuration edit.

## Lighthouse mobile

Lighthouse 13.6.0 on the local production server, default simulated mobile
throttling. Final report has no run warnings or accessibility failures.

| Metric | Final |
| --- | ---: |
| Performance | 89 |
| Accessibility | 100 |
| SEO | 100 |
| LCP | 3.775 seconds |
| CLS | 0.00000117 |
| JavaScript transferred, 12 requests | 207,820 bytes / 202.9 KiB |
| JavaScript decoded | 655,909 bytes / 640.5 KiB |

The first new design measured 85–86 performance and 4.23s LCP. Responsive
optimization and the embedded mobile mark reduce the image request cost, but
the new large visible logo remains the LCP element. Performance is lower than
the prior layout's 100/0.912s result. These are local lab results, not field data.
The final report is lighthouse-mobile.report.html/.json; intermediate reports
remain for proof. Shared font preloads and framework/cursor JavaScript remain
outside this follow-up's edits. A wider performance pass needs separate scope.

## Every file in git diff against main

| File | Why it changed |
| --- | --- |
| AGENTS.md | Pre-existing user instructions, preserved and excluded from commits |
| brand/Color_Swatches.png | Original supplied palette source |
| brand/RNS_Avatar_1024.png | Original supplied avatar/icon source |
| brand/RNS_Square_Black_4K_Crisp.png | Original supplied logo source |
| public/brand/rns-mark.png | Cropped optimized PNG used in social artwork |
| public/brand/rns-mark.svg | Clean flat contour export for reusable branding |
| public/brand/rns-mark.webp | Optimized high-resolution static desktop mark |
| public/brand/rns-mark-mobile.webp | New small mobile export embedded in the static hero |
| src/app/(site)/page.tsx | Landing title/canonical/social metadata and theme color |
| src/app/apple-icon.png | Avatar-based 180px Apple touch icon |
| src/app/favicon.ico | Avatar-based multiresolution favicon |
| src/app/icon.svg | Scalable avatar-based favicon |
| src/app/opengraph-image.tsx | Prerendered logo/palette social artwork |
| src/brand/README.md | Asset provenance, typography, palette and contrast decisions |
| src/brand/tokens.ts | Original palette and scoped light/dark semantic roles |
| src/themes/professional/components/hero.tsx | Bold sans introduction, one static responsive logo, server-only mobile export |
| src/themes/professional/components/work-stage.tsx | New linked database preview composition, bounded pointer motion, pause and reduced-motion control |
| src/themes/professional/components/landing-motion.tsx | Scoped route transition and skip-link history handling from Part 2/3 |
| src/themes/professional/components/magnetic-link.tsx | Lightweight mouse magnet, reduced motion and Next hash navigation from Part 2 |
| src/themes/professional/components/work-index.tsx | Featured database cards, accessible links and revised section title |
| src/themes/professional/landing-styles.ts | Landing-only layout, type, contrast, stage motion, responsiveness and focus styles |
| src/themes/professional/landing.tsx | Navigation-only banner, dark opening, about, skills, contact and footer copy/layout |
| src/themes/professional/REVIEW.md | This verified project checkpoint and complete file explanation |

## User review decisions

- Review the headline, logo scale, preview motion and section copy.
- Decide whether a later pass should expand scope for further mobile LCP work.
- Contact remains GitHub; provide a preferred contact channel if that should change.
- The 3D logo remains a later task.
- No blocking brand decision remains; all original colors were preserved.

Final handoff: local refinement commit only; production preview stopped; dev
server restarted on 127.0.0.1:3000; initial user AGENTS.md restored exactly.
Wait for the user's review.
