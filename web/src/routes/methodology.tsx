import { createFileRoute } from "@tanstack/react-router";
import { TASK_FAMILIES, REGIONS, JURISDICTION_LABEL } from "@/lib/index-data";
import { Grade, SectionTitle } from "@/components/index-ui";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — how the Swarm Index measures inference routes" },
      {
        name: "description",
        content:
          "How Swarm Index measures price, performance, quality per task family, fidelity against a reference host, and jurisdiction for every AI inference route.",
      },
      { property: "og:title", content: "Swarm Index methodology" },
      {
        property: "og:description",
        content:
          "Vantage points, task-family batteries, fidelity testing for silent quantization, and the jurisdiction rating scale.",
      },
    ],
  }),
  component: Methodology,
});

function Para({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

function Methodology() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-foreground">Methodology</h1>
      <Para>
        The Index exists to be quotable. That only works if every number on the site can be traced to a
        stated procedure, a stated cadence, and a stated unit. Nothing here is a vendor-supplied figure
        unless it is labelled as one — list prices and rate limits are catalog facts; everything else is
        measured.
      </Para>

      <section className="mt-10">
        <SectionTitle eyebrow="unit of record" title="The route" />
        <Para>
          A route is <span className="num text-foreground">model @ provider @ region</span>. The same model
          served by two providers is two routes; the same provider in two regions is two routes. Averaging
          across routes hides exactly the differences that matter — quantization, residency, congestion — so
          the Index never publishes a model-level number without also publishing its constituent routes.
        </Para>
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="3.1" title="Catalog" />
        <Para>
          Weights version, disclosed quantization, context window, modalities, tool-calling / JSON-mode /
          structured-output support, rate limits by account tier, and announced deprecation dates. Polled
          every 6 hours from provider documentation and live API responses; any divergence between the two
          is recorded as a discrepancy. Published as an enriched OpenAI-style{" "}
          <a className="num text-accent hover:underline" href="/api/public/v1/models">
            /v1/models
          </a>{" "}
          so an agent consumes it with zero new code — the enrichment lives under an additive{" "}
          <span className="num">swarm_index</span> key that ordinary clients ignore.
        </Para>
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="3.2" title="Price" />
        <Para>
          €/M input, €/M output, cached input, and batch tiers, captured in the provider's own billing
          currency together with the FX rate at capture time. The site renders EUR or USD at your choice;
          the API returns both plus the stored original. Full history is retained as a time series with 24h
          / 7d / 30d change on a blended 75/25 input-output basket.
        </Para>
        <Para>
          List price is not cost. The Index also publishes{" "}
          <span className="text-foreground">effective cost per task</span>: list price multiplied by the
          tokens this route actually consumes running the battery for each family. A verbose model at a low
          list price routinely lands above a terse model at twice the list price.
        </Para>
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="3.3" title="Performance" />
        <Para>
          Time to first token (how long a user waits before output begins streaming), tokens/s, p50 and p95
          latency, throughput under sustained load, error rate, rate-limit hits, uptime, and a 24-hour
          availability curve. Probes run from five vantage points — Paris, Frankfurt, Stockholm, Virginia,
          Singapore — on a fixed schedule with identical payloads.
        </Para>
        <Para>
          The <span className="text-foreground">spread across vantage points</span> is itself a published
          metric. A route with a 40 ms spread and a route with a 900 ms spread are not the same product,
          even when their headline TTFT matches.
        </Para>
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="3.4" title="Quality per task family" />
        <Para>
          Families are chosen so Index scores stay comparable to published leaderboards, plus the agent- and
          EU-specific families those suites miss. Each battery is graded programmatically where the answer
          is verifiable and by reference rubric otherwise; the battery is rotated and partially held out to
          resist contamination.
        </Para>
        <div className="panel mt-4 divide-y divide-border/60">
          {TASK_FAMILIES.map((f) => (
            <div key={f.id} className="flex flex-col gap-1 p-3.5 sm:flex-row sm:gap-6">
              <div className="num w-48 shrink-0 text-xs text-foreground">{f.label}</div>
              <div className="text-xs text-muted-foreground">{f.blurb}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle
          eyebrow="3.4b"
          title="Fidelity — the metric nobody else publishes"
          desc="Silent quantization is the industry's open secret: the same open-weight model, served cheaper, quietly degraded."
        />
        <Para>
          For every open-weight model the Index runs the published weights on a Swarm reference host at
          bf16, then compares each provider's serving of that model against it — logprob divergence on a
          fixed prompt set, plus battery score delta. A fidelity of 100 means indistinguishable. Anything
          below roughly 88 indicates aggressive quantization or a modified serving stack, whether or not the
          provider discloses it. Closed-weight models have no reference and report{" "}
          <span className="num">null</span>.
        </Para>
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="3.5" title="Jurisdiction rating" />
        <div className="panel mt-4 divide-y divide-border/60">
          {(["A", "B", "C", "D"] as const).map((g) => {
            const example = REGIONS.find((r) => r.jurisdiction === g);
            return (
              <div key={g} className="flex items-start gap-4 p-3.5">
                <Grade grade={g} />
                <div>
                  <div className="text-sm text-foreground">{JURISDICTION_LABEL[g]}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{example?.jurisdictionNote}</div>
                </div>
              </div>
            );
          })}
        </div>
        <Para>
          The rating describes legal exposure of the serving path, not the provider's trustworthiness. It
          combines where compute physically runs, who legally controls the operator, and whether the
          provider discloses serving location at all. Undisclosed is always D — residency you cannot verify
          is residency you cannot assert.
        </Para>
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="corrections" title="Errors and disputes" />
        <Para>
          Providers can dispute any measurement. Disputed figures stay published with a dispute marker
          attached and the provider's statement alongside; they are never quietly removed. Corrections are
          versioned in the feed, so an agent that made a decision on last week's number can see what
          changed.
        </Para>
      </section>
    </div>
  );
}
