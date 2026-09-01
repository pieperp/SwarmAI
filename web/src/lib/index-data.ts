/**
 * Swarm Index — canonical dataset.
 *
 * Everything is keyed on a ROUTE: model @ provider @ region.
 * Measurements here are produced by a deterministic generator seeded by the
 * route key, so the site, the detail pages and the machine-readable feed all
 * agree on exactly the same numbers (server render === client render).
 */

export type TaskFamily =
  | "general"
  | "math"
  | "coding"
  | "instruction"
  | "structured"
  | "agentic"
  | "long_context"
  | "multilingual"
  | "safety";

export const TASK_FAMILIES: { id: TaskFamily; label: string; short: string; blurb: string }[] = [
  {
    id: "general",
    label: "General knowledge & reasoning",
    short: "General",
    blurb: "Broad world knowledge and multi-step deduction, comparable to public MMLU-class suites.",
  },
  {
    id: "math",
    label: "Math",
    short: "Math",
    blurb: "Symbolic and numeric problem solving with exact-answer grading.",
  },
  {
    id: "coding",
    label: "Coding",
    short: "Coding",
    blurb: "Repo-level patching and unit-test-verified generation.",
  },
  {
    id: "instruction",
    label: "Instruction following",
    short: "Instruct",
    blurb: "Verifiable constraint satisfaction: format, length, negation, ordering.",
  },
  {
    id: "structured",
    label: "Structured extraction / JSON",
    short: "JSON",
    blurb: "Schema-valid output under strict mode, including nullable and nested schemas.",
  },
  {
    id: "agentic",
    label: "Agentic tool use",
    short: "Agentic",
    blurb: "Multi-turn tool loops, argument fidelity, recovery after a failed call.",
  },
  {
    id: "long_context",
    label: "Long context",
    short: "Long ctx",
    blurb: "Retrieval and synthesis at 32k / 128k / 1M depending on declared window.",
  },
  {
    id: "multilingual",
    label: "Multilingual",
    short: "Multiling.",
    blurb: "24 EU languages plus code-switching, graded by native reference answers.",
  },
  {
    id: "safety",
    label: "Safety & refusal behaviour",
    short: "Safety",
    blurb: "Over-refusal and under-refusal, scored symmetrically. High = calibrated.",
  },
];

export type JurisdictionGrade = "A" | "B" | "C" | "D";

export interface Provider {
  id: string;
  name: string;
  billingCurrency: "EUR" | "USD";
  homepage: string;
}

export interface Region {
  id: string;
  label: string;
  country: string;
  jurisdiction: JurisdictionGrade;
  jurisdictionNote: string;
}

export interface Model {
  id: string;
  name: string;
  family: string;
  openWeights: boolean;
  weightsVersion: string;
  contextWindow: number;
  modalities: string[];
  toolCalling: boolean;
  jsonMode: boolean;
  structuredOutput: boolean;
  deprecation: string | null;
}

export const PROVIDERS: Provider[] = [
  { id: "openai", name: "OpenAI", billingCurrency: "USD", homepage: "https://openai.com" },
  { id: "mistral", name: "Mistral AI", billingCurrency: "EUR", homepage: "https://mistral.ai" },
  { id: "anthropic", name: "Anthropic", billingCurrency: "USD", homepage: "https://anthropic.com" },
  { id: "google", name: "Google", billingCurrency: "USD", homepage: "https://ai.google.dev" },
  { id: "together", name: "Together", billingCurrency: "USD", homepage: "https://together.ai" },
  { id: "fireworks", name: "Fireworks", billingCurrency: "USD", homepage: "https://fireworks.ai" },
  { id: "groq", name: "Groq", billingCurrency: "USD", homepage: "https://groq.com" },
  { id: "scaleway", name: "Scaleway", billingCurrency: "EUR", homepage: "https://scaleway.com" },
  { id: "ovh", name: "OVHcloud", billingCurrency: "EUR", homepage: "https://ovhcloud.com" },
];

