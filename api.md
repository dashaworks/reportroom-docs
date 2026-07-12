# REST API reference

Base URL: `https://api.reportroom.io` · Versioned under `/v1`.

## Quickstart
```bash
# 1. get an API key (shown once)
curl -sX POST https://api.reportroom.io/v1/signup \
  -H 'content-type: application/json' -d '{"email":"you@example.com"}'

# 2. publish a markdown deck
curl -sX POST https://api.reportroom.io/v1/documents \
  -H "authorization: Bearer rr_live_..." -H 'content-type: application/json' \
  -d '{"content":"# Hello\n\nMy first **deck**.","content_format":"markdown","type":"deck","slug":"hello"}'
```

## Authentication
Most endpoints require an API key as a bearer token:
```
Authorization: Bearer rr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Get one from `POST /v1/signup` (or the MCP `create_account` tool). Keys are shown once — store them securely. `rr_test_...` keys work against a sandbox.

Errors are JSON: `{ "error": { "code": "STRING_CODE", "message": "what to do" } }`. Codes include `UNAUTHENTICATED`, `INVALID_BODY`, `INVALID_EMAIL`, `DISPOSABLE_EMAIL`, `EMAIL_EXISTS`, `INVALID_SLUG`, `DOCUMENT_NOT_FOUND`, `RATE_LIMITED`, `HANDLE_REJECTED`.

## URL model & trust tiers
Every account gets a **handle** — a subdomain, auto-generated at signup (e.g. `dasha-9bfc`) and renameable (see `POST /v1/handle`). Handles are lowercase letters/numbers/hyphens, 2–32 chars. A `slug` is unique **per account** (not global); publishing the same slug again updates in place.

New accounts are **unverified**: documents publish to a preview domain (`https://<handle>.rrpreview.com/<slug>`) with `noindex`, and you have 24h to verify your email. On verification, all preview documents auto-migrate to `https://<handle>.reportroom.io/<slug>` (old preview links 301-redirect). Verified accounts publish straight to `<handle>.reportroom.io`.

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
Consumes the emailed verification token, upgrades the account to `verified`, and migrates any preview documents to `<handle>.reportroom.io`.
```json
Response: { "data": { "tier": "verified",
                      "migrated": [{ "slug": "acme-pitch",
                                     "from": "dasha-9bfc.rrpreview.com/acme-pitch",
                                     "to":   "dasha-9bfc.reportroom.io/acme-pitch" }],
                      "message": "…" } }
```

## POST /v1/documents
Publish or update a document. **Idempotent on `slug`** — reuse a slug to update in place. Requires auth. Provide **either** `html` (Mode A) **or** `content` + `content_format` + `type` (Mode B).
```json
Request (Mode A): { "html": "<!doctype html>…", "slug": "acme-pitch", "title": "Acme" }
Request (Mode B): { "content": "# Title\n\nBody\n\n---\n\n## Slide 2",
                    "content_format": "markdown", "type": "deck", "slug": "acme-pitch", "theme": "vibrant" }
Response: { "data": { "url": "https://dasha-9bfc.reportroom.io/acme-pitch", "documentId": "doc_…",
                      "slug": "acme-pitch", "version": 1, "chartsRendered": 1, "chartErrors": [],
                      "artifactKey": "…", "visibility": "public", "status": "live",
                      "scan": { "verdict": "clean", "score": 0, "reasons": [] },
                      "removalsCount": 0, "message": "…" } }
```
- Mode A HTML is sanitized (scripts stripped; call `get_design_system` first for on-brand output).
- Rich charts: embed `<script type="application/json" data-qd-chart>{…ECharts option…}</script>` — rendered to static SVG at publish.
- `slug` optional (auto-generated if omitted). Reserved slugs (`api`, `app`, `admin`, `mcp`, `dashboard`, …) are rejected.
- Rate limit: 120/hour.

## GET /v1/documents
List the account's published documents. `?limit=` (default 20). Requires auth.

## GET /v1/documents/{slug}/analytics
Per-document view stats + a ready-to-relay summary. Requires auth.
```json
Response: { "data": { "slug": "acme-pitch", "url": "https://dasha-9bfc.reportroom.io/acme-pitch",
                      "views7d": 42, "byDay": [{ "day": "2026-07-05", "views": 8 }, …],
                      "message": "\"Acme\" got 42 views in the last 7 days…" } }
```

## GET /v1/handle
Returns your current handle (subdomain) and its URL base. Requires auth. `url_base` uses `rrpreview.com` while unverified.
```json
Response: { "data": { "handle": "dasha-9bfc", "url_base": "https://dasha-9bfc.reportroom.io" } }
```

## POST /v1/handle
Rename your subdomain. Moves all your docs to the new handle; old links redirect. Requires auth. Returns `400 HANDLE_REJECTED` if the handle is taken, invalid, or reserved.
```json
Request:  { "handle": "acme" }
Response: { "data": { "handle": "acme", "moved": 3, "message": "…" } }
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
Request: { "url": "https://bad-handle.reportroom.io/bad-slug", "reason": "phishing" }
```
