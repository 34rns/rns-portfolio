import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const seeds = [
  {
    slug: "moneykick-shop",
    title: "MoneyKick Shop",
    tagline: "A storefront built for how Bangladesh actually pays.",
    year: 2025,
    theme: "professional" as const,
    tags: ["Next.js", "TypeScript", "Supabase", "Bkash"],
    liveUrl: "https://moneykickshop1.vercel.app",
    repoUrl: "https://github.com/34rns/moneykickshop",
    coverImageUrl: null,
    gallery: [],
    placement: "featured" as const,
    sortOrder: 0,
    themeOptions: {},
    description: `## The brief

Most small storefronts in Bangladesh still run on a Facebook page, a spreadsheet, and a Bkash number. MoneyKick Shop turns that into a real store: browse, add to cart, pay, track the order.

## What I built

- A responsive catalog with product detail pages and a one-tap buy flow
- Cart with quantity management and a checkout that does not demand an account
- Bkash payment instructions, a transaction ID field, and a manual verification step
- An admin dashboard covering orders, products, banners and customers
- Order lifecycle from pending through delivered, with email notifications through Resend

## Stack

Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Postgres and Auth with row-level security, Resend for transactional email, Bkash for payment.

## What it taught me

Payment verification is a product problem, not a form field. The checkout is designed around the real workflow: a customer sends money, pastes the TrxID, and an admin confirms it. Every screen supports that handoff instead of pretending it is a card charge.`,
  },
  {
    slug: "rise-hunters-ascent",
    title: "RISE Hunter's Ascent",
    tagline: "An anime-grade training loop for real workouts.",
    year: 2025,
    theme: "anime" as const,
    tags: ["Next.js", "TypeScript", "Genkit"],
    liveUrl: null,
    repoUrl: "https://github.com/34rns/RISE-Hunter-s-Ascent",
    coverImageUrl: null,
    gallery: [],
    placement: "featured" as const,
    sortOrder: 1,
    themeOptions: { accent: "#D9482B" },
    description: `## The idea

RISE turns training into the progression loop that makes games hard to put down: earn XP, clear quests, climb from E-rank to S-rank.

## What is inside

- A hunter dashboard with rank, level and XP progress
- Dungeons, quests and a workout tracker, each with its own page
- Analytics charts for training volume and streaks
- Profile setup layered over a shared game-state provider
- Genkit-powered AI helpers wired into the app

## Stack

Next.js App Router, TypeScript, Tailwind, shadcn/ui, and Genkit for the AI wiring.

## Why it matters

Most fitness apps ask for discipline. This one gives you a reason to come back: the next rank is always visible, and the work you already did turns into progress you can see.`,
  },
  {
    slug: "office-chaos",
    title: "OfficeChaos",
    tagline: "A Unity 6 workshop for character rigs and shaders.",
    year: 2026,
    theme: "professional" as const,
    tags: ["Unity", "C#", "ShaderLab"],
    liveUrl: null,
    repoUrl: "https://github.com/34rns/OfficeChaos",
    coverImageUrl: null,
    gallery: [],
    placement: "featured" as const,
    sortOrder: 2,
    themeOptions: { accent: "#2E6B4F" },
    description: `## A deliberate playground

OfficeChaos is a Unity 6 project for exploring character rigs and shaders in an office setting. Less a finished game, more a workshop that keeps the rendering muscles honest.

## What is in the project

- Unity 6 (6000.5) with a modular character kit and swappable body parts
- Custom shader and lighting experiments in ShaderLab and HLSL
- A scene built to preview rigs, materials and props together

## Why C# and shaders

Web work teaches you to respect frame budgets. Shader work teaches you what actually fills them. Keeping both in rotation makes the browser work sharper, and the Unity side stops being a black box.`,
  },
  {
    slug: "workwing",
    title: "WorkWing",
    tagline: "A focus timer that stays out of the way.",
    year: 2025,
    theme: "synthwave" as const,
    tags: ["HTML", "CSS", "JavaScript"],
    liveUrl: null,
    repoUrl: "https://github.com/34rns/WorkWing",
    coverImageUrl: null,
    gallery: [],
    placement: "unlisted" as const,
    sortOrder: 3,
    themeOptions: {},
    lighting: "neon" as const,
    description: `## A small tool, finished

WorkWing is a single-page focus timer with stopwatch, countdown and Pomodoro modes, built to feel calm instead of noisy.

## Details

- Three timer modes with keyboard shortcuts
- Animated gradient and particle background
- Customizable timer settings
- Fully responsive, no build step

## Why it exists

Sometimes the best portfolio piece is a small thing with no dependencies that just works. This one is HTML, CSS and JavaScript end to end.`,
  },
  {
    slug: "ghostline-09",
    title: "Ghostline 09",
    tagline: "A courier dispatch console for the 03:00 shift.",
    year: 2026,
    theme: "cyberpunk" as const,
    tags: ["Next.js", "WebGL", "Realtime", "TypeScript"],
    liveUrl: null,
    repoUrl: "https://github.com/34rns",
    coverImageUrl: "/demo/ghostline-09.jpg",
    gallery: ["/demo/signal-intercept.jpg", "/demo/payload-run.jpg"],
    placement: "unlisted" as const,
    sortOrder: 4,
    themeOptions: {},
    lighting: "neon" as const,
    description: `## The brief

A courier network runs on trust and timestamps. Ghostline is the console the dispatcher keeps open all night: who is carrying what, which route is live, and what has gone quiet.

## What is inside

- A live board of active runs with carrier, payload class and route
- An optic feed that traces a run from pickup to drop
- Signal health per node, with a dead channel called out instead of hidden
- A dispatch log that keeps the handoff history readable at 03:00
- Keyboard-first controls, because the desk is faster than the mouse

## Stack

Next.js App Router, TypeScript, WebGL for the route view, and a realtime channel feeding the board. The interface is deliberately quiet: near-black surfaces, one acid accent, and monospace for anything that could be mistaken for a number.

## Why it matters

Logistics tools usually fail at the handoff. This one treats every handoff as the primary screen: the payload, the carrier, the witness, the time. Everything else is decoration.`,
  },
];

async function main() {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { projects } = await import("../src/lib/db/schema");

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local`.");

  const db = drizzle(neon(url));

  for (const seed of seeds) {
    const now = new Date();
    const values = {
      ...seed,
      description: seed.description,
      status: "published" as const,
      isPaid: false,
      priceCents: null,
      currency: "USD",
      providerProductId: null,
      publishedAt: now,
      updatedAt: now,
    };

    await db
      .insert(projects)
      .values(values)
      .onConflictDoUpdate({
        target: projects.slug,
        set: {
          title: values.title,
          tagline: values.tagline,
          description: values.description,
          coverImageUrl: values.coverImageUrl,
          gallery: values.gallery,
          tags: values.tags,
          liveUrl: values.liveUrl,
          repoUrl: values.repoUrl,
          year: values.year,
          status: values.status,
          placement: values.placement,
          sortOrder: values.sortOrder,
          theme: values.theme,
          themeOptions: values.themeOptions,
          isPaid: values.isPaid,
          priceCents: values.priceCents,
          currency: values.currency,
          providerProductId: values.providerProductId,
          publishedAt: values.publishedAt,
          updatedAt: values.updatedAt,
        },
      });

    console.log(`seeded ${seed.slug}`);
  }

  console.log(`\n${seeds.length} projects ready.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
