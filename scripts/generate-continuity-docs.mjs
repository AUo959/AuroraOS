#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Tool files to extract schemas from
const TOOL_FILES = [
  'src/mastra/tools/driftMonitoringTool.ts',
  'src/mastra/tools/triluxOperationsTool.ts', 
  'src/mastra/tools/contextualAwarenessTool.ts',
  'src/mastra/tools/symbolicCognitionTool.ts'
];

// Continuity Steward operations mapping
const OPERATIONS = {
  'driftMonitoringTool': ['sync_anchors', 'thread_wake'],
  'triluxOperationsTool': ['t1_replay', 'replay_export'],
  'contextualAwarenessTool': ['observer_echo', 'decoherence_monitor'],
  'symbolicCognitionTool': ['thread_governance', 'continuity_alignment', 'reinforce_beacon_pulse']
};

function extractZodSchema(content, schemaName) {
  const regex = new RegExp(`${schemaName}:\\s*z\\.object\\(\\{`, 'g');
  const match = regex.exec(content);
  
  if (!match) return null;
  
  const startIndex = match.index;
  const startLine = content.substring(0, startIndex).split('\n').length;
  
  // Find matching closing brace
  let braceCount = 1;
  let endIndex = startIndex + match[0].length;
  
  while (braceCount > 0 && endIndex < content.length) {
    const char = content[endIndex];
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    endIndex++;
  }
  
  const schemaContent = content.substring(startIndex, endIndex);
  return {
    content: schemaContent,
    startLine,
    endIndex
  };
}

function extractToolId(content) {
  const match = content.match(/id:\s*['"](.*?)['"],/);
  return match ? match[1] : 'unknown';
}

function generateDocumentation() {
  let documentation = `### Continuity Steward Operations

This comprehensive suite provides advanced thread management, stability monitoring, and continuity protocols through four enhanced Mastra tools. Each tool includes specialized operations with validated performance metrics and comprehensive API interfaces.

`;

  TOOL_FILES.forEach(filePath => {
    const toolName = filePath.split('/').pop().replace('.ts', '');
    const content = readFileSync(join(rootDir, filePath), 'utf8');
    
    const toolId = extractToolId(content);
    const inputSchema = extractZodSchema(content, 'inputSchema');
    const outputSchema = extractZodSchema(content, 'outputSchema');
    
    const operations = OPERATIONS[toolName] || [];
    
    documentation += `#### ${toolName}\n`;
    documentation += `**Tool ID**: \`${toolId}\` | **Source**: \`${filePath}\`\n\n`;
    
    if (inputSchema) {
      documentation += `**Input Schema** (Line ${inputSchema.startLine}):\n`;
      documentation += '```typescript\n';
      documentation += inputSchema.content + '\n';
      documentation += '```\n\n';
    }
    
    if (outputSchema) {
      documentation += `**Output Schema** (Line ${outputSchema.startLine}):\n`;
      documentation += '```typescript\n';
      documentation += outputSchema.content + '\n';
      documentation += '```\n\n';
    }
    
    if (operations.length > 0) {
      documentation += `**Continuity Steward Operations**: ${operations.join(', ')}\n\n`;
    }
    
    documentation += '---\n\n';
  });

  documentation += `#### Testing and Verification

**Playground Testing**:
1. Use Aurora agent in Playground tab
2. Provide operation-specific prompts targeting Continuity Steward capabilities
3. Verify logs show expected operation tags and performance metrics
4. Confirm integration with existing Glyphnet Protocol v230b

**Verification Steps**:
- Check server logs for operation-specific emoji tags
- Verify success indicators in operation responses  
- Monitor performance metrics against established baselines
- Confirm schema compliance and proper parameter handling

#### Troubleshooting

**Common Issues**:
1. **Schema Validation Errors**: Verify parameter types match Zod schema definitions
2. **Performance Degradation**: Check system health and realign if needed
3. **Operation Failures**: Review input parameters and retry with proper values
4. **Integration Issues**: Confirm Glyphnet Protocol alignment and field stability

**Recovery Procedures**:
- System realignment via drift monitoring operations
- Thread governance protocols for integrity restoration
- Continuity alignment for cross-layer stability
- Emergency protocols for system-wide issues

`;

  return documentation;
}

function updateReplitMd() {
  const replitMdPath = join(rootDir, 'replit.md');
  let content = readFileSync(replitMdPath, 'utf8');
  
  const beginMarker = '<!-- BEGIN: Continuity Steward (auto-generated) -->';
  const endMarker = '<!-- END: Continuity Steward (auto-generated) -->';
  
  const beginIndex = content.indexOf(beginMarker);
  const endIndex = content.indexOf(endMarker);
  
  if (beginIndex === -1 || endIndex === -1) {
    console.error('Markers not found in replit.md. Please add BEGIN/END markers first.');
    process.exit(1);
  }
  
  const beforeContent = content.substring(0, beginIndex + beginMarker.length);
  const afterContent = content.substring(endIndex);
  
  const newDocumentation = generateDocumentation();
  
  const updatedContent = beforeContent + '\n\n' + newDocumentation + afterContent;
  
  // Atomic write
  writeFileSync(replitMdPath + '.tmp', updatedContent);
  writeFileSync(replitMdPath, updatedContent);
  
  console.log('✅ Successfully updated replit.md with Continuity Steward documentation');
}

// Main execution
try {
  updateReplitMd();
} catch (error) {
  console.error('❌ Error updating documentation:', error.message);
  process.exit(1);
}