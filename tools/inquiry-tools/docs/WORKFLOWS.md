# Workflow Patterns

## Overview

Workflows compose agents into multi-step pipelines. They manage data flow between agents, handle errors, and track execution state.

---

## Workflow Definition

### Basic Structure

```typescript
import { Workflow, Step } from '@inquiry/core';

export const ClaimVerificationWorkflow: Workflow = {
  name: 'claim-verification',
  version: '1.0.0',
  description: 'Extract and verify claims from content',
  
  // Input schema
  input: ClaimVerificationInputSchema,
  
  // Output schema  
  output: ClaimVerificationOutputSchema,
  
  // Workflow steps
  steps: [
    // Steps defined here
  ],
  
  // Error handling
  onError: 'stop', // or 'continue', 'retry'
  
  // Timeout
  timeout: 300000, // 5 minutes
};
```

### Step Definition

```typescript
interface Step {
  id: string;                    // Unique step identifier
  agent: string;                 // Agent type to execute
  input: (ctx: WorkflowContext) => any;  // Input builder
  condition?: (ctx: WorkflowContext) => boolean;  // Skip condition
  onError?: 'stop' | 'continue' | 'retry';  // Error handling
  retries?: number;              // Retry count
  timeout?: number;              // Step timeout
}
```

---

## Common Patterns

### 1. Sequential Pipeline

Execute steps one after another.

```typescript
export const SequentialWorkflow: Workflow = {
  name: 'sequential-pipeline',
  version: '1.0.0',
  
  steps: [
    {
      id: 'extract',
      agent: 'claim-extraction',
      input: (ctx) => ({
        content: ctx.input.content,
        contentType: ctx.input.contentType,
      }),
    },
    {
      id: 'classify',
      agent: 'risk-scoring',
      input: (ctx) => ({
        claims: ctx.steps.extract.output.claims,
      }),
    },
    {
      id: 'report',
      agent: 'report-generator',
      input: (ctx) => ({
        claims: ctx.steps.extract.output.claims,
        scores: ctx.steps.classify.output.scores,
      }),
    },
  ],
};
```

**Execution Flow:**
```
Input → [Extract] → [Classify] → [Report] → Output
```

### 2. Parallel Execution

Execute independent steps simultaneously.

```typescript
export const ParallelWorkflow: Workflow = {
  name: 'parallel-verification',
  version: '1.0.0',
  
  steps: [
    {
      id: 'extract',
      agent: 'claim-extraction',
      input: (ctx) => ctx.input,
    },
    {
      id: 'verify-and-score',
      parallel: true,  // Execute children in parallel
      steps: [
        {
          id: 'verify',
          agent: 'source-verification',
          input: (ctx) => ({
            claims: ctx.steps.extract.output.claims,
            sources: ctx.input.sources,
          }),
        },
        {
          id: 'score',
          agent: 'risk-scoring',
          input: (ctx) => ({
            claims: ctx.steps.extract.output.claims,
          }),
        },
      ],
    },
    {
      id: 'synthesize',
      agent: 'report-generator',
      input: (ctx) => ({
        claims: ctx.steps.extract.output.claims,
        verifications: ctx.steps['verify-and-score'].verify.output,
        scores: ctx.steps['verify-and-score'].score.output,
      }),
    },
  ],
};
```

**Execution Flow:**
```
                    ┌─→ [Verify] ──┐
Input → [Extract] ─┤              ├─→ [Synthesize] → Output
                    └─→ [Score] ──┘
```

### 3. Fan-Out / Fan-In

Process array items in parallel, then aggregate.

```typescript
export const FanOutWorkflow: Workflow = {
  name: 'fan-out-verification',
  version: '1.0.0',
  
  steps: [
    {
      id: 'extract',
      agent: 'claim-extraction',
      input: (ctx) => ctx.input,
    },
    {
      id: 'verify-each',
      fanOut: {
        items: (ctx) => ctx.steps.extract.output.claims,
        as: 'claim',
      },
      agent: 'source-verification',
      input: (ctx) => ({
        claim: ctx.item,  // Current item from fanOut
        sources: ctx.input.sources,
      }),
    },
    {
      id: 'aggregate',
      agent: 'verification-aggregator',
      input: (ctx) => ({
        claims: ctx.steps.extract.output.claims,
        verifications: ctx.steps['verify-each'].outputs,  // Array of results
      }),
    },
  ],
};
```

**Execution Flow:**
```
               ┌─→ [Verify Claim 1] ──┐
               ├─→ [Verify Claim 2] ──┤
[Extract] ────┼─→ [Verify Claim 3] ──┼─→ [Aggregate] → Output
               ├─→ [Verify Claim 4] ──┤
               └─→ [Verify Claim N] ──┘
```

