/**
 * docs.reportroom.io — on-brand single-page developer docs + llms.txt.
 *
 * Content comes from the repo-root markdown (api.md, mcp.md, llms.txt) — the
 * single source of truth — compiled at build time into content.generated.ts
 * by scripts/gen-content.mjs (`npm run gen`, wired into `npm run deploy` and CI).
 * Only the page shell (head, CSS, hero, footer) is hand-authored here.
 *
 * Styling: "Midnight Azure" (v2.3.0 redesign). This repo can't import
 * @reportroom/theme (separate deploy, no workspace access), so the token
 * values, the two-scope dark-mode pattern, and the pre-paint theme script
 * below are copied by hand from packages/theme/src/index.ts in the main
 * monorepo (qdeploy) — keep them in sync if that package's tokens change.
 * The wordmark/monogram SVGs are likewise copied from
 * packages/design-system/src/logo-assets.ts (asset source-of-truth there).
 */
import { LLMS, BODY } from "./content.generated";

/** Copied from @reportroom/theme's tokens(): the `:root` custom-property
 *  block (light defaults) plus both dark-mode override mechanisms — OS
 *  preference (`prefers-color-scheme`, scoped `:not([data-theme="light"])`
 *  so an explicit light choice always wins) and the explicit user choice
 *  (`[data-theme="dark"]`, stamped pre-paint by the inline script below). */
const TOKENS_CSS = `:root{--bg:#FAFAF7;--surface:#FFFFFF;--surface-2:#F1F0F4;--ink:#1A1826;--muted:#6E6A78;--line:#E8E6EF;--accent:#00A8FF;--accent-ink:#06121C;--accent-strong:#0090DD;--accent-soft:#DCF2FF;--violet:#7C5CFF;--danger:#C22623;--danger-soft:#FFE4E3;--ok:#4C6608;--ok-soft:#EFF8D3;--warn:#8A6100;--warn-soft:#FFF3D6;--side-bg:#16131F;--side-surface:#201B2E;--side-2:#241F33;--side-line:#2E2841;--side-ink:#F2F0F7;--side-muted:#8F87A3}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#16131F;--surface:#201B2E;--surface-2:#241F33;--ink:#F2F0F7;--muted:#8F87A3;--line:#2E2841;--accent-strong:#4FC4FF;--accent-soft:#1F2A3D;--violet:#8B5CFF;--danger:#FF7A77;--danger-soft:#3D1F26;--ok:#C6E67A;--ok-soft:#26301A;--warn:#FFD37A;--warn-soft:#33290F}}
:root[data-theme="dark"]{--bg:#16131F;--surface:#201B2E;--surface-2:#241F33;--ink:#F2F0F7;--muted:#8F87A3;--line:#2E2841;--accent-strong:#4FC4FF;--accent-soft:#1F2A3D;--violet:#8B5CFF;--danger:#FF7A77;--danger-soft:#3D1F26;--ok:#C6E67A;--ok-soft:#26301A;--warn:#FFD37A;--warn-soft:#33290F}`;

/** Copied from @reportroom/theme's themeScript(): the one sanctioned inline
 *  script. Runs before first paint — reads localStorage `rr-theme` and
 *  stamps `data-theme` on `<html>` so there's no flash of the wrong theme.
 *  `window.rrToggleTheme()` flips the choice and persists it. */
const THEME_SCRIPT = `<script>(function(){try{var t=localStorage.getItem("rr-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})();function rrToggleTheme(){var d=document.documentElement;var dark=d.getAttribute("data-theme")==="dark"||(!d.getAttribute("data-theme")&&matchMedia("(prefers-color-scheme: dark)").matches);var n=dark?"light":"dark";d.setAttribute("data-theme",n);try{localStorage.setItem("rr-theme",n)}catch(e){}}</script>`;

/** Wordmark SVGs, copied verbatim from packages/design-system/assets/logo/
 *  (wordmark-light.svg / wordmark-dark.svg) — split-fill "ReportRoom": ink
 *  for the first word, azure `#00A8FF` for the second, so the mark itself
 *  carries the brand accent in both themes. */
