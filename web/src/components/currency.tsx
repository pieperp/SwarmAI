import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Display } from "@/lib/index-data";

interface Ctx {
  display: Display;
  setDisplay: (d: Display) => void;
}

const CurrencyContext = createContext<Ctx>({ display: "EUR", setDisplay: () => {} });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [display, setDisplayState] = useState<Display>("EUR");

  useEffect(() => {
    const stored = window.localStorage.getItem("swarm-index-ccy");
    if (stored === "USD" || stored === "EUR") setDisplayState(stored);
  }, []);

  const setDisplay = useCallback((d: Display) => {
    setDisplayState(d);
    window.localStorage.setItem("swarm-index-ccy", d);
  }, []);

  return <CurrencyContext.Provider value={{ display, setDisplay }}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyToggle() {
  const { display, setDisplay } = useCurrency();
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-border">
      {(["EUR", "USD"] as const).map((c) => (
        <button
          key={c}
          onClick={() => setDisplay(c)}
          className={`num px-2.5 py-1 text-xs transition-colors ${
            display === c
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
