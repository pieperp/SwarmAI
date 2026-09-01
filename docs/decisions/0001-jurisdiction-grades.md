# 0001 — Jurisdiction: four display grades over three strategy tiers

**Date:** 2026-09-01 · **Status:** accepted · **Author:** [your name]

## Context
The strategy and Phase 0 docs define three jurisdiction tiers: EU-jurisdiction, EU-residency-on-US-hyperscaler, US. The Lovable prototype renders four grades A–D, adding "Global / undisclosed" for providers that do not publish where a route runs or who operates it.

## Options
1. Keep three tiers; map "undisclosed" into US.
2. Adopt four tiers everywhere, renaming the strategy vocabulary.
3. Store the machine tier (four values, adding `undisclosed`) and expose a display `grade` A–D alongside it.

## Decision
Option 3. Registry and API carry `jurisdiction_tier ∈ {eu_jurisdiction, eu_residency_us_hyperscaler, us, undisclosed}`; the API also returns `grade ∈ {A,B,C,D}` for display. The frontend never derives the grade from region strings.

## Reasoning
"Undisclosed" is a real, common state and folding it into US would assert a fact we don't have — against the provenance rule. Keeping the machine slug separate from the display letter lets the Phase 1 policy schema (which filters on tiers) stay stable while the UI stays readable. The fourth tier should be proposed upstream to the strategy doc; until then this record is the source of truth.