const WORDMARK_LIGHT_SVG = `<svg viewBox="-2 -73 635.8 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ReportRoom"><path d="M19-24.30L19 0L4 0L4-67L41-67Q53.40-67 60.15-61.75Q66.90-56.50 66.90-46.90Q66.90-30.10 48-28.30L48-27.50Q52.20-26.40 54.45-24.20Q56.70-22 58.80-18L68.50 0L51.10 0L41.90-17.40Q39.80-21.40 37.20-22.85Q34.60-24.30 28.90-24.30L19-24.30M40.90-53.50L19-53.50L19-35.60L40.90-35.60Q46.40-35.60 48.80-37.55Q51.20-39.50 51.20-44.60Q51.20-49.50 48.75-51.50Q46.30-53.50 40.90-53.50M98.80 1Q85.80 1 78.25-5.55Q70.70-12.10 70.70-25Q70.70-36.90 78.35-44Q86-51.10 98.50-51.10Q111-51.10 118.40-44.75Q125.80-38.40 125.80-26.80Q125.80-25.40 125.40-22L84.60-22Q84.90-16.10 88-13.55Q91.10-11 98.30-11Q104.80-11 107.55-12.65Q110.30-14.30 110.30-17.60L110.30-18.60L125.30-18.60L125.30-17.50Q125.30-9.30 118-4.15Q110.70 1 98.80 1M107.95-37.15Q104.80-39.40 98.20-39.40Q91.60-39.40 88.45-37.10Q85.30-34.80 84.80-29.90L111.40-29.90Q111.10-34.90 107.95-37.15M146.20-13.50L146.20 17L131.20 17L131.20-50.10L145.10-50.10L145.10-36.40L146.10-36.40Q148.90-51.10 166.10-51.10Q177.50-51.10 183.80-44.10Q190.10-37.10 190.10-25Q190.10-12.90 183.95-5.95Q177.80 1 166.60 1Q158.10 1 153.15-2.85Q148.20-6.70 146.90-13.50L146.20-13.50M146.20-25.10L146.20-24.30Q146.20-18.10 149.85-15.40Q153.50-12.70 160.80-12.70Q168.20-12.70 171.55-15.50Q174.90-18.30 174.90-25Q174.90-31.70 171.55-34.50Q168.20-37.30 160.90-37.30Q153.40-37.30 149.80-34.45Q146.20-31.60 146.20-25.10M242.75-6.10Q234.90 1 222 1Q209.10 1 201.25-6.10Q193.40-13.20 193.40-25Q193.40-36.90 201.25-44Q209.10-51.10 222-51.10Q234.90-51.10 242.75-44Q250.60-36.90 250.60-25Q250.60-13.20 242.75-6.10M211.40-15.30Q214.50-12.30 222-12.30Q229.50-12.30 232.60-15.30Q235.70-18.30 235.70-25Q235.70-31.70 232.55-34.80Q229.40-37.90 222-37.90Q214.50-37.90 211.40-34.85Q208.30-31.80 208.30-25Q208.30-18.30 211.40-15.30M270.70-29L270.70 0L255.70 0L255.70-50.10L269.60-50.10L269.60-36.80L270.50-36.80Q271.60-43.30 275.85-47.20Q280.10-51.10 287.30-51.10Q295.30-51.10 299.20-46.30Q303.10-41.50 303.10-33.60L303.10-25.30L288.10-25.30L288.10-30.50Q288.10-34.70 286.20-36.55Q284.30-38.40 279.80-38.40Q274.90-38.40 272.80-36.10Q270.70-33.80 270.70-29M342.80-13.50L342.80 0L330.40 0Q311.60 0 311.60-18.10L311.60-37.70L303.70-37.70L303.70-50.10L311.60-50.10L311.60-59.80L326.60-59.80L326.60-50.10L342.80-50.10L342.80-37.70L326.60-37.70L326.60-19.80Q326.60-16.10 328.15-14.80Q329.70-13.50 333.80-13.50" fill="#1A1826"/><path d="M362.40-24.30L362.40 0L347.40 0L347.40-67L384.40-67Q396.80-67 403.55-61.75Q410.30-56.50 410.30-46.90Q410.30-30.10 391.40-28.30L391.40-27.50Q395.60-26.40 397.85-24.20Q400.10-22 402.20-18L411.90 0L394.50 0L385.30-17.40Q383.20-21.40 380.60-22.85Q378-24.30 372.30-24.30L362.40-24.30M384.30-53.50L362.40-53.50L362.40-35.60L384.30-35.60Q389.80-35.60 392.20-37.55Q394.60-39.50 394.60-44.60Q394.60-49.50 392.15-51.50Q389.70-53.50 384.30-53.50M463.05-6.10Q455.20 1 442.30 1Q429.40 1 421.55-6.10Q413.70-13.20 413.70-25Q413.70-36.90 421.55-44Q429.40-51.10 442.30-51.10Q455.20-51.10 463.05-44Q470.90-36.90 470.90-25Q470.90-13.20 463.05-6.10M431.70-15.30Q434.80-12.30 442.30-12.30Q449.80-12.30 452.90-15.30Q456-18.30 456-25Q456-31.70 452.85-34.80Q449.70-37.90 442.30-37.90Q434.80-37.90 431.70-34.85Q428.60-31.80 428.60-25Q428.60-18.30 431.70-15.30M523.45-6.10Q515.60 1 502.70 1Q489.80 1 481.95-6.10Q474.10-13.20 474.10-25Q474.10-36.90 481.95-44Q489.80-51.10 502.70-51.10Q515.60-51.10 523.45-44Q531.30-36.90 531.30-25Q531.30-13.20 523.45-6.10M492.10-15.30Q495.20-12.30 502.70-12.30Q510.20-12.30 513.30-15.30Q516.40-18.30 516.40-25Q516.40-31.70 513.25-34.80Q510.10-37.90 502.70-37.90Q495.20-37.90 492.10-34.85Q489-31.80 489-25Q489-18.30 492.10-15.30M551.40-25.30L551.40 0L536.40 0L536.40-50.10L550.30-50.10L550.30-34.90L551.10-34.90Q552.10-42 556.60-46.55Q561.10-51.10 569.90-51.10Q578.20-51.10 582.90-46.60Q587.60-42.10 588.50-34.70L589.40-34.70Q590.40-41.90 595-46.50Q599.60-51.10 608.60-51.10Q617.90-51.10 622.85-45.60Q627.80-40.10 627.80-31.20L627.80 0L612.80 0L612.80-26.20Q612.80-32.50 610.25-35.05Q607.70-37.60 601.30-37.60Q594.60-37.60 592.10-34.80Q589.60-32 589.60-25.30L589.60 0L574.60 0L574.60-26.20Q574.60-32.50 572.05-35.05Q569.50-37.60 563.10-37.60Q556.40-37.60 553.90-34.80Q551.40-32 551.40-25.30" fill="#00A8FF"/></svg>`;
const WORDMARK_DARK_SVG = WORDMARK_LIGHT_SVG.replace('fill="#1A1826"', 'fill="#F2F0F7"');

