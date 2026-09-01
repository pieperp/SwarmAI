import { createFileRoute } from "@tanstack/react-router";
import { feedPayload, json } from "@/lib/index-feed";

export const Route = createFileRoute("/api/public/v1/routes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const p = new URL(request.url).searchParams;
        return json(
          feedPayload({
            model: p.get("model"),
            provider: p.get("provider"),
            region: p.get("region"),
            jurisdiction: p.get("min_jurisdiction"),
            history: p.get("history") === "true",
          }),
        );
      },
    },
  },
});
