// Minimal, dependency-free BibTeX parser tailored to al-folio-style .bib files
// (jekyll-scholar convention: papers.bib with custom fields like `abbr`,
// `bibtex_show`, `pdf`, `award`, `selected`, etc). Written by hand instead of
// pulling in a third-party parser so the exact behavior is traceable and does
// not depend on an npm package's API that couldn't be verified against a real
// install in this environment.

export interface BibEntry {
  key: string;
  type: string;
  title: string;
  authors: string[];
  year: string;
  month?: string;
  venue?: string;
  volume?: string;
  number?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  abbr?: string;
  bibtexShow: boolean;
  abstract?: string;
  pdf?: string;
  preview?: string;
  video?: string;
  html?: string;
  code?: string;
  website?: string;
  poster?: string;
  slides?: string;
  additionalInfo?: string;
  annotation?: string;
  selected: boolean;
  award?: string;
  awardName?: string;
  googleScholarId?: string;
  inspirehepId?: string;
  raw: string;
}

const ACCENTS: Record<string, Record<string, string>> = {
  '"': { a: "ä", A: "Ä", e: "ë", E: "Ë", i: "ï", I: "Ï", o: "ö", O: "Ö", u: "ü", U: "Ü", y: "ÿ" },
  "'": {
    a: "á", A: "Á", e: "é", E: "É", i: "í", I: "Í", o: "ó", O: "Ó", u: "ú", U: "Ú", y: "ý",
    c: "ć", C: "Ć", n: "ń", N: "Ń", s: "ś", S: "Ś", z: "ź", Z: "Ź",
  },
  "`": { a: "à", A: "À", e: "è", E: "È", i: "ì", I: "Ì", o: "ò", O: "Ò", u: "ù", U: "Ù" },
  "^": { a: "â", A: "Â", e: "ê", E: "Ê", i: "î", I: "Î", o: "ô", O: "Ô", u: "û", U: "Û" },
  "~": { a: "ã", A: "Ã", n: "ñ", N: "Ñ", o: "õ", O: "Õ" },
  c: { c: "ç", C: "Ç", s: "ş", S: "Ş" },
  v: { c: "č", C: "Č", s: "š", S: "Š", z: "ž", Z: "Ž", e: "ě", E: "Ě", r: "ř", R: "Ř" },
};

function unescapeLatex(input: string): string {
  let out = input;
  // {\"u} / {\'e} style (braced accent, optional inner brace around the letter)
  out = out.replace(/\{\\(["'`^~cv])\{?([a-zA-Z])\}?\}/g, (_, acc, ch) => ACCENTS[acc]?.[ch] ?? ch);
  // \"u / \'e without the outer protective braces
  out = out.replace(/\\(["'`^~cv])\{?([a-zA-Z])\}?/g, (_, acc, ch) => ACCENTS[acc]?.[ch] ?? ch);
  // remaining braces are just capitalization-protection groups; drop them for display
  out = out.replace(/\{([^{}]*)\}/g, "$1");
  out = out.replace(/\\&/g, "&").replace(/\\%/g, "%").replace(/---/g, "—").replace(/--/g, "–");
  return out.trim();
}

function stripOuterWrap(value: string): string {
  const v = value.trim();
  if (v.startsWith("{") && v.endsWith("}")) return v.slice(1, -1);
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  return v;
}

/** Split on `delimiter` only outside of {..} nesting and outside ".." strings. */
function splitTopLevel(str: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inQuotes = false;
  let current = "";
  for (const ch of str) {
    if (ch === '"' && depth === 0) inQuotes = !inQuotes;
    if (!inQuotes) {
      if (ch === "{") depth++;
      if (ch === "}") depth--;
    }
    if (ch === delimiter && depth === 0 && !inQuotes) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim().length) parts.push(current);
  return parts;
}

function formatAuthorName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes(",")) {
    const [last, first] = trimmed.split(",").map((s) => s.trim());
    return first ? `${first} ${last}` : last;
  }
  return trimmed;
}

function toBool(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function parseBibtex(source: string): BibEntry[] {
  const strings: Record<string, string> = {};
  const stringRe = /@string\s*\{\s*([a-zA-Z0-9_]+)\s*=\s*\{([^}]*)\}\s*\}/g;
  let sm: RegExpExecArray | null;
  while ((sm = stringRe.exec(source))) {
    strings[sm[1].toLowerCase()] = sm[2];
  }

  const entries: BibEntry[] = [];
  const entryStartRe = /@(\w+)\s*\{\s*([^,\s{}]+)\s*,/g;
  let m: RegExpExecArray | null;
  while ((m = entryStartRe.exec(source))) {
    const type = m[1].toLowerCase();
    const key = m[2];
    if (type === "string" || type === "comment" || type === "preamble") continue;

    const bodyStart = entryStartRe.lastIndex;
    let depth = 1;
    let i = bodyStart;
    for (; i < source.length; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const body = source.slice(bodyStart, i);
    const raw = source.slice(m.index, i + 1);
    entryStartRe.lastIndex = i + 1;

    const fields: Record<string, string> = {};
    for (const part of splitTopLevel(body, ",")) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const name = part.slice(0, eq).trim().toLowerCase();
      const rawValue = part.slice(eq + 1).trim();
      let value = stripOuterWrap(rawValue);
      if (/^[a-zA-Z0-9_]+$/.test(rawValue) && strings[rawValue.toLowerCase()]) {
        value = strings[rawValue.toLowerCase()];
      }
      fields[name] = unescapeLatex(value);
    }

    const authors = fields.author ? fields.author.split(/\s+and\s+/).map(formatAuthorName) : [];

    entries.push({
      key,
      type,
      title: fields.title ?? "",
      authors,
      year: fields.year ?? "",
      month: fields.month,
      venue: fields.journal ?? fields.booktitle ?? fields.publisher,
      volume: fields.volume,
      number: fields.number,
      pages: fields.pages,
      doi: fields.doi,
      url: fields.url,
      publisher: fields.publisher,
      abbr: fields.abbr,
      bibtexShow: toBool(fields.bibtex_show),
      abstract: fields.abstract,
      pdf: fields.pdf,
      preview: fields.preview,
      video: fields.video,
      html: fields.html,
      code: fields.code,
      website: fields.website,
      poster: fields.poster,
      slides: fields.slides,
      additionalInfo: fields.additional_info,
      annotation: fields.annotation,
      selected: toBool(fields.selected),
      award: fields.award,
      awardName: fields.award_name,
      googleScholarId: fields.google_scholar_id,
      inspirehepId: fields.inspirehep_id,
      raw,
    });
  }

  return entries;
}

export function groupByYear(entries: BibEntry[]): { year: string; entries: BibEntry[] }[] {
  const map = new Map<string, BibEntry[]>();
  for (const entry of entries) {
    const year = entry.year || "Unknown";
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(entry);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] === "Unknown" ? -1 : b[0] === "Unknown" ? 1 : Number(b[0]) - Number(a[0])))
    .map(([year, entries]) => ({ year, entries }));
}
