# Shobdo release page — 9 November 2026

Project: D:/FreeCodeChats/portfolio. User requested GitHub publication of Shobdo
and then updating its portfolio page if release information was stale.

- GitHub v0.4.0 is published with the signed APK and SHA-256 file; Build run
  42578830807 succeeded at keyboard commit 6203265. APK size: 3,988,785 bytes.
- The existing browser badge already fetched the latest tag. Its static link
  still named v0.3.0's APK under `/releases/latest/download/`, which breaks when
  a newer release uses a different filename. Shobdo now uses `/releases/latest`
  with the label "Latest release". The badge keeps updating; visitors select the
  APK on GitHub. No webhook, new dependency or keyboard network permission.
- Updated Shobdo seed content, Keycap copy, examples, proof figures and licensing
  for v0.4.0. Accuracy figures explicitly describe the fixed regression fixture;
  APK size and test figures explicitly refer to the v0.4.0 snapshot.
- Updated only the shared production database's Shobdo description, live_url
  and updated_at. All other row fields preserved and checked. No other project
  rows were written. Local before/after backups: screenshots/releases.
- Lint, typecheck, 253 tests in 30 files with two workers and production build
  passed. Local production browser checks at 360, 390, 768 and 1440px passed:
  Keycap theme, images, anchors, no horizontal page overflow or runtime errors.
  Inspected mobile and desktop screenshots. Simulated a future v0.5.0 badge and
  an unavailable GitHub API: the stable latest-release link remained usable.
- Screenshots and timestamped evidence are ignored under screenshots/releases.
  Production verification must follow the Git-connected Vercel deployment;
  do not create a duplicate CLI deployment while Git deployment is progressing.

The release badge/link update automatically. Editorial case-study text and
snapshot proof figures require review when a future release changes them.
