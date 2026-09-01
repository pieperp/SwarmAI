import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle, Pill } from "@/components/index-ui";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Machine-readable feed & API — Swarm Index" },
      {
        name: "description",
        content:
          "A JSON feed of every AI inference route: enriched OpenAI-style /v1/models, full route measurements, and an optimizer endpoint agents can call to pick a route.",
      },
      { property: "og:title", content: "Swarm Index feed & API for agents" },
      {
        property: "og:description",
        content:
          "Enriched /v1/models, full route measurements and a constraint-based route optimizer, as JSON.",
      },
    ],
  }),
  component: Feed,
});

function Endpoint({
  method,
  path,
  desc,
  params,
  example,
}: {
  method: string;
  path: string;
  desc: string;
  params: [string, string][];
  example: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="accent">{method}</Pill>
        <a href={path} className="num text-sm text-foreground hover:text-accent">
          {path}
        </a>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      {params.length > 0 && (
        <table className="mt-3 w-full text-xs">
          <tbody>
            {params.map(([k, v]) => (
              <tr key={k} className="border-b border-border/50 last:border-0">
                <td className="num w-44 py-1.5 text-foreground">{k}</td>
                <td className="py-1.5 text-muted-foreground">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <pre className="num mt-3 overflow-x-auto rounded-md border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
        {example}
      </pre>
    </div>
  );
}

function Feed() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
      <SectionTitle
        eyebrow="for agents and operators"
        title="Machine-readable feed"
        desc="The site is free and quotable. The feed is the same measurement, shaped so an agent can route on it without a human in the loop. Every response carries a schema_version and generated_at."
      />

      <div className="grid gap-4">
        <Endpoint
          method="GET"
          path="/api/public/v1/models"
          desc="OpenAI-style model list, enriched with catalog facts under an additive swarm_index key. Drop-in for any client that already reads /v1/models."
          params={[
            ["provider", "filter by provider id, e.g. mistral"],
            ["region", "filter by region id, e.g. eu-west"],
          ]}
          example={`curl https://swarmindex.eu/api/public/v1/models?region=eu-west

{
  "object": "list",
  "data": [
    {
      "id": "mistral-large-3@mistral@eu-west",
      "object": "model",
      "owned_by": "mistral",
      "swarm_index": {
        "context_window": 256000,
        "quantization": { "disclosed": "undisclosed", "detected": "…" },
        "jurisdiction": { "grade": "A", "note": "EU-resident…" }
      }
    }
  ]
}`}
        />

        <Endpoint
          method="GET"
          path="/api/public/v1/routes"
          desc="Full measurement for every route: catalog, price (both currencies plus billing currency and FX at capture), performance per vantage point, quality per family, and derived frontier metrics."
          params={[
            ["model", "filter by model id"],
            ["provider", "filter by provider id"],
            ["region", "filter by region id"],
            ["min_jurisdiction", "A | B | C — exclude weaker grades"],
            ["history", "true to include the full 90-day price series"],
          ]}
          example={`curl "https://swarmindex.eu/api/public/v1/routes?min_jurisdiction=A&history=true"`}
        />

        <Endpoint
          method="GET"
          path="/api/public/v1/best"
          desc="The optimizer. Give it a task family and your constraints; it returns the route to call now plus ranked alternates. This is the endpoint an executor wires into its router."
          params={[
            ["family", "general | math | coding | instruction | structured | agentic | long_context | multilingual | safety"],
            ["objective", "quality_per_eur (default) | cheapest | fastest | quality | quality_per_second"],
            ["min_quality", "floor on the family score"],
            ["max_ttft_ms", "latency ceiling"],
            ["min_jurisdiction", "A | B | C"],
          ]}
          example={`curl "https://swarmindex.eu/api/public/v1/best?family=coding&min_quality=78&min_jurisdiction=B&objective=quality_per_eur"

{
  "object": "recommendation",
  "best": { "route_id": "…@…@eu-west", "price": { … }, "performance": { … } },
  "alternates": [ { "route_id": "…", "cost_eur_per_task": 0.0041 } ]
}`}
        />
      </div>

      <div className="panel mt-8 p-5">
        <div className="label-xs">Access</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Public endpoints are open, rate-limited, CORS-enabled and cached for 60 seconds — enough to quote
          the Index, build a dashboard, or run a nightly comparison. The professional feed adds
          sub-minute refresh, full historical series, webhook alerts on price and fidelity changes, and a
          measurement SLA. That subscription is what pays for the measurement itself: the batteries,
          the vantage points, and the reference host that makes fidelity scoring possible.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/api/public/v1/routes"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the live feed
          </a>
          <a
            href="/api/public/v1/best?family=coding&objective=quality_per_eur"
            className="num rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-2"
          >
            Try /v1/best
          </a>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Attribution: cite as “Swarm Index, measured &lt;date&gt;”. Redistribution of the full feed requires a
        professional licence; quoting individual figures does not.
      </p>
    </div>
  );
}
