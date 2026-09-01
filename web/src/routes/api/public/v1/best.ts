import { createFileRoute } from "@tanstack/react-router";
import { getRoutes, TASK_FAMILIES, type TaskFamily } from "@/lib/index-data";
import { json, toRouteObject } from "@/lib/index-feed";

/**
 * Optimizer endpoint: "given this task family and these constraints, which
 * route should my agent call right now?"
 */
export const Route = createFileRoute("/api/public/v1/best")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const p = new URL(request.url).searchParams;
        const family = (p.get("family") ?? "general") as TaskFamily;
        if (!TASK_FAMILIES.some((f) => f.id === family)) {
          return json(
            { error: { message: `unknown family '${family}'`, families: TASK_FAMILIES.map((f) => f.id) } },
            400,
          );
        }
        const objective = p.get("objective") ?? "quality_per_eur";
        const minQuality = Number(p.get("min_quality") ?? 0);
        const maxTtft = Number(p.get("max_ttft_ms") ?? Infinity);
        const grades = ["A", "B", "C", "D"];
        const minJur = p.get("min_jurisdiction");

        const candidates = getRoutes().filter(
          (r) =>
            r.quality.scores[family] >= minQuality &&
            r.perf.ttftMs <= maxTtft &&
            (!minJur || grades.indexOf(r.region.jurisdiction) <= grades.indexOf(minJur)),
        );

        const score = (r: (typeof candidates)[number]) => {
          switch (objective) {
            case "cheapest":
              return -r.price.perTask[family].costEur;
            case "fastest":
              return -r.perf.ttftMs;
            case "quality":
              return r.quality.scores[family];
            case "quality_per_second":
              return r.qualityPerSecond;
            default:
              return r.quality.scores[family] / (r.price.perTask[family].costEur * 1000);
          }
        };

        const ranked = [...candidates].sort((a, b) => score(b) - score(a)).slice(0, 5);
        if (ranked.length === 0) return json({ error: { message: "no route satisfies constraints" } }, 404);

        return json({
          object: "recommendation",
          family,
          objective,
          generated_at: new Date().toISOString(),
          best: toRouteObject(ranked[0]!),
          alternates: ranked.slice(1).map((r) => ({
            route_id: r.id,
            quality: r.quality.scores[family],
            cost_eur_per_task: r.price.perTask[family].costEur,
            ttft_ms: r.perf.ttftMs,
            jurisdiction: r.region.jurisdiction,
          })),
        });
      },
    },
  },
});
