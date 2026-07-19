# MCP server

ReportRoom ships a Model Context Protocol server so agents (Claude Code, Cursor, claude.ai, …) can publish and track documents natively.

- **Endpoint:** `https://mcp.reportroom.io/mcp`
- **Transport:** Streamable HTTP (JSON-RPC over POST). Protocol versions: `2025-11-25`, `2025-06-18`, `2025-03-26`.
- **Auth:** OAuth 2.1 (claude.ai and other connectors) **or** `Authorization: Bearer rr_live_…` (Claude Code). No key yet? Call the `create_account` tool — it returns one.

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

**claude.ai (web & desktop):** Settings → Connectors → **Add custom connector** →
paste `https://mcp.reportroom.io/mcp` → Connect. ReportRoom is a full OAuth 2.1
authorization server, so the client discovers auth automatically and walks you through
sign-in — no key to paste. (Requires a plan that allows custom connectors.)

**ChatGPT:** custom MCP connectors run in **Developer mode** (Plus, Pro, Team,
Enterprise, or Edu — not Free).
1. Settings → **Apps & Connectors** → Advanced → turn on **Developer mode**.
2. Settings → Connectors → **Create** → name it "ReportRoom", set the connector URL to
   `https://mcp.reportroom.io/mcp`.
3. Authenticate when prompted (OAuth).

**Codex CLI:** add a streamable-HTTP server to `~/.codex/config.toml`, then sign in:
```toml
[mcp_servers.reportroom]
url = "https://mcp.reportroom.io/mcp"
# optional — API key instead of OAuth:
# bearer_token_env_var = "REPORTROOM_KEY"
```
```bash
codex mcp login reportroom   # OAuth sign-in
# verify with /mcp in the Codex TUI
```

### OAuth endpoints (for connectors that discover auth automatically)

- **Protected-resource metadata (RFC 9728):** `GET /.well-known/oauth-protected-resource`
- **Authorization-server metadata (RFC 8414):** `GET /.well-known/oauth-authorization-server`
- **Dynamic Client Registration (RFC 7591):** `POST /oauth/register`
- **Authorization Code + PKCE (S256):** `GET /oauth/authorize` → `POST /oauth/token` (+ `refresh_token`)

Auth-required tools answer `401` with a `WWW-Authenticate` challenge pointing at the
metadata above, which is what kicks off the connector's OAuth flow. Discovery and
`create_account` stay open so agents can bootstrap with zero setup.

## Tools

| Tool | Purpose | Auth |
|---|---|---|
| `create_account` | Bootstrap a free account; returns an API key (shown once) | no |
| `get_design_system` | Design tokens + component snippets + rules — call **before** authoring HTML | no |
| `list_themes` | Available design themes | no |
| `lint_document` | Pre-flight check HTML before publish | no |
| `publish` | Publish/update a deck or report (Mode A `html` or Mode B `content`+`type`); idempotent on `slug`; returns the full live URL. **Requires a verified email** | yes |
| `list_documents` | List your published documents | yes |
| `unpublish` | Retire a live document: its URL returns `410 Gone` and the plan slot frees. Idempotent | yes |
| `republish` | Bring an unpublished document back live (re-checks the email gate + plan quota) | yes |
| `get_analytics` | Per-document views + a summary you can relay to the human | yes |
| `account_status` | Tier, limits, how to verify | yes |
| `set_handle` | Rename your account's subdomain (handle); moves all your docs, old links redirect | yes |

Every tool returns human-readable text plus `structuredContent`; errors set `isError` with actionable guidance.

## URLs

Each account gets a **handle** — a subdomain, auto-generated on signup (an opaque token like `u7k2m9qp`) and renameable any time via `set_handle` (e.g. to `acme`). Published docs live at `https://<handle>.reportroom.io/<slug>`.

**Publishing requires a verified email.** A new account gets an API key but is `unverified`; `publish` fails with `email_unverified` until the human clicks the verification link (check the inbox after `create_account`). While unverified, `account_status` reports a preview base on `rrpreview.com` (noindex) — the base your links will use once verified; you can't publish there beforehand.

`publish` is idempotent on `slug` (per account) and returns the full `url` in `structuredContent`.

## Recommended flow
`create_account` (then have the human **verify their email** — publishing is blocked until they do) → `get_design_system` → author self-contained HTML following the tokens → `lint_document` → `publish` → later, `get_analytics` to report back who viewed it. Optionally `set_handle` once to pick a nicer subdomain (old links redirect), and `unpublish`/`republish` to retire or restore a document.
