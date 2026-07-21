# Agent Guidelines for minjoo0729.github.io

This is Minjoo Kim's personal academic homepage: an [Astro](https://astro.build) static site deployed to GitHub Pages.

## Structure

- `src/pages/` — routes. Static pages (`index.astro`, `news.astro`, `projects.astro`, `publications.astro`, `teaching.astro`, `cv.astro`, `404.astro`) plus dynamic routes (`blog/[id].astro`, `projects/[id].astro`).
- `src/content/` — content collections defined in `src/content.config.ts`: `news`, `teaching`, `projects`, `blog` (Markdown with frontmatter) and `publications` (`papers.bib`, parsed by `src/lib/bib.ts`).
- `src/data/*.json` — single-object site config (`site.json`, `socials.json`, `cv.json`), imported directly rather than modeled as collections.
- `src/components/`, `src/layouts/` — shared UI.
- `public/` — static assets copied as-is to the build output.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # build to dist/
npm run preview   # preview the production build
npm run check     # astro check (types)
```

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on every push to `main`. GitHub repo Settings → Pages → Source must be "GitHub Actions".

## Routing rules

- New content (a blog post, a news item, a project) goes under `src/content/<collection>/` with frontmatter matching the schema in `src/content.config.ts`.
- Site-wide text/links (name, socials, CV data) live in `src/data/*.json`, not hardcoded in components, except where a page's prose is intentionally hand-written (e.g. the bio on `src/pages/index.astro`).
