# Swarm Index — Week-1 Slice (spec v0.4)

*Status: frozen for the pipeline-build week. Any scope change requires a decision record in `docs/decisions/`. Parent documents: "Swarm Phase 0 — Product Plan" (§4 architecture, §4.3 data model) and "Swarm Phase 0 — The Swarm Index". UI basis: the Lovable prototype at swarm-index.lovable.app, exported into this repo as `web/`.*

**Changes from v0.1:** measured providers limited to OpenAI and Anthropic; the Lovable prototype becomes the frontend and its data model becomes the API contract; static-site generator replaced by wiring the React app to the API; jurisdiction moves to the prototype's four-grade display scheme; a "no mock data in production" rule is added.
**Changes from v0.2:** a fourth data status, `estimated`, lets listed providers and unmeasured fields show sourced public figures (list prices, published benchmarks, leaderboard scores) clearly labelled as estimates until measurement replaces them. The rule becomes "no *unsourced* data" rather than "no unmeasured data". Estimates are excluded from headline numbers and carry a "claim this route" call to action.
**Changes from v0.3:** the app is internal until a deliberate launch decision. Licence review, provider notification and all partnership/BD conversations move to a launch gate (§12). Research and BD work is delegated and tracked in `docs/delegated/RESEARCH_AND_BD_TASKS.md`; agents append to that file when a task needs external research or contact instead of doing it themselves.

## 1. Purpose

Build the smallest end-to-end vertical slice of Phase 0 that exercises every layer — **registry → probe → store → score → sign → publish → UI** — on real routes, so the development pipeline (environment, harness, lanes, tests, deploy) is built against a real product. Full Phase 0 scope is unchanged; it becomes the backlog fed through this pipeline from week 2.

## 2. User and job

One user: a developer or agent operator asking *"which inference route should I use, and where is my data actually going?"*
One job: see live-measured price, latency, uptime and jurisdiction grade per route in the prototype's table and route pages, and fetch the same data as JSON.

## 3. Scope

**In (week 1):**
- Registry: `providers.yaml`, `models.yaml`, `routes.yaml`, `estimates.yaml`; ~6 **measured** routes (OpenAI, Anthropic) plus ≥8 **listed** routes from other providers (Mistral, OVHcloud, Scaleway, IONOS, Groq, Together, one hyperscaler EU region) populated with **sourced estimates** so the table looks like the prototype from day one while every number is honest about where it came from
- Probe fleet: one vantage point (Frankfurt), 15-minute cadence, three prompt sizes, streaming
- Store: Postgres + TimescaleDB, tables from product plan §4.3 (subset in §5)
- Scoring: nightly idempotent job → one `snapshots` row per route per day, Ed25519-signed
- API: OpenAPI-documented FastAPI serving the exact response shapes the prototype renders, 24h delayed
- Frontend: the Lovable app, exported to `web/`, mock data removed, reading only the API; Index page, route pages, Methodology, Feed/API page live; Frontiers page hidden behind a flag
- Jurisdiction record hand-curated for OpenAI and Anthropic (measured) and marked "rating pending" for listed providers
- Deployed on one EU VM (API + Postgres) with the frontend built as static assets behind the same domain; recoverable (backup + tested restore)

**Out (week 1, explicitly):** eval runner and all quality families, fidelity check, effective €/task per family, 90d trends (needs history), throughput-under-load, time-of-day curves, additional vantage points, Frontiers page, benchmark plugins, reporter/OTLP, route receipts, Pro/Attested feeds, claim-this-route, savings calculator, report gate, Policy Playground, Glidepath, price-page scraper, Temporal/Prefect. `POST /v1/best-route` is a stretch goal only (§6).

## 4. Prototype → product: what each UI element shows in week 1

The prototype renders full Phase 0 data. In week 1 most of it is not measured yet. **Rule: the production build never shows an unsourced number.** Every field carries one of four statuses:

| Status | Meaning | Rendering |
|---|---|---|
| `measured` | Swarm probe or eval data | Plain |
| `registry` | Curated fact with `source_url` (list price, context window, jurisdiction record) | Plain, source on hover |
| `estimated` | Public figure Swarm did not measure — third-party benchmark, provider self-published number, model-level leaderboard score, status-page history — with `source_url`, `method`, `captured_at`, `expires_at` | Distinct style (muted/italic), "est." badge, tooltip with source and method, "not measured by Swarm" |
| `pending` | Nothing sourced exists yet | "—" with `pending_reason` |

