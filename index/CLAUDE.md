# CLAUDE.md — Swarm Index

You are working on the Swarm Index: a public, continuously measured reference for AI inference routes (model @ provider @ region) with price, latency, uptime and a **jurisdiction grade**. Read `SPEC.md` before any task; it is the contract. Full background in `docs/strategy/` — read only when a task references it.

## Stack (pinned for this build)

**Backend (`src/`, `registry/`, `tests/`)**
- Python 3.12, `uv`, `ruff`, `pyright` (strict on `src/`), `pytest`
- FastAPI + `httpx` (async); `pydantic` v2 for every schema; official `openai` and `anthropic` SDKs for probes (streaming)
- Postgres 16 + TimescaleDB via `docker compose`; `alembic` migrations
- Ed25519 via `cryptography`; canonical JSON = `json.dumps(sort_keys=True, separators=(",", ":"))`

**Frontend (`web/`)** — exported from Lovable, kept as generated: Vite, React, TypeScript, Tailwind, shadcn/ui, React Router
- `pnpm`; `eslint`; `tsc --noEmit`; Playwright for e2e
- API types are **generated**, never hand-written: `contracts/openapi.json` → `web/src/api/types.ts` via `openapi-typescript`

**Infra (`infra/`)** — Terraform; secrets via SOPS (`secrets/*.enc.yaml`)

## Repo layout

```
registry/     providers.yaml, models.yaml, routes.yaml, schema/, validate.py
contracts/    openapi.json (generated from FastAPI models; committed; CI checks staleness)
src/swarm/    probes/  scoring/  api/  store/  common/
tests/        mirrors src/; fixtures in tests/fixtures/ (incl. contract fixtures used by web/)
web/          Lovable app; src/api/ (generated types + client), src/features.ts (flags)
docs/         decisions/ (ADRs)  runbook.md  methodology.md  lanes.md  log/ (daily logs)
              delegated/RESEARCH_AND_BD_TASKS.md (human research + outreach backlog; append, never do)
infra/        terraform
```

## Commands

```
make up          # compose up (db, api) + migrate + seed registry + web dev server
make test        # backend: ruff + pyright + pytest; frontend: eslint + tsc + vitest + playwright
make validate    # registry validation only
make contract    # regenerate contracts/openapi.json and web/src/api/types.ts (CI fails if stale)
make probe-once ROUTE=<route_id>   # ONE real provider call — costs money — ask before running
make score       # nightly scoring locally against dev DB
make web-build   # production build of web/ into web/dist
```

## Invariants — never violate, never "temporarily" relax

1. **Content-blind.** No column, log line, fixture, span or trace may contain prompt or completion text. Probes record timings, status, token counts and response headers only. The three probe prompts live in `src/swarm/probes/prompts.py` and are the only prompts in the repo. If a task seems to need response text, stop and write a decision record.
2. **No unsourced data in the product.** The Lovable export ships with invented numbers; they are deleted in T7 and must never return. Every value the UI shows comes from the API and carries a `status` (`measured | registry | estimated | pending`). Estimates are allowed and encouraged for unmeasured routes and fields, but only from `registry/estimates.yaml`, and only with `source_url`, `method` (fixed list in `registry/schema/estimate.json`), `captured_at`, `expires_at`. When drafting estimates: collect the figure *and* the URL together; if you cannot find a URL, leave the field pending. Never fill a gap with a plausible number, an average of other routes, a `?? 0`, or a value "from memory". Pending renders as "—" plus `pending_reason`. Estimated renders with the badge and tooltip, never styled like measured. CI greps `web/src` for mock imports and fails the build.
3. **Contract first.** API response shapes live in `src/swarm/api/schemas.py` and nowhere else. Changing a shape means: edit schemas → `make contract` → commit both generated files → adjust consumers. Never hand-edit `contracts/openapi.json` or `web/src/api/types.ts`.
4. **Provenance on every registry field.** Every entry in `registry/*.yaml` has `source_url` and `last_verified`. Never invent a value — omit the field and let validation fail so a human fills it. Model ID strings come from the provider's model docs, never from memory.
5. **Publish gate.** `tos_publish_ok` defaults to `false` and is only set `true` by a human commit.
6. **24h delay is structural.** The free API queries `date <= today - 1`. Not a cache, not a flag.
7. **Snapshots are idempotent and signed.** Re-running scoring for a day creates no second row and changes no signature. Private key never in repo, fixture or log; tests generate a throwaway key.
8. **Secrets.** `SWARM_KEY_OPENAI`, `SWARM_KEY_ANTHROPIC` from the environment only. Never hardcode, log, or commit `.env`.
9. **Cost.** Real provider calls happen only via the scheduler under the budget check, or via `make probe-once` when a human runs it. Tests mock both SDKs. Measured providers this week are OpenAI and Anthropic only — do not add clients for other providers; they are `listed`, not `measured`.
10. **Feature flags gate features whose data exists in neither measured nor estimated form.** `web/src/features.ts` is the single switch list (`FRONTIERS`, `TRENDS_90D`, `MULTI_VANTAGE`, `EFFECTIVE_COST`). Off means absent from the DOM, not greyed out. Turning one on requires the data to exist in a snapshot as measured or sourced-estimated. Quality is *not* flagged: it ships as model-level estimates with the banner.
11. **Headline numbers and indices use measured routes only.** Routes tracked, cheapest, lowest TTFT, any index, any "best on X" caption: filter on `measured: true` at the API (`?status=measured`), never mix estimates in, and label the count ("of N measured routes").