### 4. Conditional Branching

Execute different paths based on conditions.

```typescript
export const ConditionalWorkflow: Workflow = {
  name: 'conditional-processing',
  version: '1.0.0',
  
  steps: [
    {
      id: 'extract',
      agent: 'claim-extraction',
      input: (ctx) => ctx.input,
    },
    {
      id: 'quick-scan',
      agent: 'risk-scoring',
      input: (ctx) => ({
        claims: ctx.steps.extract.output.claims,
        mode: 'quick',
      }),
    },
    // Deep verification only if high-risk claims found
    {
      id: 'deep-verify',
      agent: 'deep-verification',
      condition: (ctx) => {
        const scores = ctx.steps['quick-scan'].output.scores;
        return scores.some(s => s.riskLevel === 'high');
      },
      input: (ctx) => ({
        claims: ctx.steps.extract.output.claims.filter(c => 
          ctx.steps['quick-scan'].output.scores
            .find(s => s.claimId === c.id)?.riskLevel === 'high'
        ),
      }),
    },
    // Simple report if no high-risk claims
    {
      id: 'simple-report',
      agent: 'simple-report-generator',
      condition: (ctx) => {
        const scores = ctx.steps['quick-scan'].output.scores;
        return !scores.some(s => s.riskLevel === 'high');
      },
      input: (ctx) => ({
        claims: ctx.steps.extract.output.claims,
        scores: ctx.steps['quick-scan'].output.scores,
      }),
    },
    // Detailed report if high-risk claims verified
    {
      id: 'detailed-report',
      agent: 'detailed-report-generator',
      condition: (ctx) => ctx.steps['deep-verify']?.completed,
      input: (ctx) => ({
        claims: ctx.steps.extract.output.claims,
        scores: ctx.steps['quick-scan'].output.scores,
        verifications: ctx.steps['deep-verify'].output,
      }),
    },
  ],
};
```

**Execution Flow:**
```
                              ┌─→ [Deep Verify] → [Detailed Report]
[Extract] → [Quick Scan] ────┤
                              └─→ [Simple Report]
```

### 5. Retry with Backoff

Handle transient failures with retries.

```typescript
export const RetryWorkflow: Workflow = {
  name: 'retry-verification',
  version: '1.0.0',
  
  steps: [
    {
      id: 'fetch-sources',
      agent: 'source-fetcher',
      input: (ctx) => ctx.input,
      
      // Retry configuration
      retries: 3,
      retryDelay: 1000,  // 1 second
      retryBackoff: 'exponential',  // 1s, 2s, 4s
      
      // Only retry on specific errors
      retryOn: (error) => {
        return error.code === 'TIMEOUT' || error.code === 'RATE_LIMITED';
      },
    },
    {
      id: 'verify',
      agent: 'source-verification',
      input: (ctx) => ({
        sources: ctx.steps['fetch-sources'].output.sources,
      }),
    },
  ],
};
```

### 6. Saga Pattern (Compensation)

Rollback on failure.

```typescript
export const SagaWorkflow: Workflow = {
  name: 'saga-workflow',
  version: '1.0.0',
  
  steps: [
    {
      id: 'reserve',
      agent: 'reservation-agent',
      input: (ctx) => ctx.input,
      compensate: {
        agent: 'reservation-cancel-agent',
        input: (ctx) => ({
          reservationId: ctx.steps.reserve.output.reservationId,
        }),
      },
    },
    {
      id: 'process',
      agent: 'processing-agent',
      input: (ctx) => ({
        reservationId: ctx.steps.reserve.output.reservationId,
      }),
      compensate: {
        agent: 'processing-rollback-agent',
        input: (ctx) => ({
          processId: ctx.steps.process.output.processId,
        }),
      },
    },
    {
      id: 'commit',
      agent: 'commit-agent',
      input: (ctx) => ({
        processId: ctx.steps.process.output.processId,
      }),
      // No compensation - final step
    },
  ],
  
  onError: 'compensate',  // Run compensations on failure
};
```

**On Failure:**
```
[Reserve] ✓ → [Process] ✓ → [Commit] ✗
                  ↓              ↓
           [Rollback] ←── [Cancel]
```

### 7. Sub-Workflows

Compose workflows from other workflows.

