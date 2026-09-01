import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  getRoutes,
  TASK_FAMILIES,
  REGIONS,
  toDisplay,
  eurTo,
  ccySymbol,
  type TaskFamily,
} from "@/lib/index-data";
import { useCurrency } from "@/components/currency";
import { Delta, Grade, Sparkline, Stat, ScoreBar, SectionTitle, Pill } from "@/components/index-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Swarm Index — live reference price for AI inference routes" },
      {
        name: "description",
        content:
          "The reference price for AI inference. Live €/M tokens, TTFT, tokens/s, quality per task family and jurisdiction rating for every model × provider × region route.",
      },
      { property: "og:title", content: "Swarm Index — live reference price for AI inference" },
      {
        property: "og:description",
        content:
          "Every route (model × provider × region) measured continuously: price, performance, quality per task family, jurisdiction.",
      },
    ],
  }),
  component: IndexPage,
});

type SortKey = "quality" | "price" | "ttft" | "tps" | "qpe" | "qps";

function IndexPage() {
  const routes = getRoutes();
  const { display } = useCurrency();
  const [family, setFamily] = useState<TaskFamily>("general");
  const [region, setRegion] = useState<string>("all");
  const [minGrade, setMinGrade] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("quality");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const grades = ["A", "B", "C", "D"];
    let list = routes.filter((r) => {
      if (region !== "all" && r.region.id !== region) return false;
      if (minGrade !== "all" && grades.indexOf(r.region.jurisdiction) > grades.indexOf(minGrade))
        return false;
      if (q && !`${r.model.name} ${r.provider.name} ${r.region.label}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price":
          return a.price.perTask[family].costEur - b.price.perTask[family].costEur;
        case "ttft":
          return a.perf.ttftMs - b.perf.ttftMs;
        case "tps":
          return b.perf.tps - a.perf.tps;
        case "qpe":
          return b.qualityPerEuro - a.qualityPerEuro;
        case "qps":
          return b.qualityPerSecond - a.qualityPerSecond;
        default:
          return b.quality.scores[family] - a.quality.scores[family];
      }
    });
    return list;
  }, [routes, region, minGrade, q, sort, family]);

  const cheapest = [...routes].sort(
    (a, b) => a.price.perTask[family].costEur - b.price.perTask[family].costEur,
  )[0]!;
  const fastest = [...routes].sort((a, b) => a.perf.ttftMs - b.perf.ttftMs)[0]!;
  const best = [...routes].sort((a, b) => b.quality.scores[family] - a.quality.scores[family])[0]!;
  const medianEur =
    [...routes].map((r) => r.price.perTask[family].costEur).sort((a, b) => a - b)[
      Math.floor(routes.length / 2)
    ] ?? 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      {/* hero */}
      <section className="mb-10">
        <div className="label-xs text-accent">Public reference measurement · updated continuously</div>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl">
          The price of AI inference,
          <span className="text-primary"> measured</span> — not quoted.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Every route is <span className="num text-foreground">model @ provider @ region</span>. For each
          one the Index publishes catalog facts, real price including what the model actually consumes,
          performance from five vantage points, quality per task family, and a jurisdiction rating. Free
          on the site. Machine-readable for agents.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/feed"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Consume the feed
          </Link>
          <Link
            to="/methodology"
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-2"
          >
            How it's measured
          </Link>
        </div>
      </section>

      {/* tickers */}
      <section className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={`Routes tracked`}
          value={routes.length}
          hint={`${new Set(routes.map((r) => r.model.id)).size} models · ${new Set(routes.map((r) => r.provider.id)).size} providers · ${REGIONS.length} regions`}
        />
        <Stat
          label={`Median cost / task`}
          value={`${ccySymbol(display)}${eurTo(medianEur, display).toFixed(4)}`}
          hint={`${TASK_FAMILIES.find((f) => f.id === family)!.label}`}
        />
        <Stat
          label="Cheapest route"
          value={`${ccySymbol(display)}${eurTo(cheapest.price.perTask[family].costEur, display).toFixed(4)}`}
          hint={`${cheapest.model.name} @ ${cheapest.provider.name}`}
        />
        <Stat
          label="Lowest TTFT"
          value={`${fastest.perf.ttftMs} ms`}
          hint={`${fastest.model.name} @ ${fastest.provider.name} · ${fastest.region.label}`}
        />
      </section>

      {/* controls */}
      <SectionTitle
        eyebrow="Live index"
        title="All routes"
        desc="Price per task is list price multiplied by the tokens this route actually consumes on the battery — verbose models cost more than their card suggests."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter model / provider…"
          className="num h-9 w-56 rounded-md border border-input bg-surface px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <select
          value={family}
          onChange={(e) => setFamily(e.target.value as TaskFamily)}
          className="h-9 rounded-md border border-input bg-surface px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {TASK_FAMILIES.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="h-9 rounded-md border border-input bg-surface px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All regions</option>
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          value={minGrade}
          onChange={(e) => setMinGrade(e.target.value)}
          className="h-9 rounded-md border border-input bg-surface px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Any jurisdiction</option>
          <option value="A">Grade A only</option>
          <option value="B">Grade B or better</option>
          <option value="C">Grade C or better</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 rounded-md border border-input bg-surface px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="quality">Sort: quality (family)</option>
          <option value="price">Sort: cost per task</option>
          <option value="ttft">Sort: TTFT</option>
          <option value="tps">Sort: tokens/s</option>
          <option value="qpe">Sort: quality per €</option>
          <option value="qps">Sort: quality per second</option>
        </select>
        <span className="num ml-auto text-xs text-muted-foreground">{rows.length} routes</span>
      </div>

      {/* table */}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead>
            <tr className="hairline text-left">
              {[
                "Route",
                "Jur.",
                `In / Out (${ccySymbol(display)}/M)`,
                "30d",
                "90d trend",
                `${ccySymbol(display)}/task`,
                "TTFT",
                "tok/s",
                "p95",
                "Uptime",
                "Quality",
                "Fidelity",
              ].map((h) => (
                <th key={h} className="label-xs px-3 py-2.5 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/60">
                <td className="px-3 py-2.5">
                  <Link to="/route/$routeId" params={{ routeId: r.id }} className="group block">
                    <div className="font-medium text-foreground group-hover:text-accent">
                      {r.model.name}
                    </div>
                    <div className="num text-[11px] text-muted-foreground">
                      {r.provider.name} · {r.region.label}
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-2.5">
                  <Grade grade={r.region.jurisdiction} />
                </td>
                <td className="num px-3 py-2.5 text-foreground">
                  {toDisplay(r.price.input, r.price.currency, display).toFixed(2)}
                  <span className="text-muted-foreground"> / </span>
                  {toDisplay(r.price.output, r.price.currency, display).toFixed(2)}
                </td>
                <td className="px-3 py-2.5">
                  <Delta value={r.price.change30d} />
                </td>
                <td className="px-3 py-2.5">
                  <Sparkline points={r.price.history.map((p) => p.input * 0.75 + p.output * 0.25)} />
                </td>
                <td className="num px-3 py-2.5 text-primary">
                  {eurTo(r.price.perTask[family].costEur, display).toFixed(4)}
                </td>
                <td className="num px-3 py-2.5">{r.perf.ttftMs}ms</td>
                <td className="num px-3 py-2.5">{r.perf.tps}</td>
                <td className="num px-3 py-2.5 text-muted-foreground">{r.perf.p95Ms}ms</td>
                <td className="num px-3 py-2.5 text-muted-foreground">{r.perf.uptime.toFixed(2)}%</td>
                <td className="px-3 py-2.5">
                  <ScoreBar score={r.quality.scores[family]} />
                </td>
                <td className="px-3 py-2.5">
                  {r.quality.fidelity === null ? (
                    <span className="text-xs text-muted-foreground">n/a</span>
                  ) : (
                    <Pill tone={r.quality.fidelity < 88 ? "warn" : "accent"}>
                      {r.quality.fidelity.toFixed(1)}
                    </Pill>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Best on {TASK_FAMILIES.find((f) => f.id === family)!.short.toLowerCase()}:{" "}
        <span className="num text-foreground">
          {best.model.name} @ {best.provider.name}
        </span>{" "}
        ({best.quality.scores[family].toFixed(1)}). Prices stored in the provider's billing currency with
        the FX rate at capture; the API returns both.
      </p>
    </div>
  );
}
