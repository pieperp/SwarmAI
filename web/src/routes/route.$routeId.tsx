import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  getRoute,
  getRoutes,
  TASK_FAMILIES,
  JURISDICTION_LABEL,
  toDisplay,
  eurTo,
  ccySymbol,
} from "@/lib/index-data";
import { useCurrency } from "@/components/currency";
import { Delta, Grade, Sparkline, ScoreBar, SectionTitle, Pill } from "@/components/index-ui";

export const Route = createFileRoute("/route/$routeId")({
  loader: ({ params }) => {
    const r = getRoute(params.routeId);
    if (!r) throw notFound();
    return { id: r.id, name: `${r.model.name} @ ${r.provider.name} · ${r.region.label}` };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Route not found — Swarm Index" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} — price, latency & quality | Swarm Index`;
    const desc = `Continuously measured price, TTFT, tokens/s, quality per task family and jurisdiction rating for the ${loaderData.name} inference route.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: RouteDetail,
});

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="num text-xs text-accent">{n}</span>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="num text-right text-xs text-foreground">{v}</span>
    </div>
  );
}

function RouteDetail() {
  const { routeId } = Route.useParams();
  const r = getRoute(routeId)!;
  const { display } = useCurrency();
  const peers = getRoutes().filter((p) => p.model.id === r.model.id && p.id !== r.id);
  const cy = ccySymbol(display);

  const maxHourTtft = Math.max(...r.perf.hourly.map((h) => h.ttftMs));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <Link to="/" className="num text-xs text-muted-foreground hover:text-foreground">
        ← index
      </Link>

      <header className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{r.model.name}</h1>
          <div className="num mt-1 text-sm text-muted-foreground">
            {r.provider.name} <span className="text-border">@</span> {r.region.label} ·{" "}
            {r.region.country}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Grade grade={r.region.jurisdiction} />
          <span className="text-xs text-muted-foreground">{JURISDICTION_LABEL[r.region.jurisdiction]}</span>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { l: `Input ${cy}/M`, v: toDisplay(r.price.input, r.price.currency, display).toFixed(2) },
          { l: `Output ${cy}/M`, v: toDisplay(r.price.output, r.price.currency, display).toFixed(2) },
          { l: "TTFT", v: `${r.perf.ttftMs} ms` },
          { l: "Tokens/s", v: r.perf.tps },
          { l: "Composite quality", v: r.quality.composite.toFixed(1) },
        ].map((s) => (
          <div key={s.l} className="panel p-3">
            <div className="label-xs">{s.l}</div>
            <div className="num mt-1.5 text-xl">{s.v}</div>
          </div>
        ))}
      </div>

      {/* 3.1 catalog */}
      <Block n="3.1" title="Catalog">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="panel p-4">
            <KV k="Weights version" v={r.model.weightsVersion} />
            <KV k="Open weights" v={r.model.openWeights ? "yes" : "no"} />
            <KV k="Quantization disclosed" v={r.catalog.quantDisclosed} />
            <KV
              k="Quantization detected"
              v={
                r.catalog.quantDetected !== r.catalog.quantDisclosed && r.model.openWeights ? (
                  <Pill tone="warn">{r.catalog.quantDetected}</Pill>
                ) : (
                  r.catalog.quantDetected
                )
              }
            />
            <KV k="Context window" v={`${r.model.contextWindow.toLocaleString()} tok`} />
            <KV k="Modalities" v={r.model.modalities.join(", ")} />
            <KV
              k="Tool calling / JSON / structured"
              v={`${r.model.toolCalling ? "✓" : "✗"} / ${r.model.jsonMode ? "✓" : "✗"} / ${r.model.structuredOutput ? "✓" : "✗"}`}
            />
            <KV k="Deprecation" v={r.model.deprecation ?? "none announced"} />
          </div>
          <div className="panel p-4">
            <div className="label-xs mb-2">Rate limits by account tier</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="hairline text-left text-muted-foreground">
                  <th className="py-1.5 font-normal">Tier</th>
                  <th className="py-1.5 font-normal">RPM</th>
                  <th className="py-1.5 font-normal">TPM</th>
                </tr>
              </thead>
              <tbody className="num">
                {r.catalog.rateLimits.map((t) => (
                  <tr key={t.tier} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5">{t.tier}</td>
                    <td className="py-1.5">{t.rpm < 0 ? "negotiated" : t.rpm.toLocaleString()}</td>
                    <td className="py-1.5">{t.tpm < 0 ? "negotiated" : t.tpm.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">
              Exposed on the enriched{" "}
              <a className="num text-accent hover:underline" href="/api/public/v1/models">
                /v1/models
              </a>{" "}
              endpoint — an OpenAI-style client consumes it with zero new code.
            </p>
          </div>
        </div>
      </Block>

      {/* 3.2 price */}
      <Block n="3.2" title="Price">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="panel p-4">
            <KV k={`Input (${cy}/M)`} v={toDisplay(r.price.input, r.price.currency, display).toFixed(3)} />
            <KV k={`Output (${cy}/M)`} v={toDisplay(r.price.output, r.price.currency, display).toFixed(3)} />
            <KV
              k={`Cached input (${cy}/M)`}
              v={toDisplay(r.price.cachedInput, r.price.currency, display).toFixed(3)}
            />
            <KV k="Batch discount" v={`−${Math.round(r.price.batchDiscount * 100)}%`} />
            <KV k="Billing currency" v={`${r.price.currency} · FX ${r.price.fxToEur} → EUR at capture`} />
            <div className="mt-3 flex items-center gap-4">
              <div>
                <div className="label-xs">24h</div>
                <Delta value={r.price.change24h} />
              </div>
              <div>
                <div className="label-xs">7d</div>
                <Delta value={r.price.change7d} />
              </div>
              <div>
                <div className="label-xs">30d</div>
                <Delta value={r.price.change30d} />
              </div>
              <div className="ml-auto">
                <Sparkline
                  points={r.price.history.map((p) => p.input * 0.75 + p.output * 0.25)}
                  width={160}
                  height={40}
                />
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <div className="label-xs mb-2">Effective cost per task ({display})</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="hairline text-left text-muted-foreground">
                  <th className="py-1.5 font-normal">Family</th>
                  <th className="py-1.5 font-normal">Tokens in</th>
                  <th className="py-1.5 font-normal">Tokens out</th>
                  <th className="py-1.5 font-normal">Cost</th>
                </tr>
              </thead>
              <tbody className="num">
                {TASK_FAMILIES.map((f) => (
                  <tr key={f.id} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 text-foreground">{f.short}</td>
                    <td className="py-1.5 text-muted-foreground">
                      {r.price.perTask[f.id].tokensIn.toLocaleString()}
                    </td>
                    <td className="py-1.5 text-muted-foreground">
                      {r.price.perTask[f.id].tokensOut.toLocaleString()}
                    </td>
                    <td className="py-1.5 text-primary">
                      {cy}
                      {eurTo(r.price.perTask[f.id].costEur, display).toFixed(5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Block>

      {/* 3.3 performance */}
      <Block n="3.3" title="Performance">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="panel p-4">
            <KV k="TTFT" v={`${r.perf.ttftMs} ms`} />
            <KV k="Tokens / second" v={r.perf.tps} />
            <KV k="Latency p50 / p95" v={`${r.perf.p50Ms} / ${r.perf.p95Ms} ms`} />
            <KV k="Throughput under load" v={`${r.perf.throughputRps} req/s`} />
            <KV k="Error rate" v={`${r.perf.errorRate}%`} />
            <KV k="Rate-limit hits" v={`${r.perf.rateLimitHits}%`} />
            <KV k="Uptime (30d)" v={`${r.perf.uptime}%`} />
            <KV k="Vantage TTFT spread" v={`${r.perf.vantageSpreadMs} ms`} />
          </div>
          <div className="panel p-4">
            <div className="label-xs mb-2">Per vantage point</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="hairline text-left text-muted-foreground">
                  <th className="py-1.5 font-normal">Vantage</th>
                  <th className="py-1.5 font-normal">TTFT</th>
                  <th className="py-1.5 font-normal">tok/s</th>
                  <th className="py-1.5 font-normal">p95</th>
                </tr>
              </thead>
              <tbody className="num">
                {r.perf.vantages.map((v) => (
                  <tr key={v.vantage} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 text-foreground">{v.vantage}</td>
                    <td className="py-1.5">{v.ttftMs} ms</td>
                    <td className="py-1.5">{v.tps}</td>
                    <td className="py-1.5 text-muted-foreground">{v.p95Ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel mt-4 p-4">
          <div className="label-xs mb-3">Time-of-day curve (UTC) — bar height = TTFT, dot = availability</div>
          <div className="flex h-28 items-end gap-1">
            {r.perf.hourly.map((h) => (
              <div key={h.hour} className="group relative flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-sm bg-accent/40 transition-colors group-hover:bg-accent"
                  style={{ height: `${(h.ttftMs / maxHourTtft) * 100}%` }}
                />
                <span className="num mt-1 text-[9px] text-muted-foreground">{h.hour}</span>
                <span className="num pointer-events-none absolute -top-6 hidden rounded border border-border bg-popover px-1.5 py-0.5 text-[10px] group-hover:block">
                  {h.ttftMs}ms · {h.availability}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </Block>

      {/* 3.4 quality */}
      <Block n="3.4" title="Quality per task family">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="panel p-4">
            {TASK_FAMILIES.map((f) => (
              <div key={f.id} className="flex items-center gap-4 border-b border-border/60 py-2.5 last:border-0">
                <div className="w-44 shrink-0">
                  <div className="text-xs text-foreground">{f.label}</div>
                </div>
                <div className="flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-accent" style={{ width: `${r.quality.scores[f.id]}%` }} />
                  </div>
                </div>
                <span className="num w-10 text-right text-xs">{r.quality.scores[f.id].toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="panel p-4">
            <div className="label-xs">Fidelity vs Swarm reference host</div>
            {r.quality.fidelity === null ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Not measurable — closed weights, so there is no reference serving to compare against.
              </p>
            ) : (
              <>
                <div className="num mt-2 text-4xl text-foreground">{r.quality.fidelity.toFixed(1)}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  100 = output distribution indistinguishable from the same weights served at bf16 on a
                  Swarm reference host. Provider discloses{" "}
                  <span className="num text-foreground">{r.catalog.quantDisclosed}</span>; we detect{" "}
                  <span className="num text-warn">{r.catalog.quantDetected}</span>.
                </p>
              </>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <div className="label-xs">Quality per €</div>
                <div className="num text-xl text-primary">{r.qualityPerEuro}</div>
              </div>
              <div>
                <div className="label-xs">Quality per second</div>
                <div className="num text-xl text-primary">{r.qualityPerSecond}</div>
              </div>
            </div>
          </div>
        </div>
      </Block>

      {/* 3.5 jurisdiction + peers */}
      <Block n="3.5" title="Jurisdiction & alternatives">
        <div className="panel p-4">
          <div className="flex items-center gap-3">
            <Grade grade={r.region.jurisdiction} />
            <span className="text-sm text-foreground">{JURISDICTION_LABEL[r.region.jurisdiction]}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{r.region.jurisdictionNote}</p>
        </div>

        {peers.length > 0 && (
          <>
            <SectionTitle
              eyebrow="same model, other routes"
              title="Where else this model is served"
            />
            <div className="panel overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="hairline text-left">
                    {["Route", "Jur.", `In ${cy}/M`, "TTFT", "Composite", "Fidelity"].map((h) => (
                      <th key={h} className="label-xs px-3 py-2 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {peers.map((p) => (
                    <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/60">
                      <td className="px-3 py-2">
                        <Link
                          to="/route/$routeId"
                          params={{ routeId: p.id }}
                          className="num text-xs text-foreground hover:text-accent"
                        >
                          {p.provider.name} · {p.region.label}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <Grade grade={p.region.jurisdiction} />
                      </td>
                      <td className="num px-3 py-2 text-xs">
                        {toDisplay(p.price.input, p.price.currency, display).toFixed(2)}
                      </td>
                      <td className="num px-3 py-2 text-xs">{p.perf.ttftMs} ms</td>
                      <td className="px-3 py-2">
                        <ScoreBar score={p.quality.composite} />
                      </td>
                      <td className="num px-3 py-2 text-xs text-muted-foreground">
                        {p.quality.fidelity === null ? "n/a" : p.quality.fidelity.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="num mt-4 text-xs text-muted-foreground">
          Machine-readable:{" "}
          <a className="text-accent hover:underline" href={`/api/public/v1/routes?model=${r.model.id}`}>
            /api/public/v1/routes?model={r.model.id}
          </a>
        </p>
      </Block>
    </div>
  );
}
