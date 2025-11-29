---
name: "Pilot: Task"
about: Define a pilot task for testing agents with real-world data
title: "[Pilot] "
labels: pilot, testing
assignees: ''
---

## Pilot Overview

**Pilot Name:** <!-- e.g., FTC Health Claims - Supplement Company A -->
**Target Industry:** <!-- e.g., Dietary Supplements -->
**Agent(s) Being Tested:** <!-- e.g., ClaimExtractor, ClaimClassifier -->

## Pilot Objectives

- [ ] Validate agent accuracy on real-world data
- [ ] Identify edge cases and failure modes
- [ ] Measure processing time and resource usage
- [ ] Gather feedback for prompt improvements
- [ ] Document findings for broader rollout

## Target Data Source

**Source Type:** <!-- e.g., Website, Social Media, Marketing Materials -->
**Source URL/Location:** <!-- URL or description -->
**Data Volume:** <!-- e.g., 50 pages, 200 posts -->
**Date Range:** <!-- e.g., 2024-01-01 to 2024-12-31 -->

### Data Characteristics
| Characteristic | Value |
|----------------|-------|
| Content Type | <!-- e.g., Product pages, Ads, Testimonials --> |
| Language | <!-- e.g., English --> |
| Estimated Claims | <!-- Approximate number --> |
| Complexity Level | <!-- Low/Medium/High --> |

## Scope Definition

### In Scope
- <!-- Specific pages/content types to analyze -->
- <!-- Specific claim types to detect -->
- <!-- Specific regulations to check against -->

### Out of Scope
- <!-- Content types to exclude -->
- <!-- Claim types to defer -->
- <!-- Limitations to note -->

## Agent Configuration

### ClaimExtractor Settings
```yaml
# Paste or describe configuration
```

### ClaimClassifier Settings
```yaml
# Paste or describe configuration
```

### Additional Agents
<!-- List any other agents and their configurations -->

## Expected Outcomes

### Quantitative Targets
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Claim Detection Rate | <!-- e.g., >90% --> | <!-- Manual review --> |
| Classification Accuracy | <!-- e.g., >85% --> | <!-- Expert validation --> |
| Processing Time | <!-- e.g., <5s per page --> | <!-- Automated timing --> |
| False Positive Rate | <!-- e.g., <10% --> | <!-- Manual review --> |

### Qualitative Goals
- <!-- e.g., Identify common failure patterns -->
- <!-- e.g., Validate industry-specific prompts -->
- <!-- e.g., Test multi-claim handling -->

## Pilot Execution Plan

### Phase 1: Setup
- [ ] Configure agents with pilot settings
- [ ] Prepare data collection pipeline
- [ ] Set up logging and metrics collection
- [ ] Create evaluation rubric

### Phase 2: Initial Run (Small Sample)
- [ ] Process sample of <!-- n --> items
- [ ] Manual review of all results
- [ ] Identify initial issues
- [ ] Adjust configuration if needed

### Phase 3: Full Run
- [ ] Process full dataset
- [ ] Automated metrics collection
- [ ] Sample-based manual review
- [ ] Document anomalies

### Phase 4: Analysis
- [ ] Compile accuracy metrics
- [ ] Analyze failure cases
- [ ] Generate recommendations
- [ ] Create pilot report

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| <!-- e.g., Rate limiting --> | <!-- Low/Med/High --> | <!-- Low/Med/High --> | <!-- e.g., Implement delays --> |
| | | | |

## Success Criteria

### Required for Pass
- [ ] Detection rate meets target (<!-- X% -->)
- [ ] Classification accuracy meets target (<!-- X% -->)
- [ ] No critical bugs discovered
- [ ] Processing completes within time budget

### Optional Enhancements
- [ ] Exceeds accuracy targets
- [ ] Identifies new claim patterns
- [ ] Provides prompt improvement suggestions

## Deliverables

- [ ] `pilots/<pilot-name>/config.yaml` - Agent configuration
- [ ] `pilots/<pilot-name>/results.json` - Raw results
- [ ] `pilots/<pilot-name>/analysis.md` - Analysis report
- [ ] `pilots/<pilot-name>/recommendations.md` - Improvement suggestions

## Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Setup Complete | <!-- YYYY-MM-DD --> | <!-- Not Started --> |
| Initial Run Complete | <!-- YYYY-MM-DD --> | <!-- Not Started --> |
| Full Run Complete | <!-- YYYY-MM-DD --> | <!-- Not Started --> |
| Analysis Complete | <!-- YYYY-MM-DD --> | <!-- Not Started --> |

## Team

**Pilot Lead:** <!-- @username -->
**Reviewers:** <!-- @username, @username -->
**Domain Expert:** <!-- @username or external -->

## Notes

<!-- Any additional context, constraints, or considerations -->

---

**Related Issues:**
- Agent Spec: <!-- Link -->
- Agent Validation: <!-- Link -->
- Industry Research: <!-- Link -->

**Prerequisites:**
- [ ] Agent implementation complete
- [ ] Agent validation passed
- [ ] Industry research complete
