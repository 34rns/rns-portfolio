# RNS hero 3D — local review checkpoint

Project: D:/CustomCodex/rns-portfolio. Branch: landing-redesign.
Verified 13 November 2026. Review: http://127.0.0.1:3000.
Local only: no push, deployment, merge, paid service or database write.

## Scope and design

This run changes only the landing hero and new logo-related files. The existing
Professional landing, project pages and other themes remain untouched. Run 1
and subsequent redesign context remain in ../../REVIEW.md.

The direction is playful creative studio: a personal introduction, tangible
satin-white/yellow logo and an invitation to interact. The header retains its
existing single-mark arrangement: one hero RNS, no duplicate header image;
right-aligned navigation and a small desktop note hidden on mobile. Default
copy now speaks about the actual editing tools, Bengali keyboard and browser
experiments. Supplied LandingContent overrides remain honored.

Existing Archivo typography and original #FFFFFF/#FFC900 materials fit the
mark. No brand tokens changed. Lighting changes the perceived surface color;
it does not replace the brand colors.

## Asset route and geometry

The Run 1 SVG contains black overlays cutting the yellow swoosh, which would
extrude incorrectly as independent shapes. VTracer 0.6.15 traced separate
white/yellow masks from public/brand/rns-mark.png, the existing lossless crop
of the supplied logo. This also avoids a stray border in the full source PNG.
No hand-drawn approximation or depth-card fallback was needed.

rns-logo-3d.svg is 55,724 bytes: three white and four yellow paths.
SVGLoader.createShapes preserves the actual hole; normalized contours retain
ring order, then are simplified and extruded with bevels. Runtime evidence:
7 parts, 1 hole, 152,136 bytes of geometry (under the 300,000-byte guard).
No remote environment or large texture is used. A local RoomEnvironment PMREM,
rim light, light sweep, subtle iridescence, soft cached contact shadow and a
64x64 procedural feathered floor supply the finish. Geometry, textures, PMREM
and fetch requests have cleanup paths.

## Motion and loading

- Instant SSR static picture in the reserved hero figure; no logo layout shift.
- Heavy r3f/drei scene is dynamically loaded. Desktop waits for visibility and
  idle time; coarse-pointer phones retain the poster until Give it a spin.
- A short staggered assembly/light sweep settles into float and pointer tilt.
  Further spin actions rotate the mark; Pause/Play provides keyboard controls.
- Session storage skips assembly on repeat visits. Scroll rotates, shrinks and
  fades the logo behind the hero rather than touching the header.
- DPR is capped at 1.5. Rendering pauses when offscreen, hidden or manually
  paused. Reduced motion, <=4 logical cores, <4GB reported RAM, data saver,
  missing WebGL2, scene failure and context loss retain the poster.
- A custom logo or disabled content motion stays static.

Mobile opt-in is a deliberate power/performance tradeoff. Devices without
memory/core information use assumed eligibility defaults of 8; users can
still pause motion. The browser reports capabilities, not battery health.

## Verification and proof

Evidence is ignored under screenshots/landing-logo-3d/.

| Check | Result / evidence |
| --- | --- |
| Lint | Pass, zero warnings; lint-final.log |
| Typecheck | Pass; typecheck-final.log |
| All tests | 260 pass in 31 files; tests-all-repeat.log |
| Test command | npm test -- --config src/themes/professional/components/brand-logo/vitest.config.mts |
| Production build | Pass after stopping servers; build-final.log, final-build-server-proof.json |
| Static landing | 200, cache HIT, prerender 1; production-http.json; build lists ○ / with 1h revalidation |
| Projects | All 8 SSG; 18 landing/project checks pass at 390/1440; browser-after.json |
| Protected files | All 163 hashes unchanged; scope-proof.json |
| Project regressions | 16 content and 32 original PNG comparisons exact; scope-proof.json |
| Responsive | 360,390,768,1024,1440,1920: no overflow/clipped heading, one mark, nav aligned, CTA above fold; responsive.json |
| Motion | Assembly/idle, spin, pointer/reset, pause, offscreen/resume, repeat skip; interactions.json |
| Hidden tab | Visibility handler simulated with document.hidden + visibilitychange; frame count held then resumed; interactions.json |
| Fallbacks | Reduced, low-power, saver, no-WebGL, no JS, missing SVG; fallbacks.json |
| Context loss | Actual WEBGL_lose_context restores poster; interactions.json |
| Links/accessibility | Skip focuses main; work -> case study -> Back; keyboard focus remains; metadata-navigation.json |
| Branding | Favicon, SVG icon, Apple icon and OG return 200; metadata-navigation.json |
| Sharp captures | Original unresized PNGs at 2x, fonts ready/images decoded; screenshot-manifest.json; index.html |

The first all-tests run had one existing order-page import timeout while the
browser workload was active. With browsers closed, the unchanged test passed
and the complete 260-test suite passed in 2.28s. No test was skipped or relaxed.

Production captures cover desktop/mobile first paint, paused mid-intro, idle,
scroll and reduced/static fallback, plus three protected themes at both widths.
The desktop first-paint SVG request was held for the poster capture, then
released normally. Saved screenshots are native 2x PNGs; the canvas itself
retains the production DPR cap. Actual native background-tab switching was
not exercised; the visibility handler and frame pause were simulated explicitly.

## Lighthouse and JavaScript

Lighthouse 13.6.0, local production, default simulated mobile throttling.
All reports are retained; none had warnings or accessibility failures.

| Run | Performance | Accessibility | SEO | LCP | TBT |
| --- | ---: | ---: | ---: | ---: | ---: |
| First | 95 | 100 | 100 | 1.036s | 254ms |
| Repeat | 87 | 100 | 100 | 4.060s simulated | 38ms |
| Final fresh build | 98 | 100 | 100 | 0.912s | 179ms |

Run 1 was 100/100/100, LCP 0.912s; latest prior review 99/100/100,
LCP 0.913s. The final run is within a two-point margin with unchanged LCP,
but the score range 87-98 (median 95) prevents a repeatability guarantee.
The 87 run observed an actual 159ms LCP while the model estimated 4.06s;
the same hero paragraph was the LCP element in each run. Shared font loading,
local scheduling and the simulation graph contribute variability; no code
was changed between these audits. Field performance remains unmeasured.

Final report: lighthouse-mobile-final.report.html/.json. All values:
lighthouse-all-summary.json. Initial JS transfer/decoded values are in that
file (about 210KB/663KB; about +1.4% transfer against Run 1).
A separate uncached Resource Timing sample measured 206,385 transferred /
657,505 decoded bytes initially, rising to 490,664 /1,688,864 after phone
opt-in. The two optional scene chunks cost 284,279 transfer /1,031,359 decoded
bytes. SVG and procedural GPU geometry are separate from JS totals.

## Honest critique and review choices

The first scene's hard floor was removed in favor of a feathered base. Satin
faces and bright edges make the logo tangible without a harsh chrome glare.
The opening now directly says who made the work and what it does. The geometry
is traced from pixels, so a professionally authored source SVG could improve
small contours further. Ambient motion is restrained; it does not turn the
whole page into a motion reel. The inherited showcase and lower sections
retain their previous review design because this scope is hero-only.

Review the new copy, logo size/material and motion. Confirm whether capable
phones should keep the current tap-to-activate policy. Full landing settings
in admin still need a separately authorized scope after selection; existing
project admin continues to control project content/order. No schema/settings
API or persistence changed. Metadata retains the existing localhost origin,
to be configured during a future authorized publishing pass.

## Files changed this run

All new component files below are in src/themes/professional/components/brand-logo/.

| File | Why |
| --- | --- |
| ../hero.tsx | New personal copy and reserved static/3D composition; content overrides and database showcase kept |
| logo-stage.tsx | Lazy admission, static poster, controls, visibility, pointer/scroll and error fallback |
| logo-scene.tsx | Real r3f/drei scene, materials, environment, motion, soft floor and resource cleanup |
| logo-geometry.ts | SVGLoader shapes, hole-preserving simplification, beveled extrusion and size guard |
| logo-policy.ts | Small pure reduced-motion/device capability policy |
| hero-styles.ts | Hero-only responsive layout and accessible logo controls |
| logo-geometry.test.ts | Meaningful hole/normals/budget and capability tests |
| vitest.config.mts | Runs all existing tests plus new logo tests without modifying root config |
| README.md | This checkpoint, review decisions and verified evidence |
| public/brand/rns-logo-3d.svg | New color-separated vector asset suitable for true extrusion |

## Every file against main, including prior rounds

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
| src/themes/professional/components/hero.tsx | Personal introduction, one logo slot with lazy 3D/poster, configured copy and unchanged database showcase |
| src/themes/professional/components/work-stage.tsx | Large database showcase, keyboard tabs, arrows, side previews, tilt and pause/reduced motion |
| src/themes/professional/components/landing-motion.tsx | Scoped route transition/skip history from Part 2/3 |
| src/themes/professional/components/magnetic-link.tsx | Lightweight magnet, reduced motion and hash navigation from Part 2 |
| src/themes/professional/components/work-index.tsx | All featured cards, configured heading, alternating layout, matching image sizes |
| src/themes/professional/landing-styles.ts | Landing-only typography, contrast, showcase animation, spacing and focus |
| src/themes/professional/landing.tsx | Configured sections, navigation banner, yellow about and serif contact |
| src/themes/professional/REVIEW.md | Verified checkpoint, admin requirement, metrics and every file explanation |
| public/brand/rns-logo-3d.svg | True extrusion asset traced from the supplied logo crop |
| src/themes/professional/components/brand-logo/logo-stage.tsx | Static-first lazy loader, interaction and fallback policies |
| src/themes/professional/components/brand-logo/logo-scene.tsx | Real 3D rendering, materials, lights, motion and cleanup |
| src/themes/professional/components/brand-logo/logo-geometry.ts | Small beveled geometry with correct holes |
| src/themes/professional/components/brand-logo/logo-policy.ts | Device and motion admission rules |
| src/themes/professional/components/brand-logo/hero-styles.ts | Hero-only responsive 3D layout |
| src/themes/professional/components/brand-logo/logo-geometry.test.ts | Geometry and fallback checks |
| src/themes/professional/components/brand-logo/vitest.config.mts | Runnable complete test suite including logo checks |
| src/themes/professional/components/brand-logo/README.md | Current 3D checkpoint and evidence |

AGENTS.md is a pre-existing user edit, restored exactly and excluded from this
commit. Four alternate user logo PNGs remain untracked and untouched. Evidence
is gitignored. No dependencies were added. Finish with local commit, dev3000
running, git diff --stat main saved, then wait for user review.

## Resumed verification — 13 November 2026

Recovered the interrupted Portfolio-2 session. Its last unresolved report was
that the 3D logo and project controls did not work on port 3000. Port 3101 was
an unwanted screenshot gallery; it remains closed. The remodel is the actual
Professional landing at http://127.0.0.1:3000/, committed in 8a660b4 and the
preceding landing-redesign commits.

Next.js 16.4.2 blocks development requests from hostnames other than localhost
and the explicitly initialized server hostname. The previous default-host
server blocked 127.0.0.1 requests. The hostname fix had already taken effect
when this session resumed. After stopping that server for the production
build, restarted with `next dev --hostname 127.0.0.1 --port 3000`. Use
`npm run dev -- --hostname 127.0.0.1 --port 3000` for subsequent restarts.
No application source or next.config.ts change was needed.

Fresh verification: lint and typecheck passed; all 260 tests in 31 files
passed using the logo Vitest configuration with two workers; production build
passed and still lists the landing as static with one-hour revalidation.
Browser checks on the restarted dev server confirmed the Shobdo project tab
updates the selected project, the real seven-part/one-hole 152,136-byte logo
renders, and spin/pause/play respond. At 360, 390, 1440 and 1920px there was no
horizontal overflow; the width-limit checks also confirmed one logo stage
and an unclipped heading. No browser errors were captured. Three.js reports
existing Clock/createShapes deprecation warnings; they do not block rendering.
Temporary in-app viewport overrides were reset and the page reloaded before
leaving the logo actively rendering in the normal preview.

Evidence: screenshots/resume-2026-11-13/ contains desktop/mobile JPEGs,
DOM state, responsive checks, dev process/log records and diff-stat-main.txt.
These files are ignored. This resumption changes only this checkpoint.
Application source, protected themes/pages, user edits and alternate logos
remain as recovered. No push, deployment, paid service or database write.

Next: review the actual remodel and 3D treatment on port 3000. Admin landing
customization is still separately scoped after design selection.
