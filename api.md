# REST API reference

Base URL: `https://api.reportroom.io` · Versioned under `/v1`.

## Authentication
Most endpoints require an API key as a bearer token:
```
Authorization: Bearer rr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Get one from `POST /v1/signup` (or the MCP `create_account` tool). Keys are shown once — store them securely. `rr_test_...` keys work against a sandbox.

Errors are JSON: `{ "error": { "code": "STRING_CODE", "message": "what to do" } }`. Codes include `UNAUTHENTICATED`, `INVALID_BODY`, `INVALID_EMAIL`, `DISPOSABLE_EMAIL`, `EMAIL_EXISTS`, `INVALID_SLUG`, `SITE_NOT_FOUND`, `RATE_LIMITED`.

## Trust tiers
New accounts are **unverified**: sites publish to a preview domain (`<slug>.rrpreview.com`) with `noindex`, and you have 24h to verify your email. On verification, sites auto-migrate to `<slug>.reportroom.io` (old links 301-redirect). Verified free and paid accounts publish straight to `reportroom.io`.

---

## POST /v1/signup
Create a free account and receive an API key (shown once). Rate-limited per IP.
```json
Request:  { "email": "you@example.com", "name": "Optional" }
Response: { "data": { "user_id": "usr_…", "org_id": "org_…",
                      "api_key": "rr_live_…", "tier": "unverified", "message": "…" } }
```
A verification email is sent to the address.

## GET /v1/verify?token=…
Consumes the emailed verification token, upgrades the account to `verified`, and migrates any preview sites to `reportroom.io`.

## POST /v1/sites
Publish or update a site. **Idempotent on `slug`** — reuse a slug to update in place. Requires auth. Provide **either** `html` (Mode A) **or** `content` + `content_format` + `type` (Mode B).
```json
Request (Mode A): { "html": "<!doctype html>…", "slug": "acme-pitch", "title": "Acme" }
Request (Mode B): { "content": "# Title\n\nBody\n\n---\n\n## Slide 2",
                    "content_format": "markdown", "type": "deck", "slug": "acme-pitch", "theme": "vibrant" }
Response: { "data": { "url": "https://acme-pitch.reportroom.io", "site_id": "site_…",
                      "slug": "acme-pitch", "version": 1, "chartsRendered": 1, "message": "…" } }
```
- Mode A HTML is sanitized (scripts stripped; call `get_design_system` first for on-brand output).
- Rich charts: embed `<script type="application/json" data-qd-chart>{…ECharts option…}</script>` — rendered to static SVG at publish.
- `slug` optional (auto-generated if omitted). Reserved slugs (`api`, `app`, `admin`, …) are rejected.

## GET /v1/sites
List the account's published sites. `?limit=` (default 20). Requires auth.

## GET /v1/sites/{slug}/analytics
Per-site view stats + a ready-to-relay summary. Requires auth.
```json
Response: { "data": { "slug": "acme-pitch", "url": "https://acme-pitch.reportroom.io",
                      "views7d": 42, "byDay": [{ "day": "2026-07-05", "views": 8 }, …],
                      "message": "\"Acme\" got 42 views in the last 7 days…" } }
```

## POST /v1/lint
Pre-flight check an HTML document before publishing (missing viewport/og, stripped scripts, off-brand). No auth.
```json
Request:  { "html": "<!doctype html>…" }
Response: { "data": { "ok": true, "issues": [ { "level": "warning", "code": "no-og-title", "message": "…" } ] } }
```

## GET /v1/design-system?theme=
Returns the design tokens, component snippets, layout shells, and rules an agent should follow **before** authoring HTML. No auth.

## POST /v1/report-abuse
Report an abusive published page. No auth, rate-limited.
```json
Request: { "url": "https://bad-slug.reportroom.io", "reason": "phishing" }
```
