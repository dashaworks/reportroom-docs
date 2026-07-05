# MCP server

ReportRoom ships a Model Context Protocol server so agents (Claude Code, Cursor, claude.ai, …) can publish and track documents natively.

- **Endpoint:** `https://mcp.reportroom.io/mcp`
- **Transport:** Streamable HTTP (JSON-RPC over POST). Protocol versions: `2025-11-25`, `2025-06-18`, `2025-03-26`.
- **Auth:** `Authorization: Bearer rr_live_…`. No key yet? Call the `create_account` tool — it returns one.

## Connect

**Claude Code:**
```bash
claude mcp add --transport http reportroom https://mcp.reportroom.io/mcp
# in a session:
#   1) call create_account (email) -> save the api_key
#   2) re-add with the key:
claude mcp add --transport http reportroom https://mcp.reportroom.io/mcp \
  --header "Authorization: Bearer rr_live_..."
```

## Tools

| Tool | Purpose | Auth |
|---|---|---|
| `create_account` | Bootstrap a free account; returns an API key (shown once) | no |
| `get_design_system` | Design tokens + component snippets + rules — call **before** authoring HTML | no |
| `list_themes` | Available design themes | no |
| `lint_document` | Pre-flight check HTML before publish | no |
| `publish` | Publish/update a deck or report (Mode A `html` or Mode B `content`+`type`); idempotent on `slug` | yes |
| `list_sites` | List your published sites | yes |
| `get_analytics` | Per-site views + a summary you can relay to the human | yes |
| `account_status` | Tier, limits, how to verify | yes |

Every tool returns human-readable text plus `structuredContent`; errors set `isError` with actionable guidance.

## Recommended flow
`get_design_system` → author self-contained HTML following the tokens → `lint_document` → `publish` → later, `get_analytics` to report back who viewed it.