```typescript
// Reusable extraction workflow
export const ExtractionWorkflow: Workflow = {
  name: 'extraction',
  version: '1.0.0',
  steps: [
    { id: 'extract', agent: 'claim-extraction', input: (ctx) => ctx.input },
    { id: 'classify', agent: 'claim-classification', input: (ctx) => ctx.steps.extract.output },
  ],
};

// Reusable verification workflow
export const VerificationWorkflow: Workflow = {
  name: 'verification',
  version: '1.0.0',
  steps: [
    { id: 'find-sources', agent: 'source-finder', input: (ctx) => ctx.input },
    { id: 'verify', agent: 'source-verification', input: (ctx) => ({ ...ctx.input, sources: ctx.steps['find-sources'].output }) },
  ],
};

// Composed workflow
export const FullPipelineWorkflow: Workflow = {
  name: 'full-pipeline',
  version: '1.0.0',
  
  steps: [
    {
      id: 'extraction',
      workflow: 'extraction',  // Reference sub-workflow
      input: (ctx) => ctx.input,
    },
    {
      id: 'verification',
      workflow: 'verification',
      input: (ctx) => ({
        claims: ctx.steps.extraction.output.claims,
      }),
    },
    {
      id: 'report',
      agent: 'report-generator',
      input: (ctx) => ({
        extraction: ctx.steps.extraction.output,
        verification: ctx.steps.verification.output,
      }),
    },
  ],
};
```

---

## Workflow Context

The context object passed to input builders:

```typescript
interface WorkflowContext {
  // Original workflow input
  input: WorkflowInput;
  
  // Results from completed steps
  steps: Record<string, StepResult>;
  
  // Current item in fan-out
  item?: any;
  itemIndex?: number;
  
  // Workflow metadata
  workflowId: string;
  executionId: string;
  startedAt: Date;
  
  // Utilities
  logger: Logger;
  config: WorkflowConfig;
}

interface StepResult {
  completed: boolean;
  success: boolean;
  output?: any;
  error?: Error;
  duration: number;
}
```

---

## Error Handling

### Step-Level Error Handling

```typescript
{
  id: 'risky-step',
  agent: 'risky-agent',
  input: (ctx) => ctx.input,
  
  onError: 'continue',  // Don't fail workflow
  
  fallback: (ctx, error) => ({
    // Return fallback output
    status: 'skipped',
    reason: error.message,
  }),
}
```

### Workflow-Level Error Handling

```typescript
export const RobustWorkflow: Workflow = {
  name: 'robust-workflow',
  version: '1.0.0',
  
  steps: [...],
  
  onError: async (ctx, error, failedStep) => {
    // Log error
    ctx.logger.error('Workflow failed', {
      step: failedStep.id,
      error: error.message,
    });
    
    // Notify
    await notifySlack(`Workflow ${ctx.workflowId} failed at ${failedStep.id}`);
    
    // Return partial result
    return {
      status: 'partial',
      completedSteps: Object.keys(ctx.steps).filter(k => ctx.steps[k].completed),
      error: error.message,
    };
  },
};
```

---

## Execution Tracking

### Execution State

```typescript
interface WorkflowExecution {
  id: string;
  workflowName: string;
  workflowVersion: string;
  
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  input: any;
  output?: any;
  error?: string;
  
  steps: Record<string, StepExecution>;
  
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  
  metadata: {
    triggeredBy: string;
    traceId: string;
    parentExecutionId?: string;
  };
}

interface StepExecution {
  id: string;
  agent: string;
  
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  
  input?: any;
  output?: any;
  error?: string;
  
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  
  retryCount: number;
}
```

### Querying Executions

```typescript
// Get execution status
const execution = await workflowEngine.getExecution(executionId);

// List recent executions
const executions = await workflowEngine.listExecutions({
  workflow: 'claim-verification',
  status: 'failed',
  since: new Date(Date.now() - 24 * 60 * 60 * 1000),
  limit: 10,
});

// Get step details
const stepResult = execution.steps['verify'];
```

---

## Running Workflows

### Programmatic Execution

```typescript
import { WorkflowEngine } from '@inquiry/core';
import { ClaimVerificationWorkflow } from './workflows';

const engine = new WorkflowEngine();

// Register workflow
engine.register(ClaimVerificationWorkflow);

// Execute
const execution = await engine.execute('claim-verification', {
  content: 'Marketing brief content...',
  contentType: 'brief',
  sources: [...],
});

// Wait for completion
const result = await execution.waitForCompletion();

console.log(result.output);
```

### Async Execution

```typescript
// Start workflow (returns immediately)
const executionId = await engine.start('claim-verification', input);

// Check status later
const status = await engine.getStatus(executionId);

if (status === 'completed') {
  const result = await engine.getResult(executionId);
}
```

### Event-Driven Execution

```typescript
// Subscribe to workflow events
engine.on('step:completed', (event) => {
  console.log(`Step ${event.stepId} completed in ${event.duration}ms`);
});

engine.on('workflow:completed', (event) => {
  console.log(`Workflow ${event.executionId} completed`);
});

engine.on('workflow:failed', (event) => {
  console.error(`Workflow ${event.executionId} failed: ${event.error}`);
});
```