export const REGIONS: Region[] = [
  {
    id: "eu-west",
    label: "EU West",
    country: "France / Netherlands",
    jurisdiction: "A",
    jurisdictionNote: "EU-resident compute and control plane. GDPR primary, no third-country transfer.",
  },
  {
    id: "eu-central",
    label: "EU Central",
    country: "Germany / Sweden",
    jurisdiction: "A",
    jurisdictionNote: "EU-resident compute and control plane. GDPR primary, no third-country transfer.",
  },
  {
    id: "eu-hosted-us-controlled",
    label: "EU (US-controlled)",
    country: "Ireland",
    jurisdiction: "B",
    jurisdictionNote: "Data resident in the EU but operator is subject to the US CLOUD Act.",
  },
  {
    id: "us-east",
    label: "US East",
    country: "United States",
    jurisdiction: "C",
    jurisdictionNote: "US jurisdiction. CLOUD Act and FISA 702 exposure; DPF transfer required.",
  },
  {
    id: "global",
    label: "Global / undisclosed",
    country: "Undisclosed",
    jurisdiction: "D",
    jurisdictionNote: "Serving location not disclosed or rotates. Residency cannot be asserted.",
  },
];

export const MODELS: Model[] = [
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    family: "GPT",
    openWeights: false,
    weightsVersion: "2026-04-11",
    contextWindow: 400000,
    modalities: ["text", "image"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: true,
    deprecation: null,
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    family: "GPT",
    openWeights: false,
    weightsVersion: "2026-04-11",
    contextWindow: 400000,
    modalities: ["text", "image"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: true,
    deprecation: null,
  },
  {
    id: "claude-4.7-sonnet",
    name: "Claude 4.7 Sonnet",
    family: "Claude",
    openWeights: false,
    weightsVersion: "2026-02-20",
    contextWindow: 1000000,
    modalities: ["text", "image"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: true,
    deprecation: null,
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    family: "Gemini",
    openWeights: false,
    weightsVersion: "2026-05-02",
    contextWindow: 1000000,
    modalities: ["text", "image", "audio", "video"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: true,
    deprecation: null,
  },
  {
    id: "mistral-large-3",
    name: "Mistral Large 3",
    family: "Mistral",
    openWeights: false,
    weightsVersion: "2026-01-30",
    contextWindow: 256000,
    modalities: ["text", "image"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: true,
    deprecation: null,
  },
  {
    id: "mixtral-8x22b",
    name: "Mixtral 8x22B",
    family: "Mistral",
    openWeights: true,
    weightsVersion: "v0.3",
    contextWindow: 65536,
    modalities: ["text"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: false,
    deprecation: "2027-01-15",
  },
  {
    id: "llama-4-70b",
    name: "Llama 4 70B Instruct",
    family: "Llama",
    openWeights: true,
    weightsVersion: "4.0.2",
    contextWindow: 262144,
    modalities: ["text", "image"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: true,
    deprecation: null,
  },
  {
    id: "qwen3-235b",
    name: "Qwen3 235B A22B",
    family: "Qwen",
    openWeights: true,
    weightsVersion: "3.0",
    contextWindow: 131072,
    modalities: ["text"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: true,
    deprecation: null,
  },
  {
    id: "deepseek-v4",
    name: "DeepSeek V4",
    family: "DeepSeek",
    openWeights: true,
    weightsVersion: "4.0",
    contextWindow: 163840,
    modalities: ["text"],
    toolCalling: true,
    jsonMode: true,
    structuredOutput: true,
    deprecation: null,
  },
];

/** model -> providers that actually serve it, and in which regions */
const SERVING: { model: string; provider: string; regions: string[] }[] = [
  { model: "gpt-5.4", provider: "openai", regions: ["us-east", "eu-hosted-us-controlled"] },
  { model: "gpt-5.4-mini", provider: "openai", regions: ["us-east", "eu-hosted-us-controlled"] },
  { model: "claude-4.7-sonnet", provider: "anthropic", regions: ["us-east", "eu-hosted-us-controlled"] },
  { model: "gemini-3.7-flash", provider: "google", regions: ["us-east", "eu-hosted-us-controlled", "global"] },
  { model: "mistral-large-3", provider: "mistral", regions: ["eu-west", "eu-central"] },
  { model: "mixtral-8x22b", provider: "mistral", regions: ["eu-west"] },
  { model: "mixtral-8x22b", provider: "together", regions: ["us-east"] },
  { model: "mixtral-8x22b", provider: "scaleway", regions: ["eu-west"] },
  { model: "llama-4-70b", provider: "together", regions: ["us-east", "global"] },
  { model: "llama-4-70b", provider: "fireworks", regions: ["us-east"] },
  { model: "llama-4-70b", provider: "groq", regions: ["us-east", "global"] },
  { model: "llama-4-70b", provider: "scaleway", regions: ["eu-west"] },
  { model: "llama-4-70b", provider: "ovh", regions: ["eu-west", "eu-central"] },
  { model: "qwen3-235b", provider: "together", regions: ["us-east"] },
  { model: "qwen3-235b", provider: "fireworks", regions: ["us-east", "global"] },
  { model: "qwen3-235b", provider: "ovh", regions: ["eu-central"] },
  { model: "deepseek-v4", provider: "together", regions: ["us-east"] },
  { model: "deepseek-v4", provider: "fireworks", regions: ["global"] },
  { model: "deepseek-v4", provider: "scaleway", regions: ["eu-west"] },
];

/* ------------------------------------------------------------------ */
/* deterministic pseudo-random                                         */
/* ------------------------------------------------------------------ */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let s = hash(seed) || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export interface PricePoint {
  t: string;
  input: number;
  output: number;
}

export interface RoutePrice {
  currency: "EUR" | "USD";
  fxToEur: number;
  input: number;
  output: number;
  cachedInput: number;
  batchDiscount: number;
  change24h: number;
  change7d: number;
  change30d: number;
  history: PricePoint[];
  perTask: Record<TaskFamily, { tokensIn: number; tokensOut: number; costEur: number }>;
}

export interface VantagePerf {
  vantage: string;
  ttftMs: number;
  tps: number;
  p95Ms: number;
}

export interface RoutePerf {
  ttftMs: number;
  tps: number;
  p50Ms: number;
  p95Ms: number;
  throughputRps: number;
  errorRate: number;
  rateLimitHits: number;
  uptime: number;
  vantages: VantagePerf[];
  vantageSpreadMs: number;
  hourly: { hour: number; availability: number; ttftMs: number }[];
}

export interface RouteQuality {
  scores: Record<TaskFamily, number>;
  composite: number;
  fidelity: number | null;
  quantDetected: string;
  quantDisclosed: string;
}

export interface Route {
  id: string;
  model: Model;
  provider: Provider;
  region: Region;
  catalog: {
    quantDisclosed: string;
    quantDetected: string;
    rateLimits: { tier: string; rpm: number; tpm: number }[];
  };
  price: RoutePrice;
  perf: RoutePerf;
  quality: RouteQuality;
  qualityPerEuro: number;
  qualityPerSecond: number;
  lastMeasured: string;
}

const VANTAGES = ["Paris", "Frankfurt", "Stockholm", "Virginia", "Singapore"];

const BASE_QUALITY: Record<string, number> = {
  "gpt-5.4": 91,
  "gpt-5.4-mini": 82,
  "claude-4.7-sonnet": 90,
  "gemini-3.7-flash": 84,
  "mistral-large-3": 83,
  "mixtral-8x22b": 71,
  "llama-4-70b": 79,
  "qwen3-235b": 82,
  "deepseek-v4": 85,
};

const BASE_PRICE: Record<string, [number, number]> = {
  "gpt-5.4": [1.25, 10],
  "gpt-5.4-mini": [0.25, 2],
  "claude-4.7-sonnet": [3, 15],
  "gemini-3.7-flash": [0.3, 2.5],
  "mistral-large-3": [1.8, 5.4],
  "mixtral-8x22b": [0.6, 0.6],
  "llama-4-70b": [0.55, 0.75],
  "qwen3-235b": [0.4, 1.4],
  "deepseek-v4": [0.35, 1.1],
};

const FAMILY_TOKENS: Record<TaskFamily, [number, number]> = {
  general: [1200, 600],
  math: [900, 1600],
  coding: [4200, 1800],
  instruction: [800, 500],
  structured: [2600, 700],
  agentic: [9000, 2200],
  long_context: [48000, 900],
  multilingual: [1100, 800],
  safety: [600, 300],
};

const FX = { USD: 0.92, EUR: 1 };

const REF_DAY = Date.UTC(2026, 7, 28);

function buildRoute(modelId: string, providerId: string, regionId: string): Route {
  const model = MODELS.find((m) => m.id === modelId)!;
  const provider = PROVIDERS.find((p) => p.id === providerId)!;
  const region = REGIONS.find((r) => r.id === regionId)!;
  const id = `${modelId}@${providerId}@${regionId}`;
  const r = rng(id);

  /* --- price ------------------------------------------------------- */
  const [bIn, bOut] = BASE_PRICE[modelId]!;
  const mult = 0.78 + r() * 0.5;
  const input = round(bIn * mult, 3);
  const output = round(bOut * mult, 3);
  const fx = FX[provider.billingCurrency];

  const history: PricePoint[] = [];
  let curIn = input * (1 + 0.06 + r() * 0.22);
  let curOut = output * (1 + 0.06 + r() * 0.22);
  for (let d = 89; d >= 0; d--) {
    const step = d / 89;
    const jitter = 1 + (r() - 0.5) * 0.01;
    const pIn = round((input + (curIn - input) * step) * jitter, 4);
    const pOut = round((output + (curOut - output) * step) * jitter, 4);
    history.push({
      t: new Date(REF_DAY - d * 86400000).toISOString().slice(0, 10),
      input: pIn,
      output: pOut,
    });
  }
  const blended = (p: PricePoint | undefined) => p!.input * 0.75 + p!.output * 0.25;
  const now = blended(history[history.length - 1]);
  const chg = (back: number) => round(((now - blended(history[history.length - 1 - back])) / blended(history[history.length - 1 - back])) * 100, 2);

  /* --- quality ----------------------------------------------------- */
  const base = BASE_QUALITY[modelId]!;
  const servingPenalty = model.openWeights ? r() * 6 : r() * 1.5;
  const scores = {} as Record<TaskFamily, number>;
  for (const f of TASK_FAMILIES) {
    const spread = (r() - 0.45) * 14;
    scores[f.id] = round(Math.max(28, Math.min(99, base + spread - servingPenalty)), 1);
  }
  const composite = round(
    TASK_FAMILIES.reduce((a, f) => a + scores[f.id], 0) / TASK_FAMILIES.length,
    1,
  );

  const quantOptions = ["fp8", "int8", "fp16/bf16", "int4 (AWQ)"];
  const quantDisclosed = model.openWeights
    ? r() > 0.45
      ? quantOptions[Math.floor(r() * quantOptions.length)]!
      : "undisclosed"
    : "undisclosed";
  const quantDetected = model.openWeights
    ? servingPenalty > 4
      ? "int4 (AWQ)"
      : servingPenalty > 2.2
        ? "fp8"
        : "fp16/bf16"
    : "not measurable (closed weights)";
  const fidelity = model.openWeights ? round(100 - servingPenalty * 3.2 - r() * 2, 1) : null;

  /* --- price per task ---------------------------------------------- */
  const verbosity = 0.8 + r() * 0.9;
  const perTask = {} as RoutePrice["perTask"];
  for (const f of TASK_FAMILIES) {
    const [ti, to] = FAMILY_TOKENS[f.id]!;
    const tokensIn = Math.round(ti * (0.9 + r() * 0.2));
    const tokensOut = Math.round(to * verbosity);
    perTask[f.id] = {
      tokensIn,
      tokensOut,
      costEur: round(((tokensIn / 1e6) * input + (tokensOut / 1e6) * output) * fx, 5),
    };
  }

  /* --- performance ------------------------------------------------- */
  const speedBias = providerId === "groq" ? 0.35 : providerId === "fireworks" ? 0.7 : 1;
  const ttft = Math.round((180 + r() * 620) * speedBias);
  const tps = round((38 + r() * 190) / speedBias, 1);
  const p50 = Math.round(ttft + (600 + r() * 1400) / speedBias);
  const p95 = Math.round(p50 * (1.5 + r() * 1.4));

  const vantages: VantagePerf[] = VANTAGES.map((v) => {
    const homeEu = region.id.startsWith("eu");
    const far = (homeEu && (v === "Virginia" || v === "Singapore")) || (!homeEu && (v === "Paris" || v === "Frankfurt" || v === "Stockholm"));
    const pen = far ? 1.25 + r() * 0.6 : 1 + r() * 0.12;
    return {
      vantage: v,
      ttftMs: Math.round(ttft * pen),
      tps: round(tps / (far ? 1.1 : 1), 1),
      p95Ms: Math.round(p95 * pen),
    };
  });
  const spread = Math.max(...vantages.map((v) => v.ttftMs)) - Math.min(...vantages.map((v) => v.ttftMs));

  const hourly = Array.from({ length: 24 }, (_, h) => {
    const peak = Math.exp(-((h - 16) ** 2) / 22);
    return {
      hour: h,
      availability: round(100 - peak * (0.6 + r() * 2.6), 2),
      ttftMs: Math.round(ttft * (1 + peak * (0.15 + r() * 0.5))),
    };
  });

  const perf: RoutePerf = {
    ttftMs: ttft,
    tps,
    p50Ms: p50,
    p95Ms: p95,
    throughputRps: round(4 + r() * 46, 1),
    errorRate: round(r() * 1.4, 3),
    rateLimitHits: round(r() * 3.2, 2),
    uptime: round(99.2 + r() * 0.79, 3),
    vantages,
    vantageSpreadMs: spread,
    hourly,
  };

  const tiers = [
    { tier: "free", rpm: 3, tpm: 40000 },
    { tier: "tier-1", rpm: Math.round(60 + r() * 400), tpm: Math.round(2e5 + r() * 6e5) },
    { tier: "tier-3", rpm: Math.round(1000 + r() * 4000), tpm: Math.round(2e6 + r() * 8e6) },
    { tier: "enterprise", rpm: -1, tpm: -1 },
  ];

  const avgTaskCost =
    TASK_FAMILIES.reduce((a, f) => a + perTask[f.id].costEur, 0) / TASK_FAMILIES.length;

  return {
    id,
    model,
    provider,
    region,
    catalog: { quantDisclosed, quantDetected, rateLimits: tiers },
    price: {
      currency: provider.billingCurrency,
      fxToEur: fx,
      input,
      output,
      cachedInput: round(input * (0.1 + r() * 0.2), 4),
      batchDiscount: round(0.4 + r() * 0.2, 2),
      change24h: chg(1),
      change7d: chg(7),
      change30d: chg(30),
      history,
      perTask,
    },
    perf,
    quality: { scores, composite, fidelity, quantDetected, quantDisclosed },
    qualityPerEuro: round(composite / (avgTaskCost * 1000), 1),
    qualityPerSecond: round(composite / (p50 / 1000), 1),
    lastMeasured: new Date(REF_DAY + 9 * 3600000).toISOString(),
  };
}

let cache: Route[] | null = null;

export function getRoutes(): Route[] {
  if (cache) return cache;
  const out: Route[] = [];
  for (const s of SERVING) for (const rg of s.regions) out.push(buildRoute(s.model, s.provider, rg));
  cache = out.sort((a, b) => b.quality.composite - a.quality.composite);
  return cache;
}

export function getRoute(id: string): Route | undefined {
  return getRoutes().find((r) => r.id === id);
}

/* --- display helpers ---------------------------------------------- */

export type Display = "EUR" | "USD";
const EUR_TO_USD = 1 / 0.92;

/** convert a price expressed in the provider billing currency into display ccy */
export function toDisplay(value: number, billing: "EUR" | "USD", display: Display): number {
  const eur = billing === "EUR" ? value : value * FX.USD;
  return display === "EUR" ? eur : eur * EUR_TO_USD;
}

export function eurTo(value: number, display: Display): number {
  return display === "EUR" ? value : value * EUR_TO_USD;
}

export const ccySymbol = (d: Display) => (d === "EUR" ? "€" : "$");

export function fmtMoney(v: number, d: Display, digits = 2) {
  return `${ccySymbol(d)}${v.toFixed(digits)}`;
}

export const JURISDICTION_LABEL: Record<JurisdictionGrade, string> = {
  A: "EU-resident, EU-controlled",
  B: "EU-resident, third-country operator",
  C: "Third-country jurisdiction",
  D: "Undisclosed",
};
