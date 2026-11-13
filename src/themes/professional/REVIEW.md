# RNS landing redesign — local review

Verified 13 November 2026 on `landing-redesign`. Review URL:
`http://127.0.0.1:3000`. No push, deployment, database write or paid service.

## Checkpoint

- Part 1: `e7bac43` — supplied brand sources, semantic roles, optimized marks,
  icons and social artwork. This commit already existed when this turn resumed.
- Part 2: `52f879c` — Professional landing layout, database-backed cards and motion.
- Part 3: this commit — production QA, accessible reveals/link names, explicit
  landing OG image metadata and this checkpoint.
- Work only continued on the existing branch. Pre-existing user edits to
  `AGENTS.md` and four untracked alternate logo sources are preserved and excluded
  from the task's commits. Next's automatic agent-rule generation is restored to
  the initial user file after starting the dev server.

Read the repository `AGENTS.md`, phase-1 handoff, repair checkpoint, deployment
checklist and theme design notes. The requested `portfolio/AGENTS.md` resolves to
this repository's `AGENTS.md`; `docs/deployed.md` does not exist here.

## Brand and design

The supplied swatches remain charcoal `#17191C`, yellow `#FFC900`, white
`#FFFFFF` and grey `#F3F4F5`. Light/dark CSS roles are scoped to the landing;
Professional project tokens and all other theme tokens retain their old values.

Yellow text on white is **1.54:1**, and on grey **1.40:1**: both fail AA.
Charcoal text on yellow is **11.41:1**. The design uses that compliant pairing.
`#917300` is a proposed AA yellow text shade for white, not an applied replacement.
All 12 foreground/background role combinations pass at **6.193:1 or higher**;
four border/background combinations pass at **3.059:1 or higher**. Both filled
button text pairs also pass. The original black logo matte is retained.

No brand fonts/notes were supplied. Existing Archivo matches the logo's angular
geometry; Newsreader provides editorial body text. No dependency or global font
change was required. The optimized hero WebP is 27,438 bytes versus the original
1,032,561-byte PNG. PNG and flat contour SVG exports are included; the displayed
raster retains the original shading.

The hero uses a reserved responsive stage marked
`data-logo-slot="future-3d"`; its static image has intrinsic dimensions and a
high-priority request. The header contains one mark at every tested width, with
the small handle hidden on mobile and navigation aligned to the right.
Scroll reveals translate rather than fade text, maintaining contrast throughout
the reveal. Magnetic actions are mouse-only; reduced motion disables transforms,
entrances and page transitions. Native document scrolling remains available.

Honest critique: the mobile hero emphasizes identity and explanation, so projects
begin below the first screen. The lead project has a large preview; remaining
cards use a quieter rhythm. Projects without covers retain typographic previews.
The first visual pass exposed inherited dark-section text; the first Lighthouse
pass exposed reveal opacity and overly narrow accessible link names. All were
corrected and verified again. Shared framework/cursor JavaScript still ships;
removing it would require changing the shared layout outside this scope.

## Verification

Evidence is local and ignored under `screenshots/landing-redesign/`.

| Check | Result | Evidence |
| --- | --- | --- |
| Lint | Pass | `lint.log` |
| Typecheck | Pass, also checked during build | `typecheck.log`, `build.log` |
| All tests | 253 tests, 30 files pass | `tests.log` |
| Production build | Pass, dev server stopped before build | `build.log` |
| Static generation | `○ /`, one-hour revalidation; eight `●` project routes | `build.log` |
| Published database content | Eight rows unchanged; six published featured cards | `project-inventory-before.json`, `project-inventory-after.json` |
| Protected source files | All 163 match baseline hashes | `scope-proof.json` |
| Production browser checks | 18 pass: landing + eight pages at 390/1440px; no broken images, errors, missing anchors or overflow | `browser-after.json` |
| Responsive landing | 360, 390, 768, 1024, 1440, 1920px pass | `landing-responsive.json` |
| Keyboard / navigation | Skip focuses main; visible focus; hash → card → browser Back works; native transition leaves no landing DOM/styles on destination | `interactions.json` |
| Reduced motion / no JavaScript | Readable content and six links remain; motion disabled | `interactions.json` |
| Other pages' links/content | All 16 desktop/mobile comparisons retain links, headings, theme and background | `project-page-comparison.json` |
| Visual regression | All 16 project heroes pixel-identical; 30/32 hero/full captures identical | `pixel-exact.json` |
| Two full-page differences | QuickKit desktop and Loupe mobile baseline captures contained blank lazy gallery images; final captures show loaded images. Same source, URLs, dimensions and surrounding pixels | `pixel-regions.json` |
| Metadata / icons | OG and Twitter image tags present; 1200×630 PNG responds 200; favicon and 180px Apple icon present | `metadata.json`, `social-preview.png` |

