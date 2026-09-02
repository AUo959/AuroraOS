/**
 * SRB: AURORA_CORE | T1
 * Symbolic manifest schema for all exports, snapshots, and thread bundles.
 * Include this alongside any exported artifact for traceability and DLP.
 */
export type DlpLevel = "DLP_L1_OK" | "DLP_L2_LOCKED" | "DLP_RISK_P2";

export interface DlpInfo {
  classification: DlpLevel;
  notes?: string[];
  context_tag?: string; // required for reflex logs / audit trails
}

export interface SealInfo {
  algo: "SHA256";
  digest: string; // hex
  created_at: string; // ISO timestamp
}

export interface SymbolicManifest<TMeta = Record<string, unknown>> {
  version: string; // e.g., "0.1.0"
  anchor: string;  // e.g., "T1_AURORA_CORE"
  srb_tags: string[]; // e.g., ["SRB_AURORA_CORE", "SRB_EXPORT"]
  ethics_protocol: string; // e.g., "Picard_Delta_3"
  seed?: string; // e.g., "EOS_SEED_ORION"
  team?: string; // e.g., "AuroraOS"
  export_time: string; // ISO timestamp
  dlp: DlpInfo;
  seal?: SealInfo;
  meta?: TMeta;
}

export function defaultManifest(input: Partial<SymbolicManifest> & Pick<SymbolicManifest, "anchor">): SymbolicManifest {
  const now = new Date().toISOString();
  return {
    version: "0.1.0",
    anchor: input.anchor,
    srb_tags: input.srb_tags ?? ["SRB_AURORA_CORE", "SRB_EXPORT"],
    ethics_protocol: input.ethics_protocol ?? "Picard_Delta_3",
    seed: input.seed ?? "EOS_SEED_ORION",
    team: input.team ?? "AuroraOS",
    export_time: now,
    dlp: input.dlp ?? { classification: "DLP_L1_OK", context_tag: "AURORA_EXPORT" },
    seal: input.seal,
    meta: input.meta ?? {},
  };
}