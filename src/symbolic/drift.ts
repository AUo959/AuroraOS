/**
 * SRB: AURORA_CORE | T1
 * Entropy & drift helpers for continuity-aware logging and arbitration.
 */
export interface DriftProbe {
  source: string;        // e.g., "mastra:agent:planner"
  anchor: string;        // e.g., "T1_AURORA_CORE"
  srb_tags?: string[];   // e.g., ["SRB_DRIFT_PROBE"]
  timestamp?: string;    // ISO time
  entropy_markers?: string[]; // caller-supplied markers
  observations: string[];     // facts or deltas
}

export function driftScore(observations: string[]): number {
  // Simple heuristic: length & diversity; replace w/ VSA or KL-based score later.
  const unique = new Set(observations.map((o) => o.toLowerCase()));
  return Math.min(1, Math.log1p(unique.size) / Math.log(64));
}

export function recordDrift(probe: DriftProbe): { score: number; probe: DriftProbe } {
  const ts = probe.timestamp ?? new Date().toISOString();
  const score = driftScore(probe.observations);
  const stamped: DriftProbe = { ...probe, timestamp: ts, srb_tags: probe.srb_tags ?? ["SRB_DRIFT_PROBE"] };
  // Hook: replace with pino or Mastra diagnostics; preserve anchor & SRB tags in logs.
  console.debug("[DRIFT]", JSON.stringify({ score, ...stamped }));
  return { score, probe: stamped };
}