import { SRB } from "./anchors.js";

export interface DriftProbe {
  source: string;
  anchor: string;
  srb_tags?: string[];
  timestamp?: string;
  entropy_markers?: string[];
  observations: string[];
}

export function driftScore(observations: string[]): number {
  const unique = new Set(
    observations.map((observation) => observation.toLowerCase()),
  );
  return Math.min(1, Math.log1p(unique.size) / Math.log(64));
}

export function recordDrift(probe: DriftProbe) {
  const stamped = {
    ...probe,
    timestamp: probe.timestamp ?? new Date().toISOString(),
    srb_tags: probe.srb_tags ?? [SRB.DRIFT],
  };
  const score = driftScore(probe.observations);
  const { source, anchor, srb_tags, timestamp } = stamped;
  console.debug("[DRIFT]", { source, anchor, srb_tags, timestamp, score });
  return { score, probe: stamped };
}
