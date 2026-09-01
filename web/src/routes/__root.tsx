import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CurrencyProvider, CurrencyToggle } from "@/components/currency";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="num text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">No such route</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every page here is keyed on model @ provider @ region. This one isn't in the index.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Back to the index
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Measurement unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong rendering this view. Try again or return to the index.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Swarm Index — the price of AI inference" },
      {
        name: "description",
        content:
          "Continuously measured price, performance, quality and jurisdiction for every AI inference route: model × provider × region.",
      },
      { name: "author", content: "Swarm Index" },
      { property: "og:site_name", content: "Swarm Index" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Index" },
  { to: "/frontiers", label: "Frontiers" },
  { to: "/methodology", label: "Methodology" },
  { to: "/feed", label: "Feed / API" },
] as const;

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-up" />
          </span>
          <span className="num text-sm font-bold tracking-[0.14em] text-foreground">SWARM INDEX</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-foreground bg-surface-2" }}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <CurrencyToggle />
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <p>
          Swarm Index — public reference measurement for AI inference. Site data is free to quote with
          attribution.
        </p>
        <div className="flex gap-4 sm:ml-auto">
          <Link to="/methodology" className="hover:text-foreground">
            Methodology
          </Link>
          <Link to="/feed" className="hover:text-foreground">
            Feed
          </Link>
          <a href="/api/public/v1/models" className="num hover:text-foreground">
            /v1/models
          </a>
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            {/* Required: nested routes render here. */}
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
