# Anchor Registry

Status: T1 Anchor | SRB: AURORA_CORE | Registry Version: 0.1.0

## Active T1 Anchors

### T1_AURORA_CORE
- **Purpose**: Core symbolic utilities and manifest system
- **Scope**: Primary anchor for all AuroraOS symbolic operations
- **Dependencies**: None (root anchor)
- **SRB Tags**: SRB_AURORA_CORE, SRB_EXPORT
- **Lifecycle**: Active since initial implementation

### Future Anchors
- **T1_MASTRA_BRIDGE**: Integration points with Mastra agent framework
- **T1_AGENT_THREAD**: Individual agent execution contexts
- **T1_WORKFLOW_STATE**: Mastra workflow state preservation
- **T1_CONNECTOR_SYNC**: External system synchronization anchors

## SRB Tag Registry

### SRB_AURORA_CORE
- **Scope**: Core system operations, logging, initialization
- **Applied to**: All symbolic utility functions, main exports

### SRB_EXPORT
- **Scope**: Export operations, manifest generation
- **Applied to**: Artifact exports, sealed bundles

### SRB_DRIFT_PROBE
- **Scope**: Drift monitoring, entropy measurement
- **Applied to**: All drift recording operations

### SRB_RELIQUARY_INDEX
- **Scope**: Repository indexing and anchor discovery
- **Applied to**: Reliquary index generation

## Anchor Guidelines

1. **Naming Convention**: T1_ prefix for primary anchors, subsystem suffix
2. **Uniqueness**: Each anchor must be globally unique within the system
3. **Immutability**: Once assigned, anchor names should not change
4. **Documentation**: All anchors must be documented in this registry
5. **Traceability**: Anchor usage must be traceable through SRB tags

## Registry Maintenance

- Updates to this registry require sealed commit with T1_AURORA_CORE anchor
- New anchor proposals should include scope, purpose, and SRB tag mapping
- Deprecated anchors remain documented for historical traceability
- Registry changes trigger reliquary index rebuild

## Usage

```typescript
import { ANCHORS, SRB } from "./src/symbolic/anchors.js";

// Use registered anchors
const manifest = defaultManifest({ anchor: ANCHORS.CORE });

// Apply appropriate SRB tags
const probe = recordDrift({
  source: "agent:planner",
  anchor: ANCHORS.CORE,
  srb_tags: [SRB.CORE, SRB.DRIFT],
  observations: ["state_change"]
});
```