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

Errors are JSON: `{ "error": { "code": "STRING_CODE", "message": "what to do" } }`. The HTTP status carries the class; the `code` string is the stable machine-readable label (**match on the literal string** — casing is inconsistent by design, e.g. `cap_reached` vs `PLAN_REQUIRED`). MCP tools return the **same** code strings inside `structuredContent` with `isError: true`. Common codes by area:

- **Auth / account:** `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `email_unverified` (403), `INVALID_TOKEN` (400), `INVALID_EMAIL`, `DISPOSABLE_EMAIL`, `EMAIL_EXISTS` (409), `HANDLE_REJECTED`, `USER_NOT_FOUND` (404).
- **Publish / documents:** `INVALID_BODY`, `EMPTY_DOCUMENT`, `INVALID_SLUG`, `INVALID_VISIBILITY`, `INVALID_COVER_IMAGE`, `IMAGE_LIMIT` (>20 images), `CONTENT_BLOCKED`, `bad_replace`, `cap_reached` (409, carries `cap` + `live[]`), `PLAN_REQUIRED` (403, `team` visibility), `DOCUMENT_NOT_FOUND` (404).
- **Images:** `too_large` (413, >2 MB), `unsupported_format` (400), `content_blocked` / `held_for_review` (422), `cap_reached` (409, carries `cap` + `used`); branding: `NOT_FOUND`, `NOT_BRAND`, `NOT_PUBLIC`.
- **Export:** `INSUFFICIENT_CREDITS` (402, carries `required` + `balance`), `IDEMPOTENCY_CONFLICT` (402), `INVALID_IDEMPOTENCY_KEY` (400), `EXPORT_UNSUPPORTED_VISIBILITY` (400), `RENDER_FAILED` / `STORAGE_FAILED` (502).
- **Data rooms:** `ROOM_NOT_FOUND` (404), `VIEWER_NOT_FOUND` (404), `ROOM_LIMIT` (409, ≤10 rooms), `VIEWER_LIMIT` (409, ≤200 viewers), `plan_required` / `PLAN_REQUIRED` (403, Business).
- **Custom domains:** `INVALID_HOSTNAME`, `DOMAIN_TAKEN` (409), `DOMAIN_NOT_FOUND` (404), `PAYMENT_REQUIRED` / `plan_required` (403), `CF_ERROR` (502).
- **Cross-cutting:** `RATE_LIMITED` (429), `NOT_FOUND` (404), `TOO_LARGE` (413), `NOT_CONFIGURED` (503).

## URL model & trust tiers
Every account gets a **handle** — a subdomain, auto-generated at signup (an opaque token like `u7k2m9qp`) and renameable to something friendlier like `acme` (see `POST /v1/handle`). Handles are lowercase letters/numbers/hyphens (no leading/trailing or doubled hyphens), 2–32 chars. A `slug` is unique **per account** (not global), 3–63 chars `[a-z0-9-]`; publishing the same slug again updates in place. Verified accounts' documents live at `https://<handle>.reportroom.io/<slug>`.

**Email verification is required to publish.** A fresh account is `unverified`: it gets an API key, but `POST /v1/documents` (and the MCP `publish` tool) return `403 email_unverified` until you click the verification link we email you. `GET /v1/verify?token=…` flips the account to `verified` and unlocks publishing. While unverified, `GET /v1/handle` reports a preview base on `rrpreview.com` (noindex) — this is the base your links *will* use once verified; you can't publish to it beforehand. Verification links are valid 24h; request a fresh one from your dashboard if it lapses.

