/** docs.reportroom.io — on-brand single-page developer docs + raw markdown/llms.txt. */
const MD: Record<string, string> = {}; // markdown served from KV/inline is optional; llms.txt inlined below

const LLMS = `# ReportRoom
> Publishing layer AI agents call directly: one API/MCP call -> a beautiful, analytics-instrumented live URL.
## Docs
- REST API: https://docs.reportroom.io/api
- MCP: https://docs.reportroom.io/mcp
## Endpoints
- API base: https://api.reportroom.io
- MCP: https://mcp.reportroom.io/mcp
## Quickstart
- MCP: claude mcp add --transport http reportroom https://mcp.reportroom.io/mcp ; call create_account, then publish
- REST: POST /v1/signup {email} -> api_key ; POST /v1/sites {content, content_format:"markdown", type:"deck", slug}
`;

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
p,li{max-width:70ch;color:#33312a}
a{color:var(--coral);text-decoration:none}a:hover{text-decoration:underline}
code{background:#fff;border:1px solid var(--grey);border-radius:6px;padding:.08em .35em;font-family:ui-monospace,Menlo,monospace;font-size:.9em}
pre{background:var(--ink);color:var(--ivory);border-radius:12px;padding:18px 20px;overflow-x:auto;margin:14px 0}
pre code{background:none;border:none;color:inherit;padding:0}
.pill{display:inline-block;background:var(--banana);color:var(--ink);border-radius:999px;padding:.15em .7em;font-size:12px;font-weight:700;margin-left:8px}
.method{display:inline-block;background:var(--cyan);color:var(--ink);border-radius:6px;padding:.05em .5em;font-weight:700;font-size:.85em}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--grey)}
th{color:var(--mute);font-size:12px;letter-spacing:.06em;text-transform:uppercase}
footer{margin-top:56px;border-top:1px solid var(--grey);padding-top:20px;color:var(--mute);font-size:13px}
ul{padding-left:20px}
</style></head><body><div class="wrap">
<p class="eyebrow">Developer Docs</p>
<h1>ReportRoom API &amp; MCP</h1>
<p>The publishing layer AI agents call directly: one call turns a deck or report into a beautiful, tracked live URL — and reports back who viewed it.</p>
<p><a href="https://reportroom.io">reportroom.io</a> · API <code>https://api.reportroom.io</code> · MCP <code>https://mcp.reportroom.io/mcp</code> · <a href="/llms.txt">llms.txt</a></p>

<h2>Quickstart <span class="pill">MCP</span></h2>
<pre><code>claude mcp add --transport http reportroom https://mcp.reportroom.io/mcp</code></pre>
<p>Then call the <code>create_account</code> tool, save the API key it returns, and use <code>publish</code>.</p>

<h2>Quickstart <span class="pill">REST</span></h2>
<pre><code># 1. get an API key (shown once)
curl -sX POST https://api.reportroom.io/v1/signup \\
  -H 'content-type: application/json' -d '{"email":"you@example.com"}'

# 2. publish a markdown deck
curl -sX POST https://api.reportroom.io/v1/sites \\
  -H "authorization: Bearer rr_live_..." -H 'content-type: application/json' \\
  -d '{"content":"# Hello\\n\\nMy first **deck**.","content_format":"markdown","type":"deck","slug":"hello"}'</code></pre>

<h2>Authentication</h2>
<p>Bearer API key: <code>Authorization: Bearer rr_live_…</code> (from <code>/v1/signup</code> or the MCP <code>create_account</code> tool; shown once). New accounts are <b>unverified</b> — sites publish to <code>&lt;slug&gt;.rrpreview.com</code> with <code>noindex</code> until you verify your email, then auto-migrate to <code>reportroom.io</code>.</p>

<h2>REST endpoints</h2>
<table>
<tr><th>Method</th><th>Path</th><th>Purpose</th></tr>
<tr><td><span class="method">POST</span></td><td>/v1/signup</td><td>Create account, get API key</td></tr>
<tr><td><span class="method">GET</span></td><td>/v1/verify?token=</td><td>Verify email, migrate sites</td></tr>
<tr><td><span class="method">POST</span></td><td>/v1/sites</td><td>Publish/update (idempotent on slug)</td></tr>
<tr><td><span class="method">GET</span></td><td>/v1/sites</td><td>List your sites</td></tr>
<tr><td><span class="method">GET</span></td><td>/v1/sites/{slug}/analytics</td><td>Views + summary message</td></tr>
<tr><td><span class="method">POST</span></td><td>/v1/lint</td><td>Pre-flight check HTML</td></tr>
<tr><td><span class="method">GET</span></td><td>/v1/design-system</td><td>Tokens, components, rules</td></tr>
<tr><td><span class="method">POST</span></td><td>/v1/report-abuse</td><td>Report a page</td></tr>
</table>

<h3>Publish body</h3>
<p>Provide <b>either</b> <code>html</code> (Mode A — self-contained HTML; call <code>get_design_system</code> first) <b>or</b> <code>content</code> + <code>content_format:"markdown"</code> + <code>type:"deck"|"report"</code> (Mode B). <code>slug</code> is optional and idempotent. Rich charts: embed <code>&lt;script type="application/json" data-qd-chart&gt;{…ECharts option…}&lt;/script&gt;</code> — rendered to static SVG at publish.</p>

<h2>MCP tools</h2>
<table>
<tr><th>Tool</th><th>Purpose</th><th>Auth</th></tr>
<tr><td>create_account</td><td>Bootstrap a free account + API key</td><td>no</td></tr>
<tr><td>get_design_system</td><td>Tokens + snippets + rules (call first)</td><td>no</td></tr>
<tr><td>list_themes</td><td>Available themes</td><td>no</td></tr>
<tr><td>lint_document</td><td>Pre-flight check HTML</td><td>no</td></tr>
<tr><td>publish</td><td>Publish/update a deck or report</td><td>yes</td></tr>
<tr><td>list_sites</td><td>List your sites</td><td>yes</td></tr>
<tr><td>get_analytics</td><td>Views + a summary to relay</td><td>yes</td></tr>
<tr><td>account_status</td><td>Tier, limits, verify</td><td>yes</td></tr>
</table>
<p>Recommended flow: <code>get_design_system</code> → author HTML → <code>lint_document</code> → <code>publish</code> → <code>get_analytics</code>.</p>

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
