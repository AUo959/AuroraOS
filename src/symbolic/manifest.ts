/**
 * SRB: AURORA_CORE | T1
 * Symbolic manifest utilities and types.
 */
import { ANCHORS, SRB, type Anchor, type SRBTag } from "./anchors.js";

export type DlpLevel = "DLP_L0_RESTRICTED" | "DLP_L1_OK" | "DLP_L2_SENSITIVE" | "DLP_L3_CONFIDENTIAL";

export interface DlpInfo {
  classification: DlpLevel;
  context_tag: string;
  notes?: string;
}

export interface SymbolicManifest<TMeta = Record<string, unknown>> {
  version: string;
  anchor: string;
  ethics_protocol: string;
  srb_tags: SRBTag[];
  dlp: DlpInfo;
  team: string;
  export_time: string;
  metadata?: TMeta;
}

export function defaultManifest<TMeta = Record<string, unknown>>(
  overrides: Partial<SymbolicManifest<TMeta>> = {}
): SymbolicManifest<TMeta> {
  return {
    version: "1.0.0",
    anchor: overrides.anchor ?? ANCHORS.CORE,
    ethics_protocol: "Picard_Delta_3",
    srb_tags: [SRB.CORE, SRB.T1],
    dlp: {
      classification: "DLP_L1_OK",
      context_tag: "AURORA_EXPORT",
      notes: "Default manifest for Aurora symbolic operations"
    },
    team: "AuroraOS",
    export_time: new Date().toISOString(),
    ...overrides
  };
}