# Inquiry Framework - User Guide

## Overview

The Inquiry Framework is a schematics system for building knowledge verification applications. It provides CLI tools to generate agents, workflows, Neo4j schemas, and Angular components.

---

## Installation

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Neo4j (Docker or AuraDB)
- Firebase project (optional, for cloud deployment)

### Install the CLI

```bash
# Install globally
npm install -g @inquiry/cli

# Or use npx
npx @inquiry/cli --help
```

### Verify Installation

```bash
inquiry --version
inquiry --help
```

---

## Quick Start

### 1. Initialize a New Project

```bash
# Create new Angular project (if needed)
ng new my-app --standalone --style=scss
cd my-app

# Initialize Inquiry Framework
inquiry init
```

This creates:
```
my-app/
├── inquiry/
│   ├── agents/           # Your agents
│   ├── contracts/        # Type definitions
│   ├── workflows/        # Workflow definitions
│   └── graph/            # Neo4j schema
├── inquiry.config.ts     # Configuration
└── ... (existing Angular files)
```

### 2. Generate Your First Agent

```bash
inquiry g agent ClaimExtraction --type=extraction
```

Creates:
```
inquiry/agents/claim-extraction/
├── index.ts
├── claim-extraction.agent.ts
├── claim-extraction.schema.ts
├── prompts/
│   └── claim-extraction.prompt.ts
└── claim-extraction.agent.spec.ts
```

### 3. Generate Neo4j Schema

```bash
inquiry g node Claim
inquiry g node Source
inquiry g relationship SUPPORTED_BY --from=Claim --to=Source
```

### 4. Generate a Workflow

```bash
inquiry g workflow ClaimVerification
```

---

## CLI Commands

### inquiry init

Initialize Inquiry Framework in an existing project.

```bash
inquiry init [options]

Options:
  --path <path>     Target directory (default: current)
  --skip-install    Don't install dependencies
  --dry-run         Preview without creating files
```

### inquiry generate (g)

Generate components from templates.

```bash
inquiry g <schematic> [name] [options]

Schematics:
  agent        Generate an agent
  node         Generate a Neo4j node type
  relationship Generate a Neo4j relationship
  workflow     Generate a workflow
  contracts    Generate contract types
  component    Generate an Angular component

Options:
  --type <type>     Component subtype
  --dry-run         Preview without creating files
  --skip-tests      Don't generate test files
```

### inquiry migrate

Run Neo4j migrations.

```bash
inquiry migrate [options]

Options:
  --up              Run pending migrations (default)
  --down            Rollback last migration
  --status          Show migration status
  --create <name>   Create new migration file
```

### inquiry dev

Start development environment.

```bash
inquiry dev [options]

Options:
  --neo4j           Start Neo4j Docker container
  --firebase        Start Firebase emulators
  --all             Start everything
```

---

## Generating Agents

### Agent Types

| Type | Purpose | Use Case |
|------|---------|----------|
| `extraction` | Extract structured data from content | Claim extraction, entity recognition |
| `classification` | Categorize inputs | Claim categorization, risk scoring |
| `verification` | Verify claims against sources | Fact-checking, substantiation |
| `synthesis` | Combine multiple inputs | Knowledge synthesis, report generation |
| `workflow` | Orchestrate other agents | Multi-step pipelines |

### Examples

```bash
# Extraction agent
inquiry g agent ClaimExtraction --type=extraction

# Classification agent
inquiry g agent RiskScoring --type=classification

# Verification agent
inquiry g agent SourceVerification --type=verification

# Synthesis agent
inquiry g agent ReportGenerator --type=synthesis

# Workflow agent
inquiry g agent BriefProcessor --type=workflow
```

### Agent Structure

```typescript
// inquiry/agents/claim-extraction/claim-extraction.agent.ts

import { BaseAgent, AgentContext, AgentResult } from '@inquiry/core';
import { ClaimExtractionInput, ClaimExtractionOutput } from './claim-extraction.schema';

export class ClaimExtractionAgent extends BaseAgent<ClaimExtractionInput, ClaimExtractionOutput> {
  
  readonly type = 'claim-extraction';
  readonly version = '1.0.0';
  
  async execute(
    input: ClaimExtractionInput,
    context: AgentContext
  ): Promise<AgentResult<ClaimExtractionOutput>> {
    
    // Your logic here
    
    return this.success(output);
  }
}
```

---

## Generating Neo4j Schema

### Node Types

```bash
inquiry g node <NodeName> [options]

Options:
  --properties      Interactive property definition
  --from-interface  Generate from TypeScript interface
```

Example:
```bash
inquiry g node Claim
```

Creates:
```
inquiry/graph/nodes/claim/
├── claim.interface.ts
├── claim.queries.ts
└── claim.constraints.cypher
```

### Relationships

```bash
inquiry g relationship <NAME> --from=<Node> --to=<Node>
```

