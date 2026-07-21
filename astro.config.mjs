import { defineConfig } from "astro/config";

// GitHub Pages: https://minjoo0729.github.io (user/organization site, served at the domain root)
export default defineConfig({
  site: "https://minjoo0729.github.io",
  base: "/",
  trailingSlash: "always",
});