## Plans & limits
Limits are per **workspace** (org). Hitting a cap returns `409 cap_reached` (documents/images) or `403 PLAN_REQUIRED`/`plan_required`/`PAYMENT_REQUIRED` (gated features). Pricing lives at [reportroom.io](https://reportroom.io); the API only enforces the limits below.

| Plan | Live documents | Images | `team` visibility | Custom domains | Data rooms |
|---|---|---|---|---|---|
| Free | 10 | 10 | — | — | — |
| Pro | 100 | 100 | — | — | — |
| Team | unlimited | 500 | ✓ | ✓ | — |
| Business | unlimited | 1000 | ✓ | ✓ | ✓ |

New accounts get **100 trial credits** (used by credit-metered actions like [PDF export](#post-v1documentsslugexport), 5 credits each). Team is billed per seat; Business bundles 3 seats.

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
                      "slug": "acme-pitch", "version": 1,
                      "chartsRendered": 1, "chartErrors": [],
                      "imagesRendered": 2, "imageErrors": [],
                      "artifactKey": "…", "visibility": "public", "status": "live",
                      "scan": { "verdict": "clean", "score": 0, "reasons": [] },
                      "removalsCount": 0, "message": "…" } }
```
> The **MCP `publish`** tool returns the same data as `structuredContent` but in snake_case (`document_id`, `charts_rendered`, `images_rendered`, …) and omits `artifactKey`, `visibility`, `scan`, and `removalsCount`. There's no `content_format` on the MCP tool — `content` is always treated as markdown.

- **Requires a verified email** — returns `403 email_unverified` otherwise (see [trust tiers](#url-model--trust-tiers)).
- Mode A HTML is sanitized (scripts stripped; call `get_design_system` first for on-brand output).
- Rich charts: embed `<script type="application/json" data-qd-chart>{…ECharts option…}</script>` — rendered to static SVG at publish.
- **Images**: reference hosted images (see [POST /v1/images](#post-v1images)) by their `path`. An image-only paragraph renders as a styled figure (an adjacent *italic* line becomes its caption); consecutive image-only paragraphs become a responsive gallery grid. Up to 20 images per document.
- Optional `cover_image` (a `/v1/images` `path` or an https URL): full-bleed cover behind a deck's first slide, or a top band on a report. Counts toward the 20-image budget; a bad value is `400 INVALID_COVER_IMAGE`.
- If your workspace has a logo set ([branding](#get-v1branding)), each publish adds a small badge to the document automatically.
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

## POST /v1/documents/{slug}/export
Render one of your **live** documents to a print-quality PDF (A4, backgrounds included) and return the bytes (`content-type: application/pdf`). Requires auth. **Costs 5 credits**, charged only when the render succeeds — a failed render is never charged. Public/unlisted documents only for now (`400 EXPORT_UNSUPPORTED_VISIBILITY` for team-gated docs).
```
curl -X POST https://api.reportroom.io/v1/documents/acme-pitch/export \
  -H "authorization: Bearer rr_live_..." \
  -H "Idempotency-Key: my-export-1" -o acme-pitch.pdf
```
- `Idempotency-Key` (optional, 1–64 chars): a retried export with the same key re-renders but **charges exactly once** per document version. Response headers `x-export-charged` and `x-export-credits-remaining` report the burn.
- `402 INSUFFICIENT_CREDITS` (with `required` and `balance`) when the wallet can't cover it — top up from the dashboard.
- Rate limit: 20/hour.

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

## POST /v1/images
Upload an image to reference in your documents. Requires auth + a verified email. Body is the **raw image bytes** (set the content-type) or JSON `{ "data": "<base64>", "kind"?, "visibility"? }`. PNG, JPEG, WebP or GIF (magic-byte validated — no SVG), **2 MB max**. Identical bytes at the same visibility dedupe to one slot.
```json
Response 201: { "data": { "id": "img_…", "url": "https://acme.reportroom.io/_img/org_…/<sha256>.png",
                          "path": "/_img/org_…/<sha256>.png", "kind": "doc", "visibility": "public",
                          "sha256": "…", "bytes": 12345, "content_type": "image/png", "deduped": false } }
```
- Query/body options: `kind=brand` (a logo asset — doesn't count against any per-document budget) · `visibility=team` (serves only to signed-in workspace members; needs Team/Business, else `403 PLAN_REQUIRED`).
- Reference the host-agnostic `path` in your HTML/markdown — it survives handle renames.
- Plan caps (total images per workspace): Free 10 · Pro 100 · Team 500 · Business 1000. At cap: `409 cap_reached` with `cap` and `used`.
- Rate limit: 120/hour.

## GET /v1/images
List your images (newest first) with usage: `{ "data": { "images": […], "used": 7, "cap": 100 } }`. Requires auth.

## DELETE /v1/images/{id}
Delete an image — frees its quota slot immediately and stops its URLs serving (public image URLs may stay cached up to 1h). Requires auth. `404 NOT_FOUND` if it isn't yours.

## GET /v1/branding · PUT /v1/branding · DELETE /v1/branding
Your workspace logo. Once set, **every document you publish afterwards** carries a small logo badge (changes reach each doc on its next publish). Requires auth; `PUT`/`DELETE` need the owner or an admin role.
```json
PUT request:  { "image_id": "img_…" }   // must be YOUR image with kind=brand and visibility=public
GET response: { "data": { "logo": { "image_id": "img_…", "path": "/_img/…", "url": "https://…" } } }
```
`PUT` validation errors are distinct: `404 NOT_FOUND` (not your image / deleted), `400 NOT_BRAND` (upload it with `kind=brand`), `400 NOT_PUBLIC` (a team-visibility image would break on public documents). `DELETE` clears the logo (idempotent).

## GET /v1/account
Account status: `handle`, `tier`, `url_base`, `org_kind` (`personal`/`team`), your `role` in a team workspace, and `scopes`. Requires auth.

Account **deletion** is not agent-reachable: `DELETE /v1/account` exists but accepts **only a dashboard session** (guarded by typed-email confirmation). An API key or MCP token is rejected `403 FORBIDDEN`, so a leaked credential can never destroy the account that owns it.

## Data rooms (Business)
A **data room** is a named, access-controlled bundle of your documents shared with identified external viewers at one link — for deal/diligence workflows with per-viewer engagement tracking. **Business plan only**, owner/admin role. Documents stay first-class: adding one to a room never unpublishes it, and a document that's in a live room is blocked at its own standalone URL so the gate can't be bypassed. The same operations are first-class [MCP tools](./mcp.md#tools) — most agents drive rooms from there.

Rooms serve on your handle host: `https://<handle>.reportroom.io/room/<slug>` (and `/room/<slug>/<doc-slug>` per document). Limits: **10 live rooms per workspace, 200 viewers per room.**

| Endpoint | Purpose |
|---|---|
| `POST /v1/rooms` | Create a room: `{ name, slug?, access_mode?, passcode?, settings? }` → `{ data: { room } }` |
| `GET /v1/rooms` | List your rooms |
| `GET /v1/rooms/{id}` | One room + its `documents` and `viewers` |
| `PATCH /v1/rooms/{id}` | Update `access_mode`, `passcode` (string sets/rotates, `null` clears), `settings`, `status` (`live`/`archived`) |
| `PUT /v1/rooms/{id}/documents` | Ordered replace: `{ document_ids: [...] }` → `{ data: { documents } }` |
| `POST /v1/rooms/{id}/viewers` | Grant a viewer: `{ email }` → `{ data: { viewer, invite_token } }` (**`invite_token` returned once**) |
| `GET /v1/rooms/{id}/viewers` | List viewers + status |
| `DELETE /v1/rooms/{id}/viewers/{viewerId}` | Revoke a viewer — kills their live sessions immediately |
| `GET /v1/rooms/{id}/analytics` | Per-viewer engagement (see below) |

**Access modes** (`access_mode`): `public` (no gate), `email` (default — anyone may request a magic link), `passcode` (a shared passcode; provide `passcode` on create), `allowlist` (only pre-granted viewers get a link).

**`settings`** (JSON, fully replaced on update): `nda_text` (click-through NDA shown before the room renders; editing it re-prompts everyone), `expires_at` (epoch ms — past it the room returns `410` for everyone), `hide_branding` (whitelabel the viewer page), `crm_webhook_url` (https — POSTs a `{ type: "room.lead", email, roomId, … }` lead when a viewer requests access). *(`allow_download` and `watermark` are accepted for forward-compat but not yet enforced — don't rely on them.)*

**Analytics** (`GET /v1/rooms/{id}/analytics`): rows of `{ viewer_id, document_id, opens, events, dwell_ms }`, most-opened first. `email`/`allowlist` viewers are identity-linked; `public`/`passcode` entries are anonymous (`anon_…`). Backed by Cloudflare Analytics Engine — returns an honest empty result when analytics isn't configured.

## Custom domains (Team/Business)
Serve your documents from your own hostname (e.g. `reports.acme.com`). **Team or Business plan**, owner/admin role.

- **`POST /v1/domains`** — `{ "hostname": "reports.acme.com" }` → `{ data: { hostname, status, dns, message } }`. `dns` is the records to create at your DNS provider: a **CNAME** pointing the hostname at ReportRoom's target, plus any **TXT** records for hostname-ownership and TLS-certificate validation. Create them, then poll status.
- **`GET /v1/domains`** — `{ data: { domains: [{ hostname, status, dns? }] } }`. `status` moves `pending` → `pending_validation` → `active`; `dns` is included until it's `active`. Once `active`, your documents' `url` switches to the custom host.
- **`DELETE /v1/domains/{hostname}`** — detaches → `{ data: { deleted: "reports.acme.com" } }`.

Errors: `403 PAYMENT_REQUIRED` (free) / `403 plan_required` (Pro — upgrade to Team/Business), `400 INVALID_HOSTNAME`, `409 DOMAIN_TAKEN`, `404 DOMAIN_NOT_FOUND`, `502 CF_ERROR`, `503 NOT_CONFIGURED`. Rate limit: 10/hour per workspace.

Agents can use the streaming **`attach_domain`** MCP tool instead — with an `Accept: text/event-stream` request it emits `notifications/progress` frames as provisioning advances and returns the DNS records for the human to create.

## POST /v1/lint
Pre-flight check an HTML document before publishing (missing viewport/og, stripped scripts, off-brand). No auth.
```json
Request:  { "html": "<!doctype html>…" }
Response: { "data": { "ok": true, "issues": [ { "level": "warning", "code": "no-og-title", "message": "…" } ] } }
```

## GET /v1/design-system?theme=
Returns everything an agent should follow **before** authoring HTML. No auth. Response `data` keys: `theme`, `version`, `tokens` (CSS custom properties), `rules` (hard constraints), `components` (ready-to-paste snippets — slides, KPI cards, callouts, charts, figures, galleries, …), and `shells` (`{ deck, report }` document skeletons); a top-level `themes` lists the available themes. There is currently one theme — **`vibrant`** (Midnight Azure: ink-violet headings, azure accents on a white reading surface) — which is also the default.

## POST /v1/report-abuse
Report an abusive published page. No auth, rate-limited.
```json
Request: { "url": "https://bad-handle.reportroom.io/bad-slug", "reason": "phishing" }
```
