/**
 * The fixed specimen data for the Shobdo case study. Kept free of React so the
 * contrast and content tests can import it without pulling a page in.
 */

export type LanguagePlate = {
  key: string;
  name: string;
  src: string;
  caption: string;
  note: string;
};

export const languagePlates: LanguagePlate[] = [
  {
    key: "বাং",
    name: "Bangla",
    src: "/projects/shobdo/02-bangla.png",
    caption: "Fixed Probhat layout",
    note: "The letters where people who already know them expect them. Kar signs, hasanta joining and one-unit backspace that removes a base letter with its kar.",
  },
  {
    key: "BL",
    name: "Banglish",
    src: "/projects/shobdo/03-banglish.png",
    caption: "Type Roman, get Bangla",
    note: "ami becomes আমি, and valo becomes ভালো. Offline reverse lookup, prefix completions, context and remembered choices rank the suggestions as you type.",
  },
  {
    key: "EN",
    name: "English",
    src: "/projects/shobdo/01-english.png",
    caption: "QWERTY, number row",
    note: "A full English keyboard one tap away, with long-press accents, two symbol pages and a shift key that shows its state.",
  },
];

export type ThemeShot = { name: string; src: string };

export const themeShots: ThemeShot[] = [
  { name: "Studio Light", src: "/projects/shobdo/themes/t-studio_light.png" },
  { name: "Studio Dark", src: "/projects/shobdo/themes/t-studio_dark.png" },
  { name: "Onyx", src: "/projects/shobdo/themes/t-onyx.png" },
  { name: "Frost", src: "/projects/shobdo/themes/t-frost.png" },
  { name: "Aurora", src: "/projects/shobdo/themes/t-aurora.png" },
  { name: "Evergreen", src: "/projects/shobdo/themes/t-evergreen.png" },
  { name: "Cloudline", src: "/projects/shobdo/themes/t-cloudline.png" },
  { name: "Cassette", src: "/projects/shobdo/themes/t-cassette.png" },
  { name: "Sakura", src: "/projects/shobdo/themes/t-sakura.png" },
  { name: "Tokyo Night", src: "/projects/shobdo/themes/t-tokyo_night.png" },
  { name: "Pixel Arcade", src: "/projects/shobdo/themes/t-pixel_arcade.png" },
  { name: "Obsidian Gold", src: "/projects/shobdo/themes/t-obsidian_gold.png" },
  { name: "Dynamic", src: "/projects/shobdo/themes/t-dynamic.png" },
];

export type BanglishRow = { roman: string; bangla: string; meaning: string };

export const banglishRows: BanglishRow[] = [
  { roman: "ami", bangla: "আমি", meaning: "I" },
  { roman: "tumi", bangla: "তুমি", meaning: "you" },
  { roman: "bhalo", bangla: "ভালো", meaning: "good" },
  { roman: "valo", bangla: "ভালো", meaning: "good, alternate spelling" },
  { roman: "kemon", bangla: "কেমন", meaning: "how" },
  { roman: "kormo", bangla: "কর্ম", meaning: "work, reph" },
  { roman: "bangla", bangla: "বাংলা", meaning: "Bangla" },
  { roman: "kotha", bangla: "কথা", meaning: "word, talk" },
  { roman: "desh", bangla: "দেশ", meaning: "country" },
  { roman: "pr", bangla: "প্র", meaning: "conjunct" },
  { roman: "123", bangla: "১২৩", meaning: "digits" },
];

export type GalleryShot = {
  src: string;
  caption: string;
  ratio: string;
  wide?: boolean;
};

export const galleryShots: GalleryShot[] = [
  {
    src: "/projects/shobdo/00-onboarding.png",
    caption: "Three-step onboarding, with completion detected rather than assumed.",
    ratio: "1080 / 2400",
  },
  {
    src: "/projects/shobdo/04-candidates.png",
    caption: "The full candidate panel, ranked against an 83,000-word frequency list.",
    ratio: "1080 / 2400",
  },
  {
    src: "/projects/shobdo/05-themes.png",
    caption: "Thirteen themes, each with a live keyboard preview.",
    ratio: "1080 / 2400",
  },
  {
    src: "/projects/shobdo/composite-themes.png",
    caption: "Four of the thirteen built-in themes, captured on Android 15.",
    ratio: "1972 / 1156",
    wide: true,
  },
  {
    src: "/projects/shobdo/composite-settings.png",
    caption: "Onboarding, the theme picker and the ranked candidates in one pass.",
    ratio: "1900 / 1379",
    wide: true,
  },
];

export const proofPoints = [
  { value: "13", label: "built-in themes" },
  { value: "98", label: "unit tests, 0 failures" },
  { value: "3.99", label: "MB APK, v0.4.0" },
  { value: "0", label: "network permissions" },
];

export const tickerItems = [
  "Three languages",
  "Thirteen contrast-checked themes",
  "No INTERNET permission",
  "98 unit tests",
  "3.99 MB APK · v0.4.0",
  "MIT source · CC BY-SA data",
  "Built in Dhaka",
];
