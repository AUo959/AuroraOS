import { z } from "zod";
import { ANCHORS, SRB } from "./anchors.js";

export const DLP_LEVELS = [
  "DLP_L0_RESTRICTED",
  "DLP_L1_OK",
  "DLP_L2_LOCKED",
  "DLP_L2_SENSITIVE",
  "DLP_L3_CONFIDENTIAL",
  "DLP_RISK_P2",
] as const;

export type DlpLevel = (typeof DLP_LEVELS)[number];

const nonBlank = z.string().refine((value) => value.trim().length > 0);
const dlpSchema = z.object({
  classification: z.enum(DLP_LEVELS),
  context_tag: nonBlank,
  notes: z.union([z.string(), z.array(z.string())]).optional(),
});

export const manifestSchema = z.object({
  version: z.literal("1.0.0"),
  anchor: nonBlank,
  srb_tags: z.array(nonBlank).min(1),
  ethics_protocol: nonBlank,
  seed: nonBlank,
  team: nonBlank,
  export_time: z.string().datetime(),
  dlp: dlpSchema,
  meta: z.record(z.unknown()).optional(),
});

export type DlpInfo = z.infer<typeof dlpSchema>;
export type SymbolicManifest = z.infer<typeof manifestSchema>;

export function defaultManifest(
  overrides: Partial<SymbolicManifest> = {},
): SymbolicManifest {
  return {
    version: "1.0.0",
    anchor: ANCHORS.CORE,
    srb_tags: [SRB.CORE, SRB.EXPORT],
    ethics_protocol: "Picard_Delta_3",
    seed: "EOS_SEED_ORION",
    team: "AuroraOS",
    export_time: new Date().toISOString(),
    dlp: { classification: "DLP_L2_LOCKED", context_tag: "AURORA_EXPORT" },
    ...overrides,
  };
}
