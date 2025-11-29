---
name: "Agent: Specification"
about: Define specifications for a new Inquiry agent
title: "[Agent] Spec: "
labels: agent, specification
assignees: ''
---

## Agent Overview

**Agent Name:** <!-- e.g., ClaimExtractor, EvidenceAnalyzer -->
**Agent Type:** <!-- extraction | analysis | verification | research | synthesis | validation -->
**Priority:** <!-- P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low) -->

## Purpose

<!-- 2-3 sentences describing what this agent does and why it's needed -->

## Input/Output Contract

### Input Schema
```typescript
interface <AgentName>Input {
  // Define input properties
}
```

### Output Schema
```typescript
interface <AgentName>Output {
  // Define output properties
}
```

## Functional Requirements

### Core Capabilities
- [ ] <!-- Primary capability 1 -->
- [ ] <!-- Primary capability 2 -->
- [ ] <!-- Primary capability 3 -->

### Edge Cases
- [ ] <!-- Edge case handling 1 -->
- [ ] <!-- Edge case handling 2 -->

## Technical Requirements

### Dependencies
- <!-- Required services/APIs -->
- <!-- Required data sources -->
- <!-- Other agents this depends on -->

### Performance Requirements
- **Latency:** <!-- e.g., < 5 seconds per claim -->
- **Throughput:** <!-- e.g., 100 claims/minute -->
- **Accuracy Target:** <!-- e.g., 95% precision -->

### Error Handling
- <!-- How to handle API failures -->
- <!-- How to handle malformed input -->
- <!-- Retry strategy -->

## Prompt Engineering

### System Prompt Outline
```
<!-- High-level structure of the system prompt -->
```

### Few-Shot Examples Needed
- [ ] <!-- Example type 1 -->
- [ ] <!-- Example type 2 -->

## Validation Criteria

### Unit Tests
- [ ] <!-- Test case 1 -->
- [ ] <!-- Test case 2 -->
- [ ] <!-- Test case 3 -->

### Integration Tests
- [ ] <!-- Integration scenario 1 -->
- [ ] <!-- Integration scenario 2 -->

### Accuracy Benchmarks
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Precision | <!-- e.g., 95% --> | <!-- How measured --> |
| Recall | <!-- e.g., 90% --> | <!-- How measured --> |
| F1 Score | <!-- e.g., 92% --> | <!-- How measured --> |

## Implementation Notes

### Suggested Approach
<!-- Technical approach recommendations -->

### Potential Challenges
<!-- Known difficulties or risks -->

### Reference Implementations
<!-- Links to similar agents or patterns -->

## Deliverables

- [ ] `inquiry/agents/<type>/<name>/<name>.agent.ts` - Agent implementation
- [ ] `inquiry/agents/<type>/<name>/<name>.prompt.ts` - Prompt template
- [ ] `inquiry/agents/<type>/<name>/<name>.schema.ts` - Zod schemas
- [ ] `inquiry/agents/<type>/<name>/<name>.test.ts` - Unit tests
- [ ] `research/agents/<name>/spec.md` - Detailed specification

## Related Issues

- **Domain Research:** <!-- Link to relevant domain research -->
- **Industry Research:** <!-- Link to relevant industry research -->
- **Dependent Agents:** <!-- Link to agents this depends on -->
- **Validation Issue:** <!-- Link to validation issue when created -->

---

**Estimated Effort:** <!-- Small/Medium/Large/XL -->
**Sprint:** <!-- Target sprint if applicable -->
