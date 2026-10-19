# Handoff — Phase 3

Phase 3 adds uploads, a shared 3D stage, and the Anime 3D theme. Everything is
verified locally; nothing was deployed or pushed from this pass. Use
[deploy-later.md](./deploy-later.md) for the Blob and migration steps.

## What shipped

**Uploads.** One `StorageAdapter` interface (`src/lib/uploads/storage.ts`) with
two drivers: local disk for development and Vercel Blob in production, chosen by
`BLOB_READ_WRITE_TOKEN`. Images and models share one policy
(`src/lib/uploads/policy.ts`): extension, declared MIME type and file signature
must agree, sizes are capped at 8 MB for images and 40 MB for `.glb`/`.gltf`, and
glTF 2.0 files must embed their buffers and textures.

- Local driver writes to `./uploads` (gitignored) and `/api/uploads/[...path]`
  serves those files with immutable caching and `nosniff`.
- Admin uploads go through `/api/admin/upload` (multipart) or, with Blob,
  browser → Blob directly using a token from `/api/admin/upload/blob`. The token
  route is admin-only and checks the filename, size and first 96 bytes before
  signing; the proxy route re-validates the whole file.
- `UploadField`/`MediaField` in the admin run the same client-side check first,
  show progress, accept drag and drop, and write the resulting URL back into the
  form field. Cover, gallery and model all use it.

**3D stage.** `projects` gains `model_url`, `lighting`, `model_scale` and three
`model_offset_*` columns (migration `0003`, all additive). `ProjectView.model`
carries them to every theme. `src/components/model-stage` renders:

- three.js + React Three Fiber loaded with `next/dynamic`, only once the stage
  nears the viewport;
- a paused frameloop while off-screen, orbit controls, auto-rotate, pointer
  parallax and a scroll-driven camera/FOV tilt;
- the project's `.glb`/`.gltf` centered and auto-fitted to about 70% of the
  stage height (units do not matter), then multiplied by the admin scale and
  offset, or a built-in icosahedron scene when no model is set;
- four lighting presets (`studio`, `dusk`, `neon`, `paper`) shared by the admin
  picker and the viewer;
- a poster fallback for reduced-motion and low-power visitors, with a one-click
  "Load 3D" opt-in, plus an error boundary that falls back to the poster.

**Anime 3D theme.** `src/themes/anime` ships the manga project page: oversized
Archivo display type with outlined last word, speed lines, sakura petals,
halftone, hard-edged panels, a cel-shaded toon variant of the stage with ink
outlines, scoped CSS (no global leak), markdown prose styling and a "next file"
footer. It composes the shared stage rather than owning three.js code. The theme
is registered in `src/themes/registry.ts`; it deliberately has no `Landing`, so
the Professional landing remains the site home. The seed assigns it to RISE
Hunter's Ascent (and resets the other three to Professional), so
`npm run db:seed` is the quickest way to see it live without touching the admin.

## Admin surface

The project form now has a "3D stage" panel: model upload/URL, lighting preset,
scale and X/Y/Z offsets, with the same validation as the server
(`parseProjectForm`). The panel is marked as used by themes that render the
stage; other themes ignore the values. `/admin/preview/[id]` renders the real
theme and stage for drafts.

## Follow-up fixes

**Auto-fit framing.** The first viewer scaled the model and moved its root by
the bounding-box center in the wrong order, then let R3F's `scale` prop on the
primitive overwrite the fit. A 4.9-unit Sketchfab GLB rendered as a speck in a
corner. `src/components/model-stage/fit.ts` now returns a pure `scale` plus a
center offset, the viewer applies the offset to the clone and the scale to a
parent group, and the admin transform lives on a second parent so it cannot
overwrite the fit. Tiny (0.01 unit), huge (1000 unit) and the uploaded GLB all
normalize to the same 2.13-unit height around the origin.

**Hydration mismatch.** The intro's inline script added `intro-skip` to
`<html>` before hydration; React then compared a server element without that
class to a client element with it and reported the mismatch (the font variable
classes made it noisier). The skip is now applied through an adopted
stylesheet, and font custom properties are set inline from stable family
strings instead of next/font's per-compilation variable classes. No React-owned
attributes are touched before hydration.

## Verification

- `npm run typecheck`, `npm run lint`, `npm test` — green; 99 tests including
  20 upload cases, six auto-fit cases and four new model-field validation cases.
  They cover signature sniffing, truncated GLBs, external glTF resources, size
  limits, token pre-checks, path traversal, a local write/read round-trip, and
  tiny/huge/centered model framing.
- The Anime 3D project page was exercised at 1440 px and 390 px: no horizontal
  overflow, correct 16/11 stage at both sizes, three.js chunks load only with
  the stage, and the built-in scene and the uploaded GLB reach the ready state.
- A clean production build succeeded, and `next start` served `/` and the Anime
  3D project with no hydration warnings; the uploaded 3.8 MB GLB was fetched and
  framed at roughly two-thirds of the stage height.
- Every checked GLB (0.01 units, 1000 units, and the uploaded 4.9-unit model)
  normalized to the same 2.13-unit height at the origin.
- The upload form was not exercised end to end in a browser because the local
  checkout has no admin session in this pass; the policy and local storage
  paths are covered by tests.

## Known limits

- Blob storage is implemented but not tested against a real Blob store.
- A paid project's model is public like its cover; only the live URL and
  delivery note are gated.
- Local uploads are per-process and do not survive a Vercel deploy.
- No model optimisation pipeline: authors should export a reasonably sized GLB
  (Draco/KTX2 textures are not preprocessed).
