/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "*.bib?raw" {
  const content: string;
  export default content;
}