The screenshot gallery is `screenshots/landing-redesign/index.html`. Full-page
and hero images are saved for every published page at desktop/mobile widths.
`landing-review.png` combines the final desktop/mobile landing captures;
`theme-proof.png` shows Anime 3D, Synthwave and Cyberpunk. Originals remain available.

## Lighthouse mobile

Lighthouse 13.6.0, local **production** server, Chromium 151, default simulated
mobile throttling. Final run has no accessibility failures or run warnings.

| Metric | Final result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| SEO | 100 |
| LCP | 0.912 seconds |
| CLS | 0 |
| Total JavaScript transferred, 12 requests | 207,051 bytes / 202.2 KiB |
| Total JavaScript decoded | 653,116 bytes / 637.8 KiB |

Reports: `lighthouse-mobile.report.html` and `.json`. The initial 100/96/100
report is retained as `lighthouse-mobile-initial.report.json` to show the fixes.
These are local lab measurements, not deployed field data.

## Every file in the diff against main

| File | Explanation |
| --- | --- |
| `AGENTS.md` | Pre-existing user instructions; preserved, excluded from commits |
| `brand/Color_Swatches.png` | Original supplied palette source, Part 1 |
| `brand/RNS_Avatar_1024.png` | Original supplied icon/avatar source, Part 1 |
| `brand/RNS_Square_Black_4K_Crisp.png` | Original supplied logo source, Part 1 |
| `public/brand/rns-mark.png` | Cropped optimized PNG, used in social artwork |
| `public/brand/rns-mark.svg` | Clean flat contour export and compact header mark |
| `public/brand/rns-mark.webp` | Optimized static hero mark |
| `src/app/(site)/page.tsx` | Landing title/canonical/social metadata and theme color; explicit OG image |
| `src/app/apple-icon.png` | 180px avatar-based Apple touch icon |
| `src/app/favicon.ico` | Avatar-based multiresolution favicon |
| `src/app/icon.svg` | Scalable avatar-based favicon |
| `src/app/opengraph-image.tsx` | Prerendered brand logo/palette social artwork |
| `src/brand/README.md` | Source provenance, typography, palette and contrast decisions |
| `src/brand/tokens.ts` | Immutable source palette and scoped light/dark CSS roles |
| `src/themes/professional/components/hero.tsx` | Branded editorial hero and reserved static/future 3D stage |
| `src/themes/professional/components/landing-motion.tsx` | Scoped progressive view transition and skip-link history handling |
| `src/themes/professional/components/magnetic-link.tsx` | Lightweight mouse magnet, reduced-motion support and Next hash navigation |
| `src/themes/professional/components/work-index.tsx` | All supplied featured database records rendered as accessible animated cards |
| `src/themes/professional/landing-styles.ts` | Landing-only responsive typography, roles, motion, gradients and focus states |
| `src/themes/professional/landing.tsx` | Single header mark, nav, about, skills, contact and footer |
| `src/themes/professional/REVIEW.md` | This verification checkpoint and file-by-file explanation |

## Review decisions / limits

- Review the hero's logo scale, typography and copy. No blocking brand decision
  remains; original yellow was retained. The 3D replacement is for a later run.
- Contact continues to use the existing GitHub profile. An email/contact form
  was not invented.
- Local canonical URLs follow the existing `NEXT_PUBLIC_SITE_URL` environment;
  deployment configuration remains a later task.
- Project pages and links were preserved and checked. Payments, admin edits and
  external repository ownership were not retested or changed. The existing
  checkpoint documents unavailable external repositories; no URL was invented.
- Final state: dev server running for review; wait for the user's feedback.
