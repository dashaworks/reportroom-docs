# ReportRoom Docs

Public developer documentation for the **ReportRoom** REST API and MCP server.

ReportRoom is the publishing layer AI agents call directly: one API/MCP call turns a
deck or report into a beautiful, analytics-instrumented live URL — and reports back who
viewed it.

- **Docs site:** https://docs.reportroom.io
- **API base:** `https://api.reportroom.io`
- **MCP endpoint:** `https://mcp.reportroom.io/mcp`
- **Agent index:** https://docs.reportroom.io/llms.txt

## Quickstart

**Claude Code (MCP):**
```bash
claude mcp add --transport http reportroom https://mcp.reportroom.io/mcp
```
Then call the `create_account` tool, save the API key it returns, and use `publish`.

**REST:**
```bash
# 1. get an API key
curl -sX POST https://api.reportroom.io/v1/signup \
  -H 'content-type: application/json' -d '{"email":"you@example.com"}'

# 2. publish (Mode B: markdown -> deck)
curl -sX POST https://api.reportroom.io/v1/documents \
  -H "authorization: Bearer rr_live_..." -H 'content-type: application/json' \
  -d '{"content":"# Hello\n\nMy first **deck**.","content_format":"markdown","type":"deck","slug":"hello"}'
```

See [`api.md`](./api.md) and [`mcp.md`](./mcp.md) for the full reference.

## Editing the docs

`api.md`, `mcp.md`, and `llms.txt` at the repo root are the **single source of truth**.
The docs.reportroom.io worker page is generated from them: run `npm run gen` in
`worker/` to regenerate `worker/src/content.generated.ts` (never edit that file by
hand — it's overwritten, and `npm run check` fails CI-style if it drifts). Deploys
(`npm run deploy` and the GitHub Action) regenerate automatically.

---
© ReportRoom · a She Just Works company · content licensed CC-BY-4.0
