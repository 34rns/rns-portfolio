import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", ["draft", "published"]);
export const projectPlacement = pgEnum("project_placement", ["featured", "unlisted"]);
export const userRole = pgEnum("user_role", ["admin", "customer"]);

export type ThemeOptions = {
  accent?: string;
  modelUrl?: string;
  lighting?: string;
  [key: string]: unknown;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  role: userRole("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  coverImageUrl: text("cover_image_url"),
  gallery: jsonb("gallery").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  liveUrl: text("live_url"),
  repoUrl: text("repo_url"),
  year: integer("year").notNull(),
  status: projectStatus("status").notNull().default("draft"),
  placement: projectPlacement("placement").notNull().default("featured"),
  sortOrder: integer("sort_order").notNull().default(0),
  theme: text("theme").notNull().default("professional"),
  themeOptions: jsonb("theme_options").$type<ThemeOptions>().notNull().default(sql`'{}'::jsonb`),
  isPaid: boolean("is_paid").notNull().default(false),
  priceCents: integer("price_cents"),
  currency: text("currency").notNull().default("USD"),
  providerProductId: text("provider_product_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export type ProjectRecord = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