/** Monogram, copied from packages/design-system/assets/logo/monogram-light.svg,
 *  inlined as a favicon data-URI (base64) — the docs worker has no static
 *  asset pipeline for a separate /favicon.ico route. */
const FAVICON_DATA_URI =
  "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSItNSAtNzUgMTYwLjggODMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJSZXBvcnRSb29tIj48cGF0aCBkPSJNMjEuODAtMjIuODBMMjEuODAgMEwzIDBMMy02N0w0Mi4xMC02N1E1NS4zMC02NyA2Mi4yMC02MS43MFE2OS4xMC01Ni40MCA2OS4xMC00Ni41MFE2OS4xMC0zOC40MCA2NC43NS0zMy44MFE2MC40MC0yOS4yMCA1MS0yOEw1MS0yN1E1NS44MC0yNS44MCA1OC4xNS0yMy41MFE2MC41MC0yMS4yMCA2Mi42MC0xNi44MEw3MC45MCAwTDQ5LjIwIDBMNDEuMjAtMTYuNDBRMzkuNDAtMjAuMjAgMzcuMTUtMjEuNTBRMzQuOTAtMjIuODAgMjkuNTAtMjIuODBMMjEuODAtMjIuODBNNDEuOTAtNTAuMTBMMjEuODAtNTAuMTBMMjEuODAtMzYuODBMNDEuOTAtMzYuODBRNDYuMjAtMzYuODAgNDcuODAtMzguMTBRNDkuNDAtMzkuNDAgNDkuNDAtNDMuNTBRNDkuNDAtNDcuNDAgNDcuNzUtNDguNzVRNDYuMTAtNTAuMTAgNDEuOTAtNTAuMTAiIGZpbGw9IiMxQTE4MjYiLz48cGF0aCBkPSJNOTguNzAtMjIuODBMOTguNzAgMEw3OS45MCAwTDc5LjkwLTY3TDExOS02N1ExMzIuMjAtNjcgMTM5LjEwLTYxLjcwUTE0Ni01Ni40MCAxNDYtNDYuNTBRMTQ2LTM4LjQwIDE0MS42NS0zMy44MFExMzcuMzAtMjkuMjAgMTI3LjkwLTI4TDEyNy45MC0yN1ExMzIuNzAtMjUuODAgMTM1LjA1LTIzLjUwUTEzNy40MC0yMS4yMCAxMzkuNTAtMTYuODBMMTQ3LjgwIDBMMTI2LjEwIDBMMTE4LjEwLTE2LjQwUTExNi4zMC0yMC4yMCAxMTQuMDUtMjEuNTBRMTExLjgwLTIyLjgwIDEwNi40MC0yMi44MEw5OC43MC0yMi44ME0xMTguODAtNTAuMTBMOTguNzAtNTAuMTBMOTguNzAtMzYuODBMMTE4LjgwLTM2LjgwUTEyMy4xMC0zNi44MCAxMjQuNzAtMzguMTBRMTI2LjMwLTM5LjQwIDEyNi4zMC00My41MFExMjYuMzAtNDcuNDAgMTI0LjY1LTQ4Ljc1UTEyMy01MC4xMCAxMTguODAtNTAuMTAiIGZpbGw9IiMwMEE4RkYiLz48L3N2Zz4=";

