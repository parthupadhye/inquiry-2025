# Agent Development Guide

## Overview

Agents are the core building blocks of the Inquiry Framework. Each agent performs a specific task in the knowledge verification pipeline, from extracting claims to synthesizing reports.

---

## Agent Architecture

### Base Agent Class

All agents extend `BaseAgent<TInput, TOutput>`:

```typescript
import { BaseAgent, AgentContext, AgentResult } from '@inquiry/core';

export class MyAgent extends BaseAgent<MyInput, MyOutput> {
  
  readonly type = 'my-agent';
  readonly version = '1.0.0';
  
  async execute(
    input: MyInput,
    context: AgentContext
  ): Promise<AgentResult<MyOutput>> {
    // Implementation
  }
}
```

### Agent Context

The `AgentContext` provides access to:

| Property | Type | Description |
|----------|------|-------------|
| `llm` | `LLMClient` | Language model for completions |
| `graph` | `Neo4jClient` | Knowledge graph access |
| `storage` | `StorageClient` | File storage (Firebase Storage) |
| `logger` | `Logger` | Structured logging |
| `config` | `AgentConfig` | Agent configuration |
| `traceId` | `string` | Request trace ID for debugging |

### Agent Result

Return results using helper methods:

```typescript
// Success
return this.success(output, {
  sources: ['source-id-1', 'source-id-2'],
  reasoning: 'Explanation of how result was derived',
});

// Failure
return this.failure(error, {
  retryable: true,
  fallback: partialResult,
});
```

---

## Agent Types

### 1. Extraction Agent

Extracts structured data from unstructured content.

```typescript
import { BaseAgent, AgentContext, AgentResult } from '@inquiry/core';
import { ExtractionInput, ExtractionOutput, Claim } from './schema';
import { extractionPrompt } from './prompts/extraction.prompt';

export class ClaimExtractionAgent extends BaseAgent<ExtractionInput, ExtractionOutput> {
  
  readonly type = 'claim-extraction';
  readonly agentType = 'extraction';
  readonly version = '1.0.0';
  
  async execute(
    input: ExtractionInput,
    context: AgentContext
  ): Promise<AgentResult<ExtractionOutput>> {
    
    const { content, contentType } = input;
    
    // Build prompt
    const prompt = extractionPrompt({
      content,
      contentType,
      extractionRules: this.config.extractionRules,
    });
    
    // Call LLM
    const response = await context.llm.complete(prompt, {
      responseFormat: 'json',
      schema: ClaimArraySchema,
    });
    
    // Parse and validate
    const claims = this.parseClaims(response);
    
    // Store in graph
    await this.storeClaims(claims, context);
    
    return this.success({
      claims,
      claimCount: claims.length,
      contentId: input.contentId,
    });
  }
  
  private parseClaims(response: LLMResponse): Claim[] {
    return response.parsed.claims.map((c, i) => ({
      id: `claim-${Date.now()}-${i}`,
      text: c.text,
      category: c.category,
      confidence: c.confidence,
      location: c.location,
    }));
  }
  
  private async storeClaims(claims: Claim[], context: AgentContext): Promise<void> {
    const query = `
      UNWIND $claims AS claim
      CREATE (c:Claim {
        id: claim.id,
        text: claim.text,
        category: claim.category,
        confidence: claim.confidence,
        createdAt: datetime()
      })
      RETURN c
    `;
    await context.graph.query(query, { claims });
  }
}
```

### 2. Classification Agent

Categorizes or scores inputs.