## Working in `web/`

- Preserve the Lovable structure, component names and styling; this is a wiring task, not a redesign. Visual changes need a stated reason in the PR.
- Data flows: `api/client.ts` (typed fetch) → hooks in `hooks/` → components. Components never call `fetch`.
- Every displayed number goes through one component, `<Value>`, which switches on `status`: measured → plain; registry → plain with source on hover; estimated → muted style, "est." badge, tooltip with `method` and clickable `source_url`, and the row/section shows the "Claim this route" link; pending → "—" with `pending_reason`. No component renders a raw number from the API directly.
- The jurisdiction display grade (A–D) comes from the API's `grade` field; never derive it in the frontend from region strings.
- Currency toggle: render from the API's paired EUR/original fields; never convert client-side.
- Route URLs: `/route/<url-encoded route_id>` exactly as the prototype does.
- Footer and Feed page links point at `VITE_API_BASE` (`/v1`), not `/api/public/v1`.

## How to work a task

- **The app is internal until a launch decision.** Do not add analytics, SEO, public sign-up, or anything that assumes external users. Do not contact providers, benchmark authors, or anyone outside the repo.
- **Research and outreach go to the delegated list, not to you.** When a task needs something only a human can do — read a ToS, verify a legal entity, collect figures from many pages, email a provider — append an entry to `docs/delegated/RESEARCH_AND_BD_TASKS.md` in the file's format (what, why, output, done-condition, feeds which file) and continue with what you can do. Do not block on it, do not guess around it.
- Every task has a done-condition in `SPEC.md` §10 or the issue. If not, ask for one before writing code.
- **Tests first.** Write or extend the failing test named in the acceptance criterion, run it, confirm it fails for the right reason, then implement. Never edit a test to make it pass; if the test is wrong, say so and stop.
- Run the relevant suite (`make test` or its backend/frontend half) before declaring done; include the summary in your final message.
- Small commits with descriptive messages, dead ends included (`wip: tried X, reverting because Y`). Do not squash.
- Do not touch files outside your task's area without saying so. Human-edited unless the task says otherwise: `registry/*.yaml` jurisdiction fields, `infra/`, `docs/decisions/`, `secrets/`. `registry/estimates.yaml` is agent-drafted but human-merged: open a PR, never commit it to `main` yourself.
- Non-obvious choice → `docs/decisions/NNNN-title.md`: context, options, choice, reasoning, under 20 lines.
- Prefer the boring option. No new dependency (pip or npm) without a one-line justification in the PR.

## Lanes (parallel work in git worktrees)

- One task per worktree, branch `lane/<area>`. Never work on `main` directly after T2.
- Read `docs/lanes.md` at task start for file ownership; do not edit files another lane owns.
- Compose services go in `compose.<lane>.yml`; `Makefile` and `docker-compose.yml` are merged by a human at integration.
- Shared Python goes in `src/swarm/common/`; shared TS in `web/src/lib/`. Cross-lane additions are flagged in the PR description.
- Rebase on `main` before opening the PR; resolve conflicts conservatively (keep both behaviours, add a test) rather than picking one side silently.

## Definition of done for any PR

- [ ] Acceptance-criterion test(s) named and green
- [ ] Relevant suite green locally; CI green (both jobs if both languages touched)
- [ ] `make contract` produces no diff
- [ ] No new text columns, no secrets, no real provider calls in tests, no mock data in `web/src` (CI greps)
- [ ] Decision record written if a non-obvious choice was made
- [ ] PR description: what changed, how verified, what was *not* done

## Vocabulary

route = model @ provider @ region · tier = `eu_jurisdiction | eu_residency_us_hyperscaler | us | undisclosed` (grades A–D for display) · snapshot = one signed row per route per day · listed vs measured = registry state · measured / registry / estimated / pending = per-field data status from the API, never a frontend guess · estimate = a sourced public figure Swarm did not measure, never a guess · scout/executor/index = strategy terms, not code — do not create modules with these names in this phase.
