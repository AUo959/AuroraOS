# Glyphcards

Glyphcards are deterministic, DLP-aware summaries for sealed artifacts in AuroraOS. They provide a standardized way to create lightweight metadata summaries without exposing sensitive payload content.

## Intent

Glyphcards serve as:
- **Audit trails**: Providing cryptographic digests and metadata for exported artifacts
- **DLP compliance**: Ensuring data loss prevention through controlled information exposure
- **Operational transparency**: Enabling secure visibility into system exports
- **Deterministic summaries**: Consistent, reproducible artifact descriptions

## Structure

A glyphcard contains the following fields in deterministic order:

```typescript
{
  title: "Glyphcard",
  algo: "aurora-simple-hash-v1",
  digest: "a1b2c3d4",
  created_at: "2024-01-01T00:00:00.000Z",
  anchor: "AURORA_CORE",
  ethics_protocol: "Picard_Delta_3",
  srb_tags: ["SRB_AURORA_CORE", "T1"],
  classification: "DLP_L1_OK",
  context_tag: "AURORA_EXPORT",
  manifest_version: "1.0.0",
  team: "AuroraOS",
  export_time: "2024-01-01T00:00:00.000Z",
  artifact_stats: {
    byte_length: 42,
    type: "object",
    keys: 3
  },
  redacted: true
}
```

### Field Descriptions

- **title**: Always "Glyphcard" for identification
- **algo**: Hashing algorithm used for seal digest
- **digest**: Cryptographic digest of the sealed artifact
- **created_at**: Timestamp when the seal was created
- **anchor**: SRB anchor for the operation
- **ethics_protocol**: Ethics framework identifier
- **srb_tags**: Security/Reasoning/Behavior tags
- **classification**: DLP classification level
- **context_tag**: DLP context identifier
- **manifest_version**: Semantic version of the manifest format
- **team**: Team responsible for the artifact
- **export_time**: Timestamp when the export occurred
- **artifact_stats**: Statistical summary of the artifact
- **redacted**: Boolean indicating if sensitive content is excluded

## Redaction

By default, glyphcards are redacted (`redacted: true`) to prevent sensitive data exposure. This means:

- **No payload excerpts**: Actual artifact content is never included
- **Statistical summaries only**: Only byte length, type, and key/element counts
- **Metadata focus**: Emphasis on procedural and administrative information

Redaction can be disabled in non-production environments by setting `AURORA_GLYPHCARD_REDACT=0` or using the `redact: false` option.

## Usage Examples

### Basic Generation

```typescript
import { makeGlyphcard, createSeal, defaultManifest } from "@auroraos/core";

const artifact = { data: "example" };
const manifest = defaultManifest();
const sealed = await createSeal(artifact, manifest);
const glyphcard = makeGlyphcard(sealed);
```

### With Export Guard

```typescript
import { guardExport } from "@auroraos/core";

const result = await guardExport(artifact, {
  makeGlyphcard: true,
  redactGlyphcard: true
});

console.log(result.glyphcard);
```

### CLI Usage

```bash
# Generate glyphcard from a sealed bundle
echo '{"artifact":{},"manifest":{},"seal":{}}' | npm run glyphcard

# Generate glyphcard from file
npm run glyphcard --file sealed-bundle.json

# Generate unredacted glyphcard (development only)
npm run glyphcard --no-redact --file bundle.json
```

## Environment Configuration

```bash
# Enable automatic glyphcard generation
AURORA_GLYPHCARDS=1

# Disable redaction (development only)
AURORA_GLYPHCARD_REDACT=0
```

## Security Considerations

1. **Always redact in production**: Set `AURORA_GLYPHCARD_REDACT=1`
2. **Monitor digest uniqueness**: Ensure artifacts produce unique digests
3. **Audit glyphcard generation**: Log all glyphcard creation events
4. **Validate classification levels**: Ensure DLP classifications are appropriate
5. **Secure transmission**: Treat glyphcards as controlled metadata

## Deterministic Behavior

Glyphcards are designed to be deterministic:
- Same artifact + manifest = identical glyphcard
- Field order is consistent across generations
- Timestamps reflect actual creation/export times
- Hash digests use stable artifact serialization

This determinism enables reliable auditing, comparison, and verification workflows.