```typescript
import { BaseAgent, AgentContext, AgentResult } from '@inquiry/core';
import { ClassificationInput, ClassificationOutput } from './schema';

export class RiskScoringAgent extends BaseAgent<ClassificationInput, ClassificationOutput> {
  
  readonly type = 'risk-scoring';
  readonly agentType = 'classification';
  readonly version = '1.0.0';
  
  // Classification rules
  private readonly riskFactors = {
    health: { weight: 0.3, keywords: ['cure', 'treat', 'heal', 'prevent'] },
    financial: { weight: 0.25, keywords: ['guarantee', 'return', 'profit', 'investment'] },
    comparative: { weight: 0.2, keywords: ['best', 'better', '#1', 'leading'] },
    scientific: { weight: 0.25, keywords: ['proven', 'studies show', 'clinically', 'research'] },
  };
  
  async execute(
    input: ClassificationInput,
    context: AgentContext
  ): Promise<AgentResult<ClassificationOutput>> {
    
    const { claim } = input;
    
    // Rule-based scoring
    const ruleScore = this.calculateRuleScore(claim.text);
    
    // LLM-based scoring for nuance
    const llmScore = await this.getLLMScore(claim, context);
    
    // Combine scores
    const finalScore = (ruleScore * 0.4) + (llmScore * 0.6);
    
    const riskLevel = this.scoreToLevel(finalScore);
    
    return this.success({
      claimId: claim.id,
      riskScore: finalScore,
      riskLevel,
      factors: this.getMatchedFactors(claim.text),
      requiresReview: riskLevel === 'high' || riskLevel === 'critical',
    });
  }
  
  private calculateRuleScore(text: string): number {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    for (const [category, config] of Object.entries(this.riskFactors)) {
      const matches = config.keywords.filter(kw => lowerText.includes(kw));
      if (matches.length > 0) {
        score += config.weight * (matches.length / config.keywords.length);
      }
    }
    
    return Math.min(score, 1);
  }
  
  private scoreToLevel(score: number): RiskLevel {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    if (score >= 0.2) return 'low';
    return 'minimal';
  }
}
```

### 3. Verification Agent

Verifies claims against sources.

```typescript
import { BaseAgent, AgentContext, AgentResult } from '@inquiry/core';
import { VerificationInput, VerificationOutput, VerificationStatus } from './schema';

export class SourceVerificationAgent extends BaseAgent<VerificationInput, VerificationOutput> {
  
  readonly type = 'source-verification';
  readonly agentType = 'verification';
  readonly version = '1.0.0';
  
  async execute(
    input: VerificationInput,
    context: AgentContext
  ): Promise<AgentResult<VerificationOutput>> {
    
    const { claim, sources } = input;
    
    // Find relevant sources
    const relevantSources = await this.findRelevantSources(claim, sources, context);
    
    if (relevantSources.length === 0) {
      return this.success({
        claimId: claim.id,
        status: 'unverified',
        confidence: 0,
        sources: [],
        reasoning: 'No relevant sources found',
      });
    }
    
    // Verify against each source
    const verifications = await Promise.all(
      relevantSources.map(source => this.verifyAgainstSource(claim, source, context))
    );
    
    // Aggregate results
    const result = this.aggregateVerifications(claim, verifications);
    
    // Store verification in graph
    await this.storeVerification(result, context);
    
    return this.success(result);
  }
  
  private async verifyAgainstSource(
    claim: Claim,
    source: Source,
    context: AgentContext
  ): Promise<SourceVerification> {
    
    const prompt = verificationPrompt({
      claim: claim.text,
      sourceContent: source.content,
      sourceType: source.type,
    });
    
    const response = await context.llm.complete(prompt, {
      responseFormat: 'json',
    });
    
    return {
      sourceId: source.id,
      supports: response.parsed.supports,
      confidence: response.parsed.confidence,
      relevantExcerpt: response.parsed.excerpt,
      reasoning: response.parsed.reasoning,
    };
  }
  
  private aggregateVerifications(
    claim: Claim,
    verifications: SourceVerification[]
  ): VerificationOutput {
    
    const supporting = verifications.filter(v => v.supports);
    const contradicting = verifications.filter(v => !v.supports && v.confidence > 0.5);
    
    let status: VerificationStatus;
    let confidence: number;
    
    if (supporting.length > 0 && contradicting.length === 0) {
      status = 'verified';
      confidence = Math.max(...supporting.map(v => v.confidence));
    } else if (contradicting.length > 0 && supporting.length === 0) {
      status = 'contradicted';
      confidence = Math.max(...contradicting.map(v => v.confidence));
    } else if (supporting.length > 0 && contradicting.length > 0) {
      status = 'disputed';
      confidence = 0.5;
    } else {
      status = 'unverified';
      confidence = 0;
    }
    
    return {
      claimId: claim.id,
      status,
      confidence,
      sources: verifications,
      reasoning: this.generateReasoning(status, verifications),
    };
  }
}
```

### 4. Synthesis Agent

Combines multiple inputs into a unified output.