---

## Diligence Workflow Examples

### Brief Verification Workflow

```typescript
export const BriefVerificationWorkflow: Workflow = {
  name: 'brief-verification',
  version: '1.0.0',
  description: 'Verify claims in a marketing brief before creative work begins',
  
  steps: [
    // 1. Extract all claims from brief
    {
      id: 'extract-claims',
      agent: 'claim-extraction',
      input: (ctx) => ({
        content: ctx.input.briefContent,
        contentType: 'brief',
      }),
    },
    
    // 2. Score risk for each claim (parallel)
    {
      id: 'score-risks',
      fanOut: {
        items: (ctx) => ctx.steps['extract-claims'].output.claims,
        as: 'claim',
      },
      agent: 'risk-scoring',
      input: (ctx) => ({ claim: ctx.item }),
    },
    
    // 3. Find sources for high-risk claims
    {
      id: 'find-sources',
      fanOut: {
        items: (ctx) => ctx.steps['score-risks'].outputs
          .filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium')
          .map(s => ctx.steps['extract-claims'].output.claims.find(c => c.id === s.claimId)),
        as: 'claim',
      },
      agent: 'source-finder',
      input: (ctx) => ({ claim: ctx.item }),
    },
    
    // 4. Verify claims against sources
    {
      id: 'verify-claims',
      fanOut: {
        items: (ctx) => ctx.steps['find-sources'].outputs,
        as: 'claimWithSources',
      },
      agent: 'source-verification',
      input: (ctx) => ctx.item,
    },
    
    // 5. Generate brief report
    {
      id: 'generate-report',
      agent: 'brief-report-generator',
      input: (ctx) => ({
        brief: ctx.input,
        claims: ctx.steps['extract-claims'].output.claims,
        risks: ctx.steps['score-risks'].outputs,
        verifications: ctx.steps['verify-claims'].outputs,
      }),
    },
  ],
};
```

### Legal Package Workflow

```typescript
export const LegalPackageWorkflow: Workflow = {
  name: 'legal-package',
  version: '1.0.0',
  description: 'Generate legal-ready substantiation package',
  
  steps: [
    // Use brief verification as sub-workflow
    {
      id: 'verify',
      workflow: 'brief-verification',
      input: (ctx) => ctx.input,
    },
    
    // Generate audit trail
    {
      id: 'audit-trail',
      agent: 'audit-trail-generator',
      input: (ctx) => ({
        verificationResult: ctx.steps.verify.output,
      }),
    },
    
    // Package for legal
    {
      id: 'package',
      agent: 'legal-package-generator',
      input: (ctx) => ({
        verification: ctx.steps.verify.output,
        auditTrail: ctx.steps['audit-trail'].output,
        format: ctx.input.format || 'pdf',
      }),
    },
  ],
};
```

---

## Best Practices

### 1. Keep Steps Small

```typescript
// ✅ Good: Small, focused steps
steps: [
  { id: 'extract', agent: 'claim-extraction', ... },
  { id: 'classify', agent: 'claim-classification', ... },
  { id: 'verify', agent: 'claim-verification', ... },
]

// ❌ Bad: Monolithic step
steps: [
  { id: 'do-everything', agent: 'mega-agent', ... },
]
```

### 2. Use Parallel When Possible

```typescript
// ✅ Good: Independent operations in parallel
{
  id: 'parallel-ops',
  parallel: true,
  steps: [
    { id: 'verify', ... },
    { id: 'score', ... },
    { id: 'categorize', ... },
  ],
}
```

### 3. Handle Errors Gracefully

```typescript
// ✅ Good: Fallback for non-critical steps
{
  id: 'enrich',
  agent: 'enrichment-agent',
  onError: 'continue',
  fallback: (ctx, error) => ({ enriched: false }),
}
```

### 4. Version Your Workflows

```typescript
// ✅ Good: Semantic versioning
export const MyWorkflow: Workflow = {
  name: 'my-workflow',
  version: '2.1.0',  // Breaking.Feature.Patch
  ...
};
```

### 5. Use Sub-Workflows for Reuse

```typescript
// ✅ Good: Compose from smaller workflows
{
  id: 'verify',
  workflow: 'verification',  // Reuse
  input: (ctx) => ctx.steps.extract.output,
}
```

---

## Next Steps

- [Agent Development Guide](./agents.md) — Building agents for your workflows
- [Neo4j Schema Guide](./neo4j.md) — Storing workflow data
- [User Guide](./USER-GUIDE.md) — Running workflows
