# minjoo0729.github.io

Minjoo Kim's academic homepage, built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Structure

- `src/pages/` — routes (`index`, `blog`, `news`, `projects`, `publications`, `teaching`, `cv`, `404`)
- `src/content/` — Markdown/BibTeX content collections (`news`, `teaching`, `projects`, `blog`, `publications`)
- `src/data/` — site-wide config (`site.json`, `socials.json`, `cv.json`)
- `src/components/`, `src/layouts/` — shared UI
- `src/lib/bib.ts` — BibTeX parser for `src/content/publications/papers.bib`

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # preview the production build
npm run check     # astro check (types)
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages via `actions/deploy-pages`. GitHub repo Settings → Pages → Source must be set to "GitHub Actions".