```typescript
import { BaseAgent, AgentContext, AgentResult } from '@inquiry/core';
import { SynthesisInput, SynthesisOutput, Report } from './schema';

export class ReportGeneratorAgent extends BaseAgent<SynthesisInput, SynthesisOutput> {
  
  readonly type = 'report-generator';
  readonly agentType = 'synthesis';
  readonly version = '1.0.0';
  
  async execute(
    input: SynthesisInput,
    context: AgentContext
  ): Promise<AgentResult<SynthesisOutput>> {
    
    const { claims, verifications, contentMetadata } = input;
    
    // Group claims by status
    const grouped = this.groupByStatus(claims, verifications);
    
    // Generate executive summary
    const summary = await this.generateSummary(grouped, context);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(grouped);
    
    // Build report
    const report: Report = {
      id: `report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      contentId: contentMetadata.id,
      
      summary,
      
      sections: [
        this.buildOverviewSection(grouped),
        this.buildVerifiedClaimsSection(grouped.verified),
        this.buildUnverifiedClaimsSection(grouped.unverified),
        this.buildDisputedClaimsSection(grouped.disputed),
        this.buildRecommendationsSection(recommendations),
      ],
      
      statistics: {
        totalClaims: claims.length,
        verified: grouped.verified.length,
        unverified: grouped.unverified.length,
        disputed: grouped.disputed.length,
        overallConfidence: this.calculateOverallConfidence(verifications),
      },
      
      provenance: this.buildProvenance(claims, verifications),
    };
    
    return this.success({
      report,
      format: 'structured',
    });
  }
  
  private async generateSummary(
    grouped: GroupedClaims,
    context: AgentContext
  ): Promise<string> {
    
    const prompt = summaryPrompt({
      verifiedCount: grouped.verified.length,
      unverifiedCount: grouped.unverified.length,
      disputedCount: grouped.disputed.length,
      highRiskClaims: grouped.unverified.filter(c => c.riskLevel === 'high'),
    });
    
    const response = await context.llm.complete(prompt);
    return response.text;
  }
  
  private generateRecommendations(grouped: GroupedClaims): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // High-risk unverified claims
    for (const claim of grouped.unverified.filter(c => c.riskLevel === 'high')) {
      recommendations.push({
        priority: 'high',
        type: 'requires-source',
        claimId: claim.id,
        action: `Provide substantiation for: "${claim.text.slice(0, 50)}..."`,
      });
    }
    
    // Disputed claims
    for (const claim of grouped.disputed) {
      recommendations.push({
        priority: 'medium',
        type: 'requires-review',
        claimId: claim.id,
        action: `Review conflicting sources for: "${claim.text.slice(0, 50)}..."`,
      });
    }
    
    return recommendations.sort((a, b) => 
      this.priorityOrder(a.priority) - this.priorityOrder(b.priority)
    );
  }
}
```

### 5. Workflow Agent

Orchestrates other agents.

```typescript
import { BaseAgent, AgentContext, AgentResult } from '@inquiry/core';
import { WorkflowInput, WorkflowOutput } from './schema';
import { AgentRegistry } from '../registry';

export class BriefProcessorAgent extends BaseAgent<WorkflowInput, WorkflowOutput> {
  
  readonly type = 'brief-processor';
  readonly agentType = 'workflow';
  readonly version = '1.0.0';
  
  private readonly steps = [
    { id: 'extract', agent: 'claim-extraction' },
    { id: 'score', agent: 'risk-scoring', parallel: true },
    { id: 'verify', agent: 'source-verification', parallel: true },
    { id: 'synthesize', agent: 'report-generator' },
  ];
  
  async execute(
    input: WorkflowInput,
    context: AgentContext
  ): Promise<AgentResult<WorkflowOutput>> {
    
    const stepResults: Record<string, any> = {};
    
    for (const step of this.steps) {
      context.logger.info(`Executing step: ${step.id}`);
      
      const agent = AgentRegistry.get(step.agent);
      const stepInput = this.buildStepInput(step.id, input, stepResults);
      
      if (step.parallel && Array.isArray(stepInput)) {
        // Execute in parallel
        const results = await Promise.all(
          stepInput.map(item => agent.execute(item, context))
        );
        stepResults[step.id] = results.map(r => r.output);
      } else {
        // Execute sequentially
        const result = await agent.execute(stepInput, context);
        
        if (!result.success) {
          return this.failure(new Error(`Step ${step.id} failed`), {
            failedStep: step.id,
            partialResults: stepResults,
          });
        }
        
        stepResults[step.id] = result.output;
      }
    }
    
    return this.success({
      report: stepResults.synthesize.report,
      steps: stepResults,
      completedAt: new Date().toISOString(),
    });
  }
  