/** Docs-site chrome: nav (wordmark + toggle), hero copy, and content
 *  typography — all colors come from the token custom properties above, no
 *  hardcoded hexes, so this automatically re-themes with the dark overrides.
 *  Register matches apps/marketing/src/index.ts's CSS (Inter Tight display
 *  type, azure eyebrow/links, dark `--side-bg` code blocks). */
const PAGE_CSS = `*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:'Inter Tight',ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wrap{max-width:820px;margin:0 auto;padding:0 clamp(20px,5vw,36px)}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg);z-index:5;padding:14px clamp(20px,5vw,36px)}
.nav .brand{display:inline-flex;align-items:center;color:var(--ink);text-decoration:none}
.nav .brand svg{height:20px;width:auto}
.brand-dark{display:none}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .brand-light{display:none}:root:not([data-theme="light"]) .brand-dark{display:inline-flex}}
:root[data-theme="dark"] .brand-light{display:none}
:root[data-theme="dark"] .brand-dark{display:inline-flex}
.theme-toggle{background:transparent;border:1px solid var(--line);border-radius:8px;width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;color:var(--ink);font-family:inherit}
.theme-toggle:hover{background:var(--surface-2)}
.hero{padding:clamp(24px,5vw,64px) clamp(20px,5vw,36px) 0}
.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent-strong);font-weight:700}
.endpoints{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 4px;padding:0}
.endpoints .chip{display:inline-flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-weight:600;color:var(--ink);text-decoration:none;font-size:13px}
a.chip:hover{border-color:var(--accent-strong);text-decoration:none}
.endpoints .chip .k{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}
.endpoints .chip code{background:none;border:none;padding:0;color:var(--accent-strong);font-size:12.5px}
h1{font-size:clamp(38px,6vw,64px);line-height:.98;letter-spacing:-.03em;font-weight:800;margin:10px 0 6px;color:var(--ink)}
h2{font-size:clamp(24px,3.5vw,34px);letter-spacing:-.02em;margin:44px 0 4px;border-top:1px solid var(--line);padding-top:28px;color:var(--ink)}
h3{font-size:19px;margin:22px 0 6px;color:var(--ink)}
h4{font-size:16px;margin:18px 0 6px;color:var(--ink)}
hr{border:none;border-top:1px solid var(--line);margin:32px 0 0}
p,li{max-width:70ch;color:var(--ink)}
a{color:var(--accent-strong);text-decoration:none;font-weight:600}
a:hover{text-decoration:underline}
code{background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:.08em .35em;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.9em;color:var(--ink)}
pre{background:var(--side-bg);color:var(--side-ink);border-radius:12px;padding:18px 20px;overflow-x:auto;margin:14px 0}
pre code{background:none;border:none;color:inherit;padding:0}
.pill{display:inline-block;background:var(--accent-soft);color:var(--accent-strong);border-radius:999px;padding:.15em .7em;font-size:12px;font-weight:700;margin-left:8px}
.method{display:inline-block;background:var(--accent);color:var(--accent-ink);border-radius:6px;padding:.05em .5em;font-weight:700;font-size:.85em}
.tbl{overflow-x:auto;margin:18px 0;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
table{border-collapse:collapse;width:100%;min-width:540px;font-size:14.5px}
th,td{text-align:left;padding:13px 18px;border-bottom:1px solid var(--line);vertical-align:top}
table tr:last-child td{border-bottom:none}
tbody tr:nth-child(even){background:var(--surface-2)}
th{color:var(--muted);font-size:11px;letter-spacing:.08em;text-transform:uppercase;background:var(--surface)}
td:first-child{white-space:nowrap}
footer{margin-top:56px;border-top:1px solid var(--line);padding:20px clamp(20px,5vw,36px) clamp(24px,5vw,64px);color:var(--muted);font-size:13px}
footer a{color:var(--muted);text-decoration:underline}
ul,ol{padding-left:22px}
ol li{margin:4px 0}
`;

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ReportRoom — Developer Docs (API & MCP)</title>
<meta property="og:title" content="ReportRoom Developer Docs">
<meta property="og:description" content="REST API + MCP server reference for publishing beautiful, tracked client decks and reports.">
<link rel="icon" type="image/svg+xml" href="${FAVICON_DATA_URI}">
${THEME_SCRIPT}
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700;800&display=swap">
<style>${TOKENS_CSS}
${PAGE_CSS}</style></head><body>
<div class="nav"><a class="brand" href="/" aria-label="ReportRoom home"><span class="brand-light">${WORDMARK_LIGHT_SVG}</span><span class="brand-dark">${WORDMARK_DARK_SVG}</span></a>
<button type="button" class="theme-toggle" onclick="rrToggleTheme()" aria-label="Toggle dark mode">🌓</button></div>
<div class="wrap hero">
<p class="eyebrow">Developer Docs</p>
<h1>ReportRoom API &amp; MCP</h1>
<p>The publishing layer AI agents call directly: one call turns a deck or report into a beautiful, tracked live URL — and reports back who viewed it.</p>
<ul class="endpoints">
<li><a class="chip" href="https://reportroom.io"><span class="k">Site</span> reportroom.io</a></li>
<li><span class="chip"><span class="k">API</span> <code>https://api.reportroom.io</code></span></li>
<li><span class="chip"><span class="k">MCP</span> <code>https://mcp.reportroom.io/mcp</code></span></li>
<li><a class="chip" href="/llms.txt"><span class="k">Agents</span> <code>llms.txt</code></a></li>
</ul>

${BODY}
</div>
<footer><div class="wrap">© ReportRoom · a She Just Works company · source: <a href="https://github.com/dashaworks/reportroom-docs">github.com/dashaworks/reportroom-docs</a></div></footer>
</body></html>`;

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/llms.txt") return new Response(LLMS, { headers: { "content-type": "text/plain; charset=utf-8" } });
    if (url.pathname === "/api" || url.pathname === "/mcp") return Response.redirect("https://docs.reportroom.io/#" + url.pathname.slice(1), 302);
    return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
  },
} satisfies ExportedHandler;
