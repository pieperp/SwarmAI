import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getRoutes, TASK_FAMILIES, eurTo, ccySymbol, type TaskFamily } from "@/lib/index-data";
import { useCurrency } from "@/components/currency";
import { Grade, SectionTitle } from "@/components/index-ui";

export const Route = createFileRoute("/frontiers")({
  head: () => ({
    meta: [
      { title: "Quality-per-€ and quality-per-second frontiers | Swarm Index" },
      {
        name: "description",
        content:
          "The efficient frontier of AI inference: which routes are Pareto-optimal on quality versus cost, and on quality versus latency, per task family.",
      },
      { property: "og:title", content: "Quality-per-€ and quality-per-second frontiers" },
      {
        property: "og:description",
        content: "Pareto-optimal AI inference routes on cost and latency, measured per task family.",
      },
    ],
  }),
  component: Frontiers,
});

function Scatter({
  points,
  xLabel,
  yLabel,
}: {
  points: { id: string; x: number; y: number; label: string; grade: "A" | "B" | "C" | "D" }[];
  xLabel: string;
  yLabel: string;
}) {
  const W = 640;
  const H = 320;
  const pad = 42;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs) * 0.9;
  const xMax = Math.max(...xs) * 1.05;
  const yMin = Math.min(...ys) - 3;
  const yMax = Math.max(...ys) + 3;
  const px = (x: number) => pad + ((x - xMin) / (xMax - xMin || 1)) * (W - pad - 12);
  const py = (y: number) => H - pad - ((y - yMin) / (yMax - yMin || 1)) * (H - pad - 16);

  // Pareto frontier: minimize x, maximize y
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const frontier: typeof points = [];
  let bestY = -Infinity;
  for (const p of sorted) {
    if (p.y > bestY) {
      frontier.push(p);
      bestY = p.y;
    }
  }
  const path = frontier.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.x)},${py(p.y)}`).join(" ");
  const gradeColor = { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)", D: "var(--grade-d)" };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={W - 12}
          y1={pad / 2 + t * (H - pad - 16)}
          y2={pad / 2 + t * (H - pad - 16)}
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="4 3" />
      {points.map((p) => (
        <g key={p.id}>
          <circle cx={px(p.x)} cy={py(p.y)} r={frontier.includes(p) ? 5 : 3.2} fill={gradeColor[p.grade]}>
            <title>{`${p.label} — ${xLabel}: ${p.x}, ${yLabel}: ${p.y}`}</title>
          </circle>
        </g>
      ))}
      <text x={pad} y={H - 8} fill="var(--muted-foreground)" fontSize="11" fontFamily="var(--font-mono)">
        {xLabel} →
      </text>
      <text
        x={10}
        y={20}
        fill="var(--muted-foreground)"
        fontSize="11"
        fontFamily="var(--font-mono)"
      >
        ↑ {yLabel}
      </text>
    </svg>
  );
}

function Frontiers() {
  const routes = getRoutes();
  const { display } = useCurrency();
  const [family, setFamily] = useState<TaskFamily>("coding");

  const costPoints = useMemo(
    () =>
      routes.map((r) => ({
        id: r.id,
        x: Number(eurTo(r.price.perTask[family].costEur, display).toFixed(5)),
        y: r.quality.scores[family],
        label: `${r.model.name} @ ${r.provider.name}`,
        grade: r.region.jurisdiction,
      })),
    [routes, family, display],
  );

  const latencyPoints = useMemo(
    () =>
      routes.map((r) => ({
        id: r.id,
        x: r.perf.p50Ms,
        y: r.quality.scores[family],
        label: `${r.model.name} @ ${r.provider.name}`,
        grade: r.region.jurisdiction,
      })),
    [routes, family],
  );

  const topQpe = [...routes].sort((a, b) => b.qualityPerEuro - a.qualityPerEuro).slice(0, 8);
  const topQps = [...routes].sort((a, b) => b.qualityPerSecond - a.qualityPerSecond).slice(0, 8);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <SectionTitle
        eyebrow="derived metrics"
        title="Efficient frontiers"
        desc="Every dot is a route, coloured by jurisdiction grade. The dashed line is the Pareto frontier: no route above and to the left of it exists. Everything below the line is dominated — you are paying or waiting for nothing."
      />

      <select
        value={family}
        onChange={(e) => setFamily(e.target.value as TaskFamily)}
        className="mb-6 h-9 rounded-md border border-input bg-surface px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        {TASK_FAMILIES.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <div className="label-xs mb-2">Quality per {ccySymbol(display)} — cost per task vs score</div>
          <Scatter points={costPoints} xLabel={`${ccySymbol(display)}/task`} yLabel="quality" />
        </div>
        <div className="panel p-4">
          <div className="label-xs mb-2">Quality per second — p50 latency vs score</div>
          <Scatter points={latencyPoints} xLabel="p50 ms" yLabel="quality" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {[
          { title: "Top quality per €", list: topQpe, get: (r: (typeof topQpe)[number]) => r.qualityPerEuro },
          {
            title: "Top quality per second",
            list: topQps,
            get: (r: (typeof topQps)[number]) => r.qualityPerSecond,
          },
        ].map((b) => (
          <div key={b.title} className="panel p-4">
            <div className="label-xs mb-2">{b.title}</div>
            <table className="w-full text-sm">
              <tbody>
                {b.list.map((r, i) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0">
                    <td className="num w-6 py-2 text-xs text-muted-foreground">{i + 1}</td>
                    <td className="py-2">
                      <Link
                        to="/route/$routeId"
                        params={{ routeId: r.id }}
                        className="text-xs text-foreground hover:text-accent"
                      >
                        {r.model.name} <span className="text-muted-foreground">@ {r.provider.name}</span>
                      </Link>
                    </td>
                    <td className="py-2">
                      <Grade grade={r.region.jurisdiction} />
                    </td>
                    <td className="num py-2 text-right text-xs text-primary">{b.get(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
