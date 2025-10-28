/**
 * SRB: AURORA_CORE | T1
 * Anchors and SRB tags for symbolic operations.
 */

export type Anchor = string;

export const ANCHORS = {
  CORE: "AURORA_CORE",
  SECURITY: "AURORA_SECURITY", 
  EXPORT: "AURORA_EXPORT",
  GLYPHCARD: "AURORA_GLYPHCARD"
} as const;

export const SRB = {
  CORE: "SRB_AURORA_CORE",
  SECURITY: "SRB_SECURITY",
  EXPORT: "SRB_EXPORT",
  GLYPHCARD: "SRB_GLYPHCARD",
  T1: "T1"
} as const;

export type SRBTag = typeof SRB[keyof typeof SRB];