  private buildStepInput(
    stepId: string,
    input: WorkflowInput,
    results: Record<string, any>
  ): any {
    switch (stepId) {
      case 'extract':
        return { content: input.content, contentType: input.contentType };
      
      case 'score':
        return results.extract.claims.map(claim => ({ claim }));
      
      case 'verify':
        return results.extract.claims.map(claim => ({
          claim,
          sources: input.sources,
        }));
      
      case 'synthesize':
        return {
          claims: results.extract.claims,
          scores: results.score,
          verifications: results.verify,
          contentMetadata: input.metadata,
        };
      
      default:
        throw new Error(`Unknown step: ${stepId}`);
    }
  }
}
```

---

## Agent Schemas

Define input/output schemas with Zod:

```typescript
// claim-extraction.schema.ts

import { z } from 'zod';

// Input schema
export const ExtractionInputSchema = z.object({
  contentId: z.string(),
  content: z.string(),
  contentType: z.enum(['brief', 'deliverable', 'article', 'webpage']),
  options: z.object({
    extractQuotes: z.boolean().default(true),
    extractStatistics: z.boolean().default(true),
    minConfidence: z.number().min(0).max(1).default(0.5),
  }).optional(),
});

export type ExtractionInput = z.infer<typeof ExtractionInputSchema>;

// Output schema
export const ClaimSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.enum([
    'factual',
    'statistical',
    'comparative',
    'testimonial',
    'performance',
    'health',
    'financial',
    'environmental',
  ]),
  confidence: z.number().min(0).max(1),
  location: z.object({
    start: z.number(),
    end: z.number(),
    context: z.string().optional(),
  }),
  metadata: z.record(z.unknown()).optional(),
});

export type Claim = z.infer<typeof ClaimSchema>;

export const ExtractionOutputSchema = z.object({
  claims: z.array(ClaimSchema),
  claimCount: z.number(),
  contentId: z.string(),
  processingTime: z.number().optional(),
});

export type ExtractionOutput = z.infer<typeof ExtractionOutputSchema>;
```

---

## Prompt Templates

Structure prompts for consistency:

```typescript
// prompts/extraction.prompt.ts

import { PromptTemplate } from '@inquiry/core';

export const extractionPrompt: PromptTemplate<ExtractionPromptInput> = (input) => `
You are a claim extraction specialist. Analyze the following content and extract all factual claims.

## Content Type
${input.contentType}

## Content
${input.content}

## Extraction Rules
${input.extractionRules.map(rule => `- ${rule}`).join('\n')}

## Output Format
Return a JSON array of claims. Each claim should have:
- text: The exact claim text
- category: One of [factual, statistical, comparative, testimonial, performance, health, financial, environmental]
- confidence: 0-1 score of extraction confidence
- location: { start, end } character positions

## Important
- Extract explicit claims only, not implied statements
- Include statistical claims with specific numbers
- Include comparative claims ("better than", "leading", etc.)
- Flag health and financial claims with appropriate category

Return ONLY valid JSON, no other text.
`;
```

---

## Lifecycle Hooks

Override hooks for custom behavior:

```typescript
export class MyAgent extends BaseAgent<Input, Output> {
  
  // Called once when agent is registered
  async onInit(context: AgentContext): Promise<void> {
    this.logger.info('Agent initialized');
    await this.loadConfiguration(context);
  }
  
  // Called before each execution
  async beforeExecute(input: Input, context: AgentContext): Promise<void> {
    this.logger.info('Starting execution', { inputId: input.id });
    await this.validateInput(input);
  }
  
  // Called after successful execution
  async afterExecute(
    input: Input,
    output: Output,
    context: AgentContext
  ): Promise<void> {
    this.logger.info('Execution complete', { outputId: output.id });
    await this.recordMetrics(input, output);
  }
  
  // Called on execution error
  async onError(
    error: Error,
    input: Input,
    context: AgentContext
  ): Promise<void> {
    this.logger.error('Execution failed', { error: error.message });
    await this.notifyOnFailure(error, input);
  }
  
  // Main execution
  async execute(input: Input, context: AgentContext): Promise<AgentResult<Output>> {
    // Implementation
  }
}
```

---

## Testing Agents

### Unit Tests

```typescript
// claim-extraction.agent.spec.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { ClaimExtractionAgent } from './claim-extraction.agent';
import { createMockContext, createMockLLM } from '@inquiry/testing';

