/**
 * docs.reportroom.io — on-brand single-page developer docs + llms.txt.
 *
 * Content comes from the repo-root markdown (api.md, mcp.md, llms.txt) — the
 * single source of truth — compiled at build time into content.generated.ts
 * by scripts/gen-content.mjs (`npm run gen`, wired into `npm run deploy` and CI).
 * Only the page shell (head, CSS, hero, footer) is hand-authored here.
 */
import { LLMS, BODY } from "./content.generated";

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ReportRoom — Developer Docs (API & MCP)</title>
<meta property="og:title" content="ReportRoom Developer Docs">
<meta property="og:description" content="REST API + MCP server reference for publishing beautiful, tracked client decks and reports.">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700;800&display=swap">
<style>
:root{--coral:#FF5E5B;--cyan:#00CECB;--banana:#FFED66;--ivory:#FFFFEA;--grey:#D8D8D8;--ink:#201E1A;--mute:#6E6A5F}
*{box-sizing:border-box;margin:0}
body{font-family:'Inter Tight',sans-serif;background:var(--ivory);color:var(--ink);line-height:1.55}
.wrap{max-width:820px;margin:0 auto;padding:clamp(24px,5vw,64px) clamp(20px,5vw,36px)}
.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--coral);font-weight:700}
h1{font-size:clamp(38px,6vw,64px);line-height:.98;letter-spacing:-.03em;font-weight:800;margin:10px 0 6px}
h2{font-size:clamp(24px,3.5vw,34px);letter-spacing:-.02em;margin:44px 0 4px;border-top:2px solid var(--grey);padding-top:28px}
h3{font-size:19px;margin:22px 0 6px}
h4{font-size:16px;margin:18px 0 6px}
hr{border:none;border-top:1px solid var(--grey);margin:32px 0 0}
p,li{max-width:70ch;color:#33312a}
a{color:var(--coral);text-decoration:none}a:hover{text-decoration:underline}
code{background:#fff;border:1px solid var(--grey);border-radius:6px;padding:.08em .35em;font-family:ui-monospace,Menlo,monospace;font-size:.9em}
pre{background:var(--ink);color:var(--ivory);border-radius:12px;padding:18px 20px;overflow-x:auto;margin:14px 0}
pre code{background:none;border:none;color:inherit;padding:0}
.pill{display:inline-block;background:var(--banana);color:var(--ink);border-radius:999px;padding:.15em .7em;font-size:12px;font-weight:700;margin-left:8px}
.method{display:inline-block;background:var(--cyan);color:var(--ink);border-radius:6px;padding:.05em .5em;font-weight:700;font-size:.85em}
.tbl{overflow-x:auto;margin:18px 0;border:1px solid var(--grey);border-radius:12px;background:#fff}
table{border-collapse:collapse;width:100%;min-width:540px;font-size:14.5px}
th,td{text-align:left;padding:13px 18px;border-bottom:1px solid var(--grey);vertical-align:top}
table tr:last-child td{border-bottom:none}
tbody tr:nth-child(even){background:#fbfbf3}
th{color:var(--mute);font-size:11px;letter-spacing:.08em;text-transform:uppercase;background:#fff}
td:first-child{white-space:nowrap}
footer{margin-top:56px;border-top:1px solid var(--grey);padding-top:20px;color:var(--mute);font-size:13px}
ul,ol{padding-left:22px}
ol li{margin:4px 0}
</style></head><body><div class="wrap">
<p class="eyebrow">Developer Docs</p>
<h1>ReportRoom API &amp; MCP</h1>
<p>The publishing layer AI agents call directly: one call turns a deck or report into a beautiful, tracked live URL — and reports back who viewed it.</p>
<p><a href="https://reportroom.io">reportroom.io</a> · API <code>https://api.reportroom.io</code> · MCP <code>https://mcp.reportroom.io/mcp</code> · <a href="/llms.txt">llms.txt</a></p>

${BODY}

<footer>© ReportRoom · a She Just Works company · source: <a href="https://github.com/dashaworks/reportroom-docs">github.com/dashaworks/reportroom-docs</a></footer>
</div></body></html>`;

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/llms.txt") return new Response(LLMS, { headers: { "content-type": "text/plain; charset=utf-8" } });
    if (url.pathname === "/api" || url.pathname === "/mcp") return Response.redirect("https://docs.reportroom.io/#" + url.pathname.slice(1), 302);
    return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
  },
} satisfies ExportedHandler;
