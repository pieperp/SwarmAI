import type { ReactNode } from "react";
import type { JurisdictionGrade } from "@/lib/index-data";

export function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const up = value > 0.001;
  const down = value < -0.001;
  return (
    <span
      className={`num text-xs ${up ? "text-down" : down ? "text-up" : "text-muted-foreground"}`}
      title="Price change — down is cheaper (green)"
    >
      {up ? "▲" : down ? "▼" : "–"} {Math.abs(value).toFixed(2)}
      {suffix}
    </span>
  );
}

export function Grade({ grade }: { grade: JurisdictionGrade }) {
  const cls: Record<JurisdictionGrade, string> = {
    A: "border-grade-a/50 text-grade-a bg-grade-a/10",
    B: "border-grade-b/50 text-grade-b bg-grade-b/10",
    C: "border-grade-c/50 text-grade-c bg-grade-c/10",
    D: "border-grade-d/50 text-grade-d bg-grade-d/10",
  };
  return (
    <span className={`num inline-flex h-5 w-5 items-center justify-center rounded border text-[11px] ${cls[grade]}`}>
      {grade}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="panel p-4">
      <div className="label-xs">{label}</div>
      <div className="num mt-2 text-2xl text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function Sparkline({
  points,
  width = 108,
  height = 26,
}: {
  points: number[];
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / span) * (height - 3) - 1.5;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const falling = points[points.length - 1]! <= points[0]!;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" strokeWidth="1.4" stroke={falling ? "var(--up)" : "var(--down)"} />
    </svg>
  );
}

export function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
        />
      </div>
      <span className="num text-xs text-muted-foreground">{score.toFixed(1)}</span>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-5">
      <div className="label-xs text-accent">{eyebrow}</div>
      <h2 className="mt-1.5 text-xl font-semibold text-foreground">{title}</h2>
      {desc ? <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{desc}</p> : null}
    </div>
  );
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "accent" | "warn" }) {
  const cls =
    tone === "accent"
      ? "border-accent/40 text-accent bg-accent/10"
      : tone === "warn"
        ? "border-warn/40 text-warn bg-warn/10"
        : "border-border text-muted-foreground bg-surface-2";
  return (
    <span className={`num rounded border px-1.5 py-0.5 text-[11px] ${cls}`}>{children}</span>
  );
}