Example:
```bash
inquiry g relationship SUPPORTED_BY --from=Claim --to=Source
```

---

## Generating Workflows

### Create a Workflow

```bash
inquiry g workflow <WorkflowName>
```

Example:
```bash
inquiry g workflow ClaimVerification
```

Creates:
```
inquiry/workflows/claim-verification/
├── claim-verification.workflow.ts
├── claim-verification.steps.ts
└── claim-verification.spec.ts
```

### Workflow Definition

```typescript
// inquiry/workflows/claim-verification/claim-verification.workflow.ts

import { Workflow, Step } from '@inquiry/core';

export const ClaimVerificationWorkflow: Workflow = {
  name: 'claim-verification',
  version: '1.0.0',
  
  steps: [
    {
      id: 'extract',
      agent: 'claim-extraction',
      input: (ctx) => ctx.initialInput,
    },
    {
      id: 'verify',
      agent: 'source-verification',
      input: (ctx) => ctx.steps.extract.output,
    },
    {
      id: 'synthesize',
      agent: 'report-generator',
      input: (ctx) => ({
        claims: ctx.steps.extract.output,
        verification: ctx.steps.verify.output,
      }),
    },
  ],
};
```

---

## Configuration

### inquiry.config.ts

```typescript
import { InquiryConfig } from '@inquiry/core';

export default {
  // Project settings
  project: {
    name: 'my-project',
    root: './inquiry',
  },
  
  // Neo4j connection
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    database: 'inquiry',
  },
  
  // LLM settings
  llm: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
  },
  
  // Agent defaults
  agents: {
    timeout: 30000,
    retries: 3,
  },
  
  // Code generation
  generation: {
    style: 'standalone',
    tests: true,
    skipConfirmation: true,
  },
} satisfies InquiryConfig;
```

---

## Project Structure

After initialization, your project will have:

```
my-app/
├── inquiry/
│   ├── agents/
│   │   ├── claim-extraction/
│   │   ├── source-verification/
│   │   └── index.ts
│   │
│   ├── contracts/
│   │   ├── base.ts
│   │   ├── claim.ts
│   │   ├── source.ts
│   │   └── index.ts
│   │
│   ├── workflows/
│   │   ├── claim-verification/
│   │   └── index.ts
│   │
│   ├── graph/
│   │   ├── client.ts
│   │   ├── nodes/
│   │   ├── relationships/
│   │   └── migrations/
│   │
│   └── index.ts
│
├── inquiry.config.ts
├── package.json
└── ...
```

---

## Development Workflow

### 1. Start Development Environment

```bash
# Start Neo4j
inquiry dev --neo4j

# Or start everything
inquiry dev --all
```

### 2. Generate Components

```bash
# Generate as you go
inquiry g agent MyNewAgent --type=extraction
inquiry g node MyNode
inquiry g workflow MyWorkflow
```

### 3. Run Tests

```bash
# Run all inquiry tests
pnpm test inquiry/

# Run specific agent tests
pnpm test inquiry/agents/claim-extraction/
```

### 4. Run Migrations

```bash
# Check status
inquiry migrate --status

# Run pending
inquiry migrate --up
```

---

## Best Practices

### Agent Design

1. **Single Responsibility**: Each agent does one thing well
2. **Type Safety**: Define input/output schemas with Zod
3. **Provenance**: Always track where data came from
4. **Idempotency**: Same input should produce same output
5. **Error Handling**: Use `this.failure()` for graceful failures

### Workflow Design

1. **Small Steps**: Break workflows into small, testable steps
2. **Context Passing**: Pass only what each step needs
3. **Parallel When Possible**: Use parallel steps for independent operations
4. **Error Recovery**: Define fallback behaviors

### Neo4j Schema

1. **Index Properties**: Add indexes for frequently queried properties
2. **Use Constraints**: Unique constraints prevent duplicates
3. **Relationship Direction**: Be consistent with relationship direction
4. **Version Schema**: Use migrations for schema changes

---

## Troubleshooting

### CLI Not Found

```bash
# Check global installation
npm list -g @inquiry/cli

# Reinstall
npm install -g @inquiry/cli
```

### Neo4j Connection Failed

```bash
# Check if Neo4j is running
docker ps | grep neo4j

# Start Neo4j
inquiry dev --neo4j

# Check connection
inquiry migrate --status
```

### Generation Errors

```bash
# Run with verbose output
inquiry g agent Test --verbose

# Check config
cat inquiry.config.ts

# Dry run first
inquiry g agent Test --dry-run
```

---

## Next Steps

- [Agent Development Guide](./agents.md)
- [Workflow Patterns](./workflows.md)
- [Neo4j Schema Guide](./neo4j.md)
- [Diligence Product Setup](./products/diligence.md)
- [Vigilance Product Setup](./products/vigilance.md)
