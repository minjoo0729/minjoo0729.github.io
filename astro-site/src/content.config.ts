import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    date: z.coerce.date(),
    inline: z.boolean().default(true),
    related_posts: z.boolean().default(false),
  }),
});

const teaching = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/teaching" }),
  schema: z.object({
    semester: z.string(),
    course: z.string(),
    role: z.string(),
    professor: z.string().optional(),
    description: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    img: z.string().optional(),
    importance: z.number().default(99),
    category: z.string().optional(),
    related_publications: z.boolean().default(false),
    github: z.string().optional(),
    github_stars: z.string().optional(),
    url: z.string().optional(),
    redirect: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    thumbnail: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

// cv.json / socials.json / site.json are single config objects, not repeating
// entries, so they're imported directly as JSON modules (see src/data/*.json)
// instead of being modeled as content collections.

export const collections = { news, teaching, projects, blog };
