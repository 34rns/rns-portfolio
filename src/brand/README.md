# RNS brand system

Source assets: `brand/RNS_Square_Black_4K_Crisp.png`,
`brand/RNS_Avatar_1024.png`, and `brand/Color_Swatches.png`.
The originals remain intact. No font files or brand notes were supplied.

## Palette and contrast

The swatch labels specify charcoal **#17191C**, electric yellow **#FFC900**,
pure white **#FFFFFF**, and soft grey **#F3F4F5**. These four colors are unchanged.
`tokens.ts` exports CSS variables for background, surface, text, muted, accent,
accent-2, border, and on-accent, with light and dark roles. Secondary neutrals
are blends of the supplied charcoal and white, not replacement brand colors.
Light is the reading canvas; dark is used for the logo and contact fields.

WCAG contrast measurements (normal text requires 4.5:1):

| Pair | Ratio | Usage |
| --- | ---: | --- |
| Charcoal / white | 17.61:1 | Reading text |
| Charcoal / soft grey | 16.00:1 | Reading text |
| Charcoal / yellow | 11.41:1 | Filled controls |
| Yellow / white | 1.54:1 | Fails; never used for text or a sole control boundary |
| Yellow / soft grey | 1.40:1 | Fails; decorative accents only |
| White / soft grey | 1.10:1 | Fails; never a text pair |

If yellow text on white is requested later, **#917300** is the first compliant
shade along the original yellow's RGB darkening path, approximately 4.5:1.
It is a proposal, not an applied brand color. The current design uses charcoal
text on yellow instead. The image's original black matte is preserved.

## Typography

**Archivo** supplies the angular, substantial display type that suits the
logo's geometry. **Newsreader** supplies calmer, readable editorial prose.
Both are already self-hosted by `next/font`; no global font or project theme
changes are needed. Landing labels and controls also use Archivo, so there is
no extra decorative typeface or font request.

## Assets

The web raster mark crops only unused black canvas around the source, retaining
clear space and the original drawing. The PNG is the source for social artwork;
the WebP is served in the hero. The clean SVG is a flat, two-brand-color trace
of the supplied contours; the original raster's shading stays in the displayed
WebP/PNG. The avatar supplies the favicon and 180px Apple touch icon.

## Scope

Brand roles apply only inside the new landing and its dark sections. Existing
Professional project tokens, project layouts, previews, other themes, shared
CSS, and shared routing are retained. The future 3D mount is marked with
`data-logo-slot="future-3d"`, a fixed aspect ratio, and a source comment; the
public page shows the static image without implementation copy.
