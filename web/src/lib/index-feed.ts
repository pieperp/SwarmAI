import { getRoutes, TASK_FAMILIES, type Route, type Display } from "./index-data";

const EUR_TO_USD = 1 / 0.92;

/** OpenAI-style /v1/models entry, enriched with Swarm Index catalog facts. */
export function toModelObject(r: Route) {
  return {
    id: r.id,
    object: "model",
    created: Math.floor(Date.parse(r.lastMeasured) / 1000),
    owned_by: r.provider.id,
    // --- enrichment (additive; an OpenAI client ignores unknown fields) ---
    swarm_index: {
      route: { model: r.model.id, provider: r.provider.id, region: r.region.id },
      model_name: r.model.name,
      weights_version: r.model.weightsVersion,
      open_weights: r.model.openWeights,
      quantization: { disclosed: r.catalog.quantDisclosed, detected: r.catalog.quantDetected },
      context_window: r.model.contextWindow,
      modalities: r.model.modalities,
      capabilities: {
        tool_calling: r.model.toolCalling,
        json_mode: r.model.jsonMode,
        structured_output: r.model.structuredOutput,
      },
      rate_limits: r.catalog.rateLimits,
      deprecation_date: r.model.deprecation,
      jurisdiction: { grade: r.region.jurisdiction, note: r.region.jurisdictionNote },
    },
  };
}

function money(valueInBilling: number, billing: "EUR" | "USD") {
  const eur = billing === "EUR" ? valueInBilling : valueInBilling * 0.92;
  return { eur: Math.round(eur * 1e5) / 1e5, usd: Math.round(eur * EUR_TO_USD * 1e5) / 1e5 };
}

export function toRouteObject(r: Route, opts: { history?: boolean | undefined } = {}) {
  const perTask: Record<string, unknown> = {};
  for (const f of TASK_FAMILIES) {
    const t = r.price.perTask[f.id];
    perTask[f.id] = {
      tokens_in: t.tokensIn,
      tokens_out: t.tokensOut,
      cost: { eur: t.costEur, usd: Math.round(t.costEur * EUR_TO_USD * 1e5) / 1e5 },
      quality: r.quality.scores[f.id],
    };
  }
  return {
    route_id: r.id,
    model: r.model.id,
    provider: r.provider.id,
    region: r.region.id,
    measured_at: r.lastMeasured,
    catalog: toModelObject(r).swarm_index,
    price: {
      billing_currency: r.price.currency,
      fx_to_eur_at_capture: r.price.fxToEur,
      per_million_input: money(r.price.input, r.price.currency),
      per_million_output: money(r.price.output, r.price.currency),
      per_million_cached_input: money(r.price.cachedInput, r.price.currency),
      batch_discount: r.price.batchDiscount,
      change_pct: { h24: r.price.change24h, d7: r.price.change7d, d30: r.price.change30d },
      effective_per_task: perTask,
      ...(opts.history ? { history: r.price.history } : {}),
    },
    performance: {
      ttft_ms: r.perf.ttftMs,
      tokens_per_second: r.perf.tps,
      latency_ms: { p50: r.perf.p50Ms, p95: r.perf.p95Ms },
      throughput_rps: r.perf.throughputRps,
      error_rate_pct: r.perf.errorRate,
      rate_limit_hit_pct: r.perf.rateLimitHits,
      uptime_pct: r.perf.uptime,
      vantage_points: r.perf.vantages.map((v) => ({
        vantage: v.vantage,
        ttft_ms: v.ttftMs,
        tokens_per_second: v.tps,
        p95_ms: v.p95Ms,
      })),
      vantage_ttft_spread_ms: r.perf.vantageSpreadMs,
      availability_by_hour_utc: r.perf.hourly,
    },
    quality: {
      by_family: r.quality.scores,
      composite: r.quality.composite,
      fidelity_vs_reference_host: r.quality.fidelity,
    },
    derived: {
      quality_per_eur: r.qualityPerEuro,
      quality_per_second: r.qualityPerSecond,
    },
  };
}

export function feedPayload(opts: {
  model?: string | null;
  provider?: string | null;
  region?: string | null;
  jurisdiction?: string | null;
  history?: boolean | undefined;
}) {
  const grades = ["A", "B", "C", "D"];
  const data = getRoutes()
    .filter((r) => {
      if (opts.model && r.model.id !== opts.model) return false;
      if (opts.provider && r.provider.id !== opts.provider) return false;
      if (opts.region && r.region.id !== opts.region) return false;
      if (opts.jurisdiction && grades.indexOf(r.region.jurisdiction) > grades.indexOf(opts.jurisdiction))
        return false;
      return true;
    })
    .map((r) => toRouteObject(r, { history: opts.history }));
  return {
    object: "list",
    schema_version: "1.0",
    unit_note: "Prices in EUR and USD; stored in provider billing currency with FX at capture.",
    generated_at: new Date().toISOString(),
    count: data.length,
    data,
  };
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=60",
    },
  });

export type { Display };
