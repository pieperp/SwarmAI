# Swarm Index — Research & BD Tasks (delegated)

*Living backlog of work that needs a human reading, verifying, or talking to people. Owned by the project lead; worked by delegated researchers. Agents and engineers append to this file when they hit something that needs a human; they do not do the task themselves.*

## How to work a task from this list

1. Pick a task, put your name and date on it, move it to "In progress".
2. Output goes where the task says — usually a PR against a `registry/*.yaml` file or a markdown note in `docs/research/`. Never edit `main` directly.
3. **Provenance rule, non-negotiable:** every figure or fact you enter needs a `source_url` that opens and says what you claim, plus the date you looked. If you can't find a source, write "not found" with what you searched — that is a valid result. A guess is not.
4. **Nothing external until the launch gate opens.** Research tasks (section A) read public pages only. BD tasks (section B) are blocked until the project lead unblocks them explicitly; until then, prepare, don't send.
5. Done-condition is in each task. When met, move to "Done" with a link to the PR or note.

Task format: `ID · Title · Why · Output · Done when · Feeds`

---

## A. Research (unblocked — public sources only, no contact)

### A1 · Jurisdiction records, measured providers (OpenAI, Anthropic)
Why: the signature metric; these two must be complete before anything ships internally.
Output: PR to `registry/providers.yaml` filling every field in the `jurisdiction` block: legal entity serving the API to EU customers, governing law, CLOUD Act exposure (yes/no with reasoning), data retention and logging policy, trains-on-inputs, subprocessor list URL, DPA URL, certifications (ISO 27001, SOC 2, BSI C5 if any), and for any EU data-residency option: which entity, which region, what it actually guarantees.
Done when: every field has `source_url` + `last_verified`; a second person has opened every URL.
Feeds: T8a.

### A2 · Jurisdiction records, listed providers
Why: Grade A rows need real records before launch; Mistral first because it is the first to be measured.
Output: same as A1 for Mistral, OVHcloud, Scaleway, IONOS, Groq, Together, one hyperscaler EU region (Azure OpenAI EU or Bedrock eu-central-1). Also `weight_provenance` for open-weight models (where were the weights trained/published).
Done when: as A1, in priority order Mistral → OVHcloud → Scaleway → IONOS → others.
Feeds: T8a, launch gate.

### A3 · Estimates for listed routes
Why: the table shows sourced estimates until measurement replaces them (SPEC §4).
Output: PR to `registry/estimates.yaml`. For each listed route, collect where a public source exists: TTFT, tokens/s, p95 latency, uptime (from status-page history), model-level quality per task family (from public leaderboards). Each entry: `route_id, field, value, unit, method, source_url, captured_at`. Method must be one of `published_benchmark | provider_self_reported | model_level_leaderboard | status_page_history | derived_from_list_price`.
Done when: ≥8 listed routes have ≥2 performance estimates and a quality estimate each; every URL verified by a second person; fields with no source left out (not zero, not guessed).
Feeds: T8b.

### A4 · Model ID and catalog facts
Why: registry `models.yaml` must pin exact model strings and catalog facts from provider docs, not memory.
Output: for every model in `models.yaml`: exact API model ID string, weights version/date, context window, modalities, tool-calling / JSON mode / structured output support, rate limits by account tier, announced deprecation dates, licence (open-weight models). Each with `source_url`.
Done when: `make validate` passes on the PR.
Feeds: T1a, route page §3.1.

### A5 · Pricing pages and status pages inventory
Why: price history and uptime scraping (week-2+) need canonical URLs; price-change alerts are the Index's first "news".
Output: PR to `registry/providers.yaml`: `pricing_url`, `status_page_url` (and JSON feed URL if one exists), `docs_url`, `changelog_url` per provider. Note whether the pricing page shows historical changes.
Done when: every provider in the registry has all four fields or an explicit "none".
Feeds: price scraper task (backlog).

### A6 · Provider ToS review for benchmark publication
Why: some providers restrict publishing benchmark results without consent (Phase 0 doc §6.3). Determines `tos_publish_ok` per provider at the launch gate.
Output: `docs/research/tos-review.md`: per provider, the relevant clause quoted briefly with URL and section reference, your reading (permits / prohibits / requires notice / unclear), and the date. **Do not flip `tos_publish_ok` yourself** — the project lead does.
Done when: every measured and listed provider has an entry.
Feeds: launch gate.

### A7 · Licence review of estimate sources
Why: third-party benchmark data reused in `estimates.yaml` may carry reuse terms. Deferred until pre-launch, but the inventory is cheap to keep as A3 proceeds.
Output: `docs/research/source-licences.md`: each distinct source domain used in `estimates.yaml`, its terms-of-use URL, what it permits (quote with attribution? redistribute? commercial?), and a recommendation (keep / attribute-only / replace before launch).
Done when: every source in `estimates.yaml` has an entry. Update as A3 adds sources.
Feeds: launch gate.

