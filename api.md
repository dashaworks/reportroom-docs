# REST API reference

Base URL: `https://api.reportroom.io` · Versioned under `/v1`.

## Quickstart
```bash
# 1. get an API key (shown once)
curl -sX POST https://api.reportroom.io/v1/signup \
  -H 'content-type: application/json' -d '{"email":"you@example.com"}'

# 2. verify your email — click the link we send you. Publishing is blocked until you do.

# 3. publish a markdown deck
curl -sX POST https://api.reportroom.io/v1/documents \
  -H "authorization: Bearer rr_live_..." -H 'content-type: application/json' \
  -d '{"content":"# Hello\n\nMy first **deck**.","content_format":"markdown","type":"deck","slug":"hello"}'
```

## Authentication
Most endpoints require an API key as a bearer token:
```
Authorization: Bearer rr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Get one from `POST /v1/signup` (or the MCP `create_account` tool). Keys are shown once — store them securely. Keys look like `rr_live_` + 32 hex.

**Verify your email before publishing.** A new account receives a key immediately but is `unverified`; publishing stays blocked (`403 email_unverified`) until you click the link we email you. See [URL model & trust tiers](#url-model--trust-tiers).

Errors are JSON: `{ "error": { "code": "STRING_CODE", "message": "what to do" } }`. Codes include `UNAUTHENTICATED`, `INVALID_BODY`, `INVALID_EMAIL`, `DISPOSABLE_EMAIL`, `EMAIL_EXISTS`, `INVALID_TOKEN`, `INVALID_SLUG`, `EMPTY_DOCUMENT`, `INVALID_VISIBILITY`, `CONTENT_BLOCKED`, `email_unverified`, `cap_reached`, `PLAN_REQUIRED`, `FORBIDDEN`, `DOCUMENT_NOT_FOUND`, `RATE_LIMITED`, `HANDLE_REJECTED`.

## URL model & trust tiers
Every account gets a **handle** — a subdomain, auto-generated at signup (an opaque token like `u7k2m9qp`) and renameable to something friendlier like `acme` (see `POST /v1/handle`). Handles are lowercase letters/numbers/hyphens (no leading/trailing or doubled hyphens), 2–32 chars. A `slug` is unique **per account** (not global), 3–63 chars `[a-z0-9-]`; publishing the same slug again updates in place. Verified accounts' documents live at `https://<handle>.reportroom.io/<slug>`.

**Email verification is required to publish.** A fresh account is `unverified`: it gets an API key, but `POST /v1/documents` (and the MCP `publish` tool) return `403 email_unverified` until you click the verification link we email you. `GET /v1/verify?token=…` flips the account to `verified` and unlocks publishing. While unverified, `GET /v1/handle` reports a preview base on `rrpreview.com` (noindex) — this is the base your links *will* use once verified; you can't publish to it beforehand. Verification links are valid 24h; request a fresh one from your dashboard if it lapses.

---

## POST /v1/signup
Create a free account and receive an API key (shown once). Rate-limited per IP.
```json
Request:  { "email": "you@example.com", "name": "Optional" }
Response: { "data": { "user_id": "usr_…", "org_id": "org_…",
                      "api_key": "rr_live_…", "tier": "unverified", "message": "…" } }
```
A verification email is sent to the address. The account starts `unverified` — **you must verify before publishing** (see above). Rate-limited to 5/hour per IP.

## GET /v1/verify?token=…
Consumes the emailed verification token and upgrades the account to `verified`, which **unlocks publishing**. Any documents already on the preview domain migrate to `<handle>.reportroom.io` (old preview links 301-redirect); in the normal verify-then-publish flow you have none yet, so `migrated` is empty. Rate-limited 30/hour per IP. Returns `400 INVALID_TOKEN` if the token is missing, invalid, or expired. The link opens a human-friendly HTML page in a browser (`Accept: text/html`) and returns JSON otherwise.
```json
Response: { "data": { "tier": "verified", "migrated": [], "message": "…" } }
```

## POST /v1/documents
Publish or update a document. **Idempotent on `slug`** — reuse a slug to update in place. Requires auth. Provide **either** `html` (Mode A) **or** `content` + `content_format` + `type` (Mode B).
```json
Request (Mode A): { "html": "<!doctype html>…", "slug": "acme-pitch", "title": "Acme" }
Request (Mode B): { "content": "# Title\n\nBody\n\n---\n\n## Slide 2",
                    "content_format": "markdown", "type": "deck", "slug": "acme-pitch", "theme": "vibrant" }
Response: { "data": { "url": "https://acme.reportroom.io/acme-pitch", "documentId": "doc_…",
                      "slug": "acme-pitch", "version": 1, "chartsRendered": 1, "chartErrors": [],
                      "artifactKey": "…", "visibility": "public", "status": "live",
                      "scan": { "verdict": "clean", "score": 0, "reasons": [] },
                      "removalsCount": 0, "message": "…" } }
```
- **Requires a verified email** — returns `403 email_unverified` otherwise (see [trust tiers](#url-model--trust-tiers)).
- Mode A HTML is sanitized (scripts stripped; call `get_design_system` first for on-brand output).
- Rich charts: embed `<script type="application/json" data-qd-chart>{…ECharts option…}</script>` — rendered to static SVG at publish.
- `slug` optional (auto-generated if omitted). Reserved slugs (`api`, `app`, `admin`, `mcp`, `dashboard`, …) are rejected.
- Optional `replace_slug`: retire one of your live documents to free a plan slot for this publish. Optional `visibility`: `public` (default) or `team` (members-only; needs an active Team or Business plan, else `403 PLAN_REQUIRED`).
- At the plan's document cap, publishing a *new* slug returns `409 cap_reached` (the response lists your live docs) — reuse a slug or pass `replace_slug`.
- Rate limit: 120/hour.

## GET /v1/documents
List the account's published documents. `?limit=` (default 20). Requires auth.

## POST /v1/documents/{slug}/unpublish
Retire one of your live documents: its URL starts returning `410 Gone` and the plan slot is freed. Idempotent. Requires auth. Returns `404 DOCUMENT_NOT_FOUND` if you don't own a live doc with that slug.
```json
Response: { "data": { "slug": "acme-pitch", "status": "unpublished" } }
```

## POST /v1/documents/{slug}/republish
Bring a previously-unpublished document back live. Re-checks the email gate and plan quota exactly like `publish` (so it can return `403 email_unverified` or `409 cap_reached`). Requires auth. `404 DOCUMENT_NOT_FOUND` if no unpublished doc with that slug is yours.
```json
Response: { "data": { "slug": "acme-pitch", "status": "live" } }
```

## GET /v1/documents/{slug}/analytics
Per-document view stats + a ready-to-relay summary. Requires auth.
```json
Response: { "data": { "slug": "acme-pitch", "url": "https://acme.reportroom.io/acme-pitch",
                      "views7d": 42, "byDay": [{ "day": "2026-07-05", "views": 8 }, …],
                      "message": "\"Acme\" got 42 views in the last 7 days…" } }
```

## GET /v1/handle
Returns your current handle (subdomain) and its URL base. Requires auth. `url_base` uses `rrpreview.com` while unverified.
```json
Response: { "data": { "handle": "acme", "url_base": "https://acme.reportroom.io" } }
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
