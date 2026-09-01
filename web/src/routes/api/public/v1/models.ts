import { createFileRoute } from "@tanstack/react-router";
import { getRoutes } from "@/lib/index-data";
import { json, toModelObject } from "@/lib/index-feed";

export const Route = createFileRoute("/api/public/v1/models")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const provider = url.searchParams.get("provider");
        const region = url.searchParams.get("region");
        const data = getRoutes()
          .filter((r) => (!provider || r.provider.id === provider) && (!region || r.region.id === region))
          .map(toModelObject);
        return json({ object: "list", data });
      },
    },
  },
});