describe('ClaimExtractionAgent', () => {
  let agent: ClaimExtractionAgent;
  let mockContext: AgentContext;
  
  beforeEach(() => {
    agent = new ClaimExtractionAgent();
    mockContext = createMockContext({
      llm: createMockLLM({
        responses: {
          default: {
            claims: [
              { text: 'Our product is 50% faster', category: 'performance', confidence: 0.9 },
            ],
          },
        },
      }),
    });
  });
  
  it('should extract claims from content', async () => {
    const input = {
      contentId: 'test-1',
      content: 'Our product is 50% faster than competitors.',
      contentType: 'brief' as const,
    };
    
    const result = await agent.execute(input, mockContext);
    
    expect(result.success).toBe(true);
    expect(result.output.claims).toHaveLength(1);
    expect(result.output.claims[0].category).toBe('performance');
  });
  
  it('should handle empty content', async () => {
    const input = {
      contentId: 'test-2',
      content: '',
      contentType: 'brief' as const,
    };
    
    const result = await agent.execute(input, mockContext);
    
    expect(result.success).toBe(true);
    expect(result.output.claims).toHaveLength(0);
  });
  
  it('should store claims in graph', async () => {
    const input = {
      contentId: 'test-3',
      content: 'Test content with claims.',
      contentType: 'brief' as const,
    };
    
    await agent.execute(input, mockContext);
    
    expect(mockContext.graph.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE (c:Claim'),
      expect.any(Object)
    );
  });
});
```

### Integration Tests

```typescript
// claim-extraction.integration.spec.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ClaimExtractionAgent } from './claim-extraction.agent';
import { createTestContext, setupTestGraph, teardownTestGraph } from '@inquiry/testing';

describe('ClaimExtractionAgent Integration', () => {
  let agent: ClaimExtractionAgent;
  let context: AgentContext;
  
  beforeAll(async () => {
    await setupTestGraph();
    agent = new ClaimExtractionAgent();
    context = await createTestContext();
  });
  
  afterAll(async () => {
    await teardownTestGraph();
  });
  
  it('should extract and store claims end-to-end', async () => {
    const input = {
      contentId: 'integration-test-1',
      content: `
        Our new product reduces energy consumption by 40%.
        Clinical studies prove effectiveness in 90% of cases.
        We are the #1 rated solution in the industry.
      `,
      contentType: 'brief' as const,
    };
    
    const result = await agent.execute(input, context);
    
    expect(result.success).toBe(true);
    expect(result.output.claims.length).toBeGreaterThan(0);
    
    // Verify stored in graph
    const stored = await context.graph.query(
      'MATCH (c:Claim) WHERE c.contentId = $contentId RETURN c',
      { contentId: input.contentId }
    );
    
    expect(stored.records.length).toBe(result.output.claims.length);
  });
});
```

---

## Best Practices

### 1. Single Responsibility

Each agent should do one thing well:

```typescript
// ✅ Good: Focused agent
class ClaimExtractionAgent { }
class ClaimClassificationAgent { }
class ClaimVerificationAgent { }

// ❌ Bad: Agent does too much
class ClaimProcessorAgent {
  // Extracts, classifies, and verifies all in one
}
```

### 2. Immutable Inputs

Never modify input objects:

```typescript
// ✅ Good
const enrichedClaim = { ...claim, score: 0.8 };

// ❌ Bad
claim.score = 0.8; // Mutating input
```

### 3. Provenance Tracking

Always track where data came from:

```typescript
return this.success(output, {
  sources: input.sources.map(s => s.id),
  reasoning: 'Verified against 3 sources with 85% confidence',
  processingTime: Date.now() - startTime,
});
```

### 4. Graceful Degradation

Handle partial failures:

```typescript
const results = await Promise.allSettled(
  sources.map(s => this.verify(claim, s))
);

const successful = results
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);

if (successful.length === 0) {
  return this.failure(new Error('All sources failed'), {
    retryable: true,
  });
}

// Continue with partial results
return this.success({ verifications: successful });
```

### 5. Idempotency

Same input should produce same output:

```typescript
// Use deterministic IDs
const claimId = createHash('sha256')
  .update(claim.text + claim.contentId)
  .digest('hex')
  .slice(0, 16);
```

---

## Next Steps

- [Workflow Patterns](./workflows.md) — Composing agents into workflows
- [Neo4j Schema Guide](./neo4j.md) — Storing agent outputs in the graph
- [Prompt Engineering](./prompts.md) — Writing effective LLM prompts