### A8 · Harness jurisdiction-readiness checklist (~18 harnesses)
Why: Phase 0 doc §3.7 — the sharpest launch content, and mostly research.
Output: `docs/research/harness-readiness.md` and a draft `registry/harnesses.yaml`. For each harness (OpenClaw, OpenHands, Goose, Claude Code, Codex CLI, Gemini CLI, Aider, Cursor, Cline, Roo Code, Continue, Copilot, LangGraph, CrewAI, AutoGen, Pydantic AI, Open WebUI, LibreChat, Dify, n8n): can it pin a base URL/provider; does it default to a US endpoint; does its telemetry phone home and where (read the privacy docs and, where possible, the source); does it pass per-request metadata; does it honour spend caps. Record the version you checked.
Done when: all harnesses scored with sources; unknowns marked unknown.
Feeds: harness listing (backlog), launch content.

### A9 · Route-list expansion toward ~150
Why: product plan §8 target; the week-1 slice has ~14.
Output: PR adding `listed` routes to `routes.yaml` in the plan's mix: ~60 EU-jurisdiction, ~40 EU-residency-on-US-hyperscaler, ~50 US. Registry facts only (A4/A5 rules); no estimates required at this stage.
Done when: validated PR; each provider added has at least a pricing URL and a legal-entity name.
Feeds: registry.

### A10 · Competitive landscape refresh
Why: the strategy doc's landscape is dated August 2026 and the space moves monthly.
Output: `docs/research/landscape-YYYY-MM.md`: for Cortecs, LLMrouter.eu, Requesty, Eden AI, Opper, EUrouter, Artificial Analysis, LLM Stats, OpenRouter, Infercom, AntSeed: what changed (pricing, funding, features, any published measurement or jurisdiction claims), with URLs. One paragraph each; flag anything that touches the Index's positioning.
Done when: monthly note exists. Recurring.
Feeds: strategy doc.

### A11 · German-language and EU-specific benchmark inventory
Why: the German battery is the Phase 0 asset hardest for incumbents to copy; the curator needs to know what already exists before writing one.
Output: `docs/research/eu-benchmarks.md`: existing German/EU-language evals (MMLU-de and others), their licences, dataset sizes, what task families they cover, and gaps a Swarm-owned battery should fill (German legal/administrative extraction in particular).
Done when: note reviewed by the project lead.
Feeds: eval runner (backlog).

### A12 · Auditor and certifier landscape
Why: Phase 0 doc open decision 5; research now, contact at the launch gate or later.
Output: `docs/research/auditors.md`: for TÜV SÜD, TÜV Nord, DEKRA, DQS, Bureau Veritas, SGS, EuroPriSe-accredited boutiques, Gaia-X Digital Clearing Houses, Big-Four C5 practices: what they certify (ISO 27001/42001, C5, EuroPriSe), typical engagement shape, any public AI-related work, a named contact route (public page, not a person's private details).
Done when: note complete with URLs.
Feeds: B4.

### A13 · Methodology page outside-reader review
Why: launch-gate item; anyone not on the build can do it.
Output: written comments on `docs/methodology.md`: what is unclear, what claims lack a stated method, where "measured" vs "estimated" could be confused.
Done when: comments filed as a PR review or issue.
Feeds: launch gate.

---

## B. BD / outreach (**blocked until the project lead opens the launch gate** — prepare drafts, send nothing)

### B1 · Provider notify-and-comment
Why: Phase 0 doc §6.3 — every measured provider is notified ≥5 working days before publication and given a comment field.
Output: draft email per measured provider (`docs/outreach/notify-<provider>.md`): what is being published about them, the account tier used, how to claim the route, how to comment. Find the right public contact channel (developer relations, press, support form).
Done when: drafts approved by the project lead. **Send only when told.**

### B2 · Benchmark-source partnership
Why: Phase 0 doc §9b — treat Artificial Analysis and similar as suppliers; explore licensing their speed/price data in exchange for a Swarm-sourced jurisdiction column.
Output: `docs/outreach/benchmark-partners.md`: for each source used in `estimates.yaml`, what Swarm would ask for, what it offers, who to contact (public channel), and a draft first message.
Done when: draft approved. Send only when told.

### B3 · Cortecs conversation
Why: strategy doc — talk to Cortecs before visibly competing; possible partner, co-designer of the route-receipt spec, or acquisition.
Output: `docs/outreach/cortecs.md`: what they have shipped (from A10), what Swarm would propose (receipt spec co-design, Index listing/verification), risks of the conversation, draft opener.
Done when: draft approved. **Not before a routing product is on the roadmap in earnest; the Index alone does not require this.**

### B4 · First auditor / countersigner approach
Why: Attested tier needs an outside countersignature; Phase 0 doc suggests a boutique or Gaia-X clearing house first.
Output: shortlist of three from A12 with a draft approach for each.
Done when: draft approved. Send only when told.

### B5 · Claim-this-route outreach
Why: once the claim flow exists (backlog), providers need to hear about it; estimates on their rows are the motivation.
Output: per-provider note showing them their estimated row and what claiming gets them.
Done when: claim flow exists and drafts approved.

### B6 · EU cloud channel conversations (STACKIT, IONOS, OVHcloud, Scaleway)
Why: strategy doc GTM — co-sell/marketplace; the Index's measurements are the opener.
Output: per-cloud one-pager: their model-serving offering, where the Index shows them strong/weak (once measured), the proposed arrangement, public contact route.
Done when: drafts approved. Phase 1 timing, not before.

---

## In progress

*(move tasks here with name + date)*

## Done

*(move tasks here with a link to the PR or note)*

## Appended by agents / engineers

*(new items land here in the standard format; the project lead triages them into A or B)*