Rules for estimates: every estimate has a source URL a reader can open; the method is one of a fixed list (`published_benchmark`, `provider_self_reported`, `model_level_leaderboard`, `status_page_history`, `derived_from_list_price`); model-level scores are labelled as such because they say nothing about the specific deployment (the Index's whole point); estimates **never** enter headline stats, indices, or the default sort's top slot, and every estimated row/section carries a "Claim this route → replace estimates with measurements" link (the §7.1 loss-aversion mechanism, live from day one). Attribution (`source_url`) is always recorded because it costs nothing and is needed later. Licence review of third-party benchmark sources, and the partnership conversation with them, are **deferred to the launch gate (§12)** — the app is internal until public launch, so no external interaction is needed in the interim. Both are tracked in `docs/delegated/RESEARCH_AND_BD_TASKS.md`.

The prototype's current numbers are invented and are deleted in T7. They are replaced by registry facts, probe data, and curated estimates from `registry/estimates.yaml` (T8b).

| Prototype element | Week 1 |
|---|---|
| Route table: Route, Jur., In/Out €/M | Registry for all routes |
| Route table: TTFT, tok/s, p95, Uptime | Measured for OpenAI/Anthropic routes; estimated (badge) for listed routes where a public source exists; pending otherwise |
| 30d price change | Measured once 30 days of `price_history` exist; before that, estimated from the pricing page's change log if published, else "—" with "history since <date>" |
| €/task per family | Pending for all routes (needs measured token consumption; no honest public source) |
| Quality column | Estimated, model-level, from public leaderboards, labelled "model-level est."; filter and sort by quality allowed but sort places measured rows first within equal grades |
| Fidelity column | Pending everywhere (needs reference host) |
| 90d trend | Pending |
| Task-family filter | Live, driving the estimated model-level scores; header states they are model-level estimates |
| Region filter, jurisdiction filter, cost/TTFT/tok/s sorts | Live |
| EUR / USD toggle | Live — API returns both, per Phase 0 doc §3.2 |
| Headline stats: routes tracked, cheapest route, lowest TTFT | Live, **computed over measured routes only**; label reads "of N measured routes"; "median cost/task" becomes "median input €/M" |
| Route page §3.1 Catalog | Registry; quantization rows show "closed weights" or "not measured" |
| Route page §3.2 Price | Registry; effective-cost-per-task table pending |
| Route page §3.3 Performance | Measured (single vantage row) for OpenAI/Anthropic; estimated with source for listed routes; throughput-under-load and time-of-day curve pending |
| Route page §3.4 Quality | Estimated model-level scores with source and an explicit "not measured on this route" banner; fidelity pending |
| Route page §3.5 Jurisdiction & alternatives | Registry for measured providers; "rating pending" for listed providers unless the curator has completed the record; "Where else this model is served" live |
| Frontiers page | Hidden (flag) — frontiers over estimated data would be misleading |
| Methodology page | Live; defines the four statuses and states exactly what is measured this week |
| Feed/API page | Live; documents the free endpoints, the 24h delay, and the `status` field |
| `/api/public/v1/*` links | Point at the real API (see §6 for path decision) |

**Jurisdiction grades.** The prototype uses four grades; the strategy docs use three tiers. Adopt both: the registry stores `jurisdiction_tier` as the machine slug, the API also returns `grade` for display. Decision record 0001 records this and proposes the fourth tier upstream to the strategy doc.

| Grade | `jurisdiction_tier` | Meaning |
|---|---|---|
| A | `eu_jurisdiction` | EU legal entity, EU hardware, no third-country control |
| B | `eu_residency_us_hyperscaler` | Data resident in EU, operator subject to US CLOUD Act |
| C | `us` | US jurisdiction |
| D | `undisclosed` | Region or operator not disclosed |

Note: with only OpenAI and Anthropic measured, **no Grade A route is measured in week 1.** Grade A rows appear as `listed` with estimated performance and quality, clearly badged. The table therefore looks complete on day one while the "measured" count in the headline tells the truth. The first week-2 task is measuring one Grade A provider (Mistral: self-serve, minutes to open), which also produces the first estimate-vs-measurement comparison — publish that delta; it is the story.

## 5. Acceptance criteria (each maps to a named test)

| ID | Criterion | Verified by |
|----|-----------|-------------|
| AC1 | `routes.yaml` contains ≥6 routes in state `measured` (OpenAI and Anthropic only) and ≥8 in state `listed`, spanning ≥3 jurisdiction grades; every field in every registry file carries `source_url` and `last_verified`; every entry in `estimates.yaml` carries `source_url`, `method` (from the fixed list), `captured_at`, `expires_at`; CI fails on any entry missing these, on an unknown tier or method, on an estimate for a field that has measured data, or on a `measured` route whose provider has no jurisdiction record. | `tests/registry/test_validate.py`, `tests/registry/test_estimates.py` |
| AC2 | For every `measured` route, a `probe_results` row is written at least every 20 minutes with `ttft_ms`, `tps`, `latency_ms`, `status`, `tokens_in`, `tokens_out`, `server_headers_json`; a probe failure writes a row with the error status rather than raising; ≥24h of continuous data exists before launch. | `tests/probes/test_worker.py` (mocked OpenAI and Anthropic clients), `tests/probes/test_gap_check.py` |
| AC3 | Nightly scoring writes exactly one `snapshots` row per route per day (re-running is a no-op) containing p50/p95 TTFT, p50/p95 latency, tok/s, error rate, rate-limit rate, uptime %, list price in EUR and billing currency with FX rate, jurisdiction tier and grade, and an Ed25519 signature over canonical JSON that verifies against the published public key. | `tests/scoring/test_snapshot.py`, `test_idempotent.py`, `test_signature.py` |
| AC4 | The API serves `GET /v1/routes`, `GET /v1/routes/{route_id}`, `GET /v1/models`, `GET /v1/snapshots/{date}`, `GET /.well-known/swarm-pubkey`; responses validate against `contracts/openapi.json`; data is ≥24h old by query construction; header `X-Swarm-Attribution` is present; `/v1/models` also validates against the OpenAI list-models shape. | `tests/api/test_contract.py` (schemathesis or equivalent), `test_delay.py`, `test_models_shape.py` |
| AC5 | `web/` builds with zero imports from `src/mock*` or `data/*.json` (CI grep fails the build otherwise); the Index page loads routes from the API and the jurisdiction filter returns only matching rows; every `estimated` value renders with the "est." badge and a tooltip containing its source URL; headline stats equal the values computed over `measured` routes only in the seeded fixture; a route page renders measured, registry, estimated and pending fields in their four distinct states; hidden features are absent from the DOM when their flag is off. | `web/tests/e2e/index.spec.ts`, `estimates.spec.ts`, `route.spec.ts`, `flags.spec.ts` (Playwright against a seeded API) |

Definition of done for the week: AC1–AC5 green in CI on `main`, deployed, one backup restored on a clean machine, one rollback executed and logged.

## 6. Interfaces

**Path decision:** the prototype links to `/api/public/v1/...`; the product plan uses `/v1/...`. Serve at `/v1/` (matches the Phase 1 contract) and set `VITE_API_BASE=/v1` in the frontend. The three hard-coded links in the prototype footer are updated in T7.

- `GET /v1/routes?jurisdiction=B&region=eu-central&sort=ttft` — array of `RouteSummary` (the table row)
- `GET /v1/routes/{route_id}` — `RouteDetail` with blocks `catalog`, `price`, `performance`, `quality`, `jurisdiction`, `alternatives`; every block field is a `Value` object: `{ value, status: measured|registry|estimated|pending, source_url?, method?, captured_at?, pending_reason? }`. `RouteSummary` rows carry the same `Value` objects for table columns plus a `measured: bool` at row level for headline filtering
- `GET /v1/routes?status=measured` — filter; the frontend's headline stats use this
- `GET /v1/models` — OpenAI-compatible list with a `swarm` extension object per model
- `GET /v1/snapshots/{YYYY-MM-DD}` — signed bundle
- `GET /.well-known/swarm-pubkey` — Ed25519 public key + key id
- *Stretch:* `POST /v1/best-route` — schema frozen exactly as product plan §4.4, `execute: false`, ranking on price + p95 + jurisdiction only; `min_quality` accepted and ignored, documented as such

`contracts/openapi.json` is generated from the FastAPI models and committed. `web/src/api/types.ts` is generated from it (`openapi-typescript`). Both are regenerated in CI and the build fails if either is stale. **The contract is written in T1b, before either the API or the frontend lane starts.**

## 7. Data model (subset — names identical to product plan §4.3)

```
routes            route_id, model_id, provider_id, region, endpoint_url, account_tier,
                  cadence_tier, state (listed|measured), tos_publish_ok, jurisdiction_tier
price_history*    route_id, captured_at, currency, fx_rate_eur, in_per_m, out_per_m,
                  cached_in_per_m, batch_in_per_m, source_url
probe_results*    route_id, vantage, ts, prompt_size, ttft_ms, tps, latency_ms, status,
                  rate_limited, tokens_in, tokens_out, server_headers_json
jurisdiction      provider_id, legal_entity, governing_law, cloud_act_exposed, retention_policy,
                  trains_on_inputs, subprocessors_url, dpa_url, certifications[], weight_provenance,
                  verified_at, verified_by, document_hashes[]
route_estimates   route_id, field, value, unit, method, source_url, captured_at, expires_at,
                  entered_by            -- loaded from registry/estimates.yaml; superseded automatically
                                        -- the day a measured value for (route_id, field) exists
snapshots         route_id, date, metrics_json, signature, pubkey_id
                                        -- metrics_json carries status per field, so the signature
                                        -- covers the claim "this was an estimate" as well as the number
(* = TimescaleDB hypertable)
```
`route_id = model_slug@provider_slug@region`, URL-encoded in the frontend exactly as the prototype already does. No column anywhere can hold prompt or completion text (NFR-1).

## 8. Non-functional requirements

- **NFR-1 Content-blind:** only three fixed public probe prompts exist in the repo; probes log headers, timings and token counts, never response text. Enforced by schema (no text columns) and a schema-grep test.
- **NFR-2 Probe budget:** ≤ €50/week token spend across both providers; budget check before each cycle; pause at 100%, alert at 80%.
- **NFR-3 Freshness:** free API ≥24h delayed by query construction (`date <= today - 1`), not by cache.
- **NFR-4 No unsourced data:** production frontend has no mock data path; every displayed value traces to a `status` from the API, and every `estimated` value traces to a `source_url` a reader can open. Estimates expire (default 90 days) and revert to `pending` unless re-verified. Headline stats and indices are computed over `measured` routes only.
- **NFR-5 Reproducibility:** fresh clone + `make up` yields API, DB, seeded registry and the frontend dev server; `make test` runs both suites locally in under 6 minutes.
- **NFR-6 Legal gate:** a route is published only if `tos_publish_ok = true`; default `false`; human-flipped after reading the provider's terms on benchmark publication.
- **NFR-7 Infra as code:** VM, DNS, storage in Terraform; secrets via SOPS, never in the repo.

## 9. Initial route set

**Measured (accounts already held):**
- OpenAI: current flagship and current small model × {US, EU data residency if enabled on the account} → 2–4 routes
- Anthropic: current Sonnet-class and Haiku-class model × {US, plus any EU residency option the account exposes} → 2–4 routes

Exact model ID strings are pinned in `models.yaml` on Day 1 from the providers' model docs (`source_url` required). Where a provider offers no region choice, the route's region is the provider's disclosed default and the grade follows the jurisdiction record.

**Listed, not measured (no account needed), ≥8 routes:** Mistral (Grade A), OVHcloud AI Endpoints (A), Scaleway (A), IONOS (A), one hyperscaler EU region (B), Groq (C or D per disclosure), Together (C) — registry entries from public pricing pages, `state: listed`. Performance and quality fields filled from `estimates.yaml` where a public source exists (T8b). Jurisdiction records completed for as many as the curator reaches in the week; the rest show "rating pending". Model choice for listed routes: prefer open-weight models served by several of these providers (e.g. one Llama-class, one Qwen-class, one DeepSeek-class), so the "Where else this model is served" section has content and week-2 fidelity comparisons have targets.

## 10. Task graph (agent-sized, with done-conditions — the Day 4 lane plan)

| Task | Depends on | Done when |
|------|------------|-----------|
| T1a Registry schema + validator + CI job | — | AC1 tests green; `make validate` in CI |
| **T1b API contract**: pydantic `RouteSummary`, `RouteDetail` (nullable blocks + `status`), `ModelList`; `contracts/openapi.json` generated and committed; `web/src/api/types.ts` generated | T1a | Types round-trip; CI stale-check green; one fixture JSON validates against the contract |
| T2 Store: docker-compose Postgres/Timescale, migrations, models | — | Migrations apply on empty DB; hypertables exist; schema-grep test green |
| T3 Probe worker for OpenAI and Anthropic (streaming, header capture, mocked in tests) | T1a, T2 | AC2 worker tests green for both providers |
| T4 Scheduler loop + budget check | T3 | 20-min gap test green on 2h of local data |
| T5 Scoring job + Ed25519 signing + key management; merges measured metrics with `route_estimates` per field (measured always wins; expired estimates drop to pending); exposes `snapshots.read_latest_published()` | T2 | AC3 tests green, incl. a test that an estimate is superseded the day a measured value appears |
| T6 API (FastAPI) implementing T1b contract over T5 | T1b, T5 | AC4 tests green |
| T7 Frontend: export Lovable → `web/`; delete mock data; API client from generated types; pending states; feature flags; footer links; Playwright | T1b (can start against contract fixtures before T6 exists) | AC5 tests green against seeded API |
| T8a Jurisdiction records for OpenAI and Anthropic, then listed providers as time allows (agent drafts from public sources, human verifies every `source_url`) | T1a | Both measured providers have complete records; `verified_by` is a human name |
| T8b `estimates.yaml` for listed routes: agent collects candidate figures with URLs from public benchmarks, provider docs, leaderboards and status pages; human verifies each URL opens and says what the entry claims; schema-validated | T1a | ≥8 listed routes have price (registry) plus ≥2 estimated performance fields and a model-level quality estimate each, all with source URLs; AC1 estimate tests green |
| T9 Terraform VM + deploy API/DB + build and serve `web/dist` + backup/restore + rollback runbook | T4, T6, T7 | Definition-of-done items executed and logged in `docs/runbook.md` |

**Lane plan:** T1a, T1b and T2 first, on `main`, sequentially — the contract is the thing that lets the lanes run without colliding. Then four lanes: `lane/probes` (T3→T4), `lane/scoring` (T5), `lane/web` (T7 against contract fixtures), `lane/curation` (T8a + T8b, human-led; the agent drafts, the human verifies — this lane is the week's largest human time cost, budget a full day). Merge. Then `lane/api` (T6) alone, then point `lane/web` at the live API and finish AC5. T9 last. Expected conflict points: `Makefile` and `docker-compose.yml` (every lane touches them — add your service in a separate compose override file, `compose.<lane>.yml`, and merge into the main file only at the end).

## 11. Backlog after week 1 (in product-plan order)

First Grade A measured route (Mistral) and publish (internally) the first estimate-vs-measured delta → eval runner (Inspect AI, three verifiable families) → effective €/task and quality columns un-flagged → second and third vantage points → Frontiers page un-flagged → price-page scraper → claim-this-route → reporter SDK → Pro feed → `/v1/best-route` with `min_quality` → sovereignty premium → Policy Playground → Glidepath.

## 12. Launch gate (not week-1 work; blocks public launch only)

The app runs internally until a deliberate launch decision. Nothing below is required for the build; all of it is required before the first public URL. Research items are delegated (see `docs/delegated/RESEARCH_AND_BD_TASKS.md`); the engineering items are one-line flags already in the schema.

- Per-provider ToS review for benchmark-publication clauses → `tos_publish_ok` flipped per provider by a human (NFR-6)
- Licence review of every third-party source used in `estimates.yaml`; sources that don't permit reuse are removed or replaced before launch
- Notify-and-comment to every measured provider ≥5 working days before publication (Phase 0 doc §6.3)
- Jurisdiction record complete for every route in state `measured`; listed routes may launch as "rating pending"
- Methodology page reviewed by an outside reader
- Partnership / data-licensing conversation with benchmark sources (Phase 0 doc §9b: treat Artificial Analysis as supplier, not rival) — optional for launch, desirable before
- Cortecs conversation (strategy doc: talk before visibly competing) — before any routing product, not before the Index
