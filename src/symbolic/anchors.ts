/**
 * SRB: AURORA_CORE | T1
 * Central registry for anchors and SRB tags to keep lineage consistent.
 */
export const ANCHORS = {
  CORE: "T1_AURORA_CORE",
  // Add more anchors as needed for subsystems/modules.
} as const;

export const SRB = {
  CORE: "SRB_AURORA_CORE",
  EXPORT: "SRB_EXPORT",
  DRIFT: "SRB_DRIFT_PROBE",
} as const;

export type Anchor = typeof ANCHORS[keyof typeof ANCHORS];
export type SrbTag = typeof SRB[keyof typeof SRB];