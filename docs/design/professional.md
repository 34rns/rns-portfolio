# Professional theme — design notes

The brief: trustworthy, high-end, editorial, and not mistakable for a template.
The default look of AI-generated portfolios (warm cream, high-contrast serif,
terracotta accent, tracked all-caps labels, animated card grids) was deliberately
avoided.

## Concept

An engineer's index, not a brochure. The page is a working document: a name set
as a masthead, a numbered project register, and short evidence. One structural
idea carries the personality — hovering a project row opens a floating cover
preview at the cursor while the row's title shifts. Everything else stays quiet.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| background | `#E9EAE4` | Cool stone paper |
| surface | `#F2F2EC` | Raised panels, fallback covers |
| text | `#14171A` | Ink |
| muted | `#5C615E` | Secondary copy, metadata |
| accent | `#1B3BFF` | Signal blue: cursor, rules, links |
| accentText | `#F7F8F4` | Text on accent |
| line | `rgba(20,23,26,0.16)` | Hairline structure |
| radius | `2px` | Nearly square, deliberate |

## Type

- **Archivo** (variable, width 116) for display. Expanded, tight tracking,
  oversized. Deliberately not a serif.
- **Newsreader** for body and long-form case studies at 19px/1.65, max ~68ch.
- **DM Mono** only for real metadata (year, stack, labels), never as decoration.

## Layout

- Left-aligned asymmetric 12-column grid, 1440px max, wide margins.
- Project index rows: order, title, year, stack. Numbering is used only because
  the list is genuinely ordered.
- Case study: masthead → meta rail → full-bleed cover → 720px prose column →
  gallery → next project.

## Motion

- One orchestrated load: the masthead rises out of a mask, a rule draws, then
  the supporting lines settle. No repeated fade-up on every section.
- Hover: title translation, floating cover reveal, magnetic contact link.
- Scroll: a small parallax on the cover only.
- Reduced motion removes all of it; the intro overlay is CSS-only and skipped
  after the first visit in a session.

## Accessibility

Skip link, semantic landmarks, visible focus rings, no motion required to read
anything, body text at APCA-friendly contrast on stone, and descriptive alt text
on every image. Typographic fallback covers are real text, not background images.
