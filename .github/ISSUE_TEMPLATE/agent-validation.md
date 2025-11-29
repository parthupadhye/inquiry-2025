---
name: "Agent: Validation"
about: Validate an implemented agent against its specification
title: "[Agent] Validate: "
labels: agent, validation, testing
assignees: ''
---

## Agent Under Validation

**Agent Name:** <!-- e.g., ClaimExtractor -->
**Agent Version:** <!-- e.g., 1.0.0 -->
**Spec Issue:** <!-- Link to agent-spec issue -->
**Implementation PR:** <!-- Link to implementation PR -->

## Validation Scope

### Functional Validation
- [ ] All core capabilities working as specified
- [ ] Edge cases handled correctly
- [ ] Error handling works as expected
- [ ] Input validation rejects invalid data
- [ ] Output matches schema

### Performance Validation
- [ ] Latency within target: <!-- target --> actual: <!-- measured -->
- [ ] Throughput within target: <!-- target --> actual: <!-- measured -->
- [ ] Memory usage acceptable: <!-- measured -->
- [ ] No resource leaks detected

### Accuracy Validation
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Precision | <!-- target --> | <!-- actual --> | <!-- Pass/Fail --> |
| Recall | <!-- target --> | <!-- actual --> | <!-- Pass/Fail --> |
| F1 Score | <!-- target --> | <!-- actual --> | <!-- Pass/Fail --> |

## Test Dataset

**Dataset Name:** <!-- e.g., ftc-claims-2024 -->
**Dataset Size:** <!-- e.g., 500 samples -->
**Dataset Location:** <!-- Path or link -->

### Dataset Composition
| Category | Count | Percentage |
|----------|-------|------------|
| <!-- e.g., Health Claims --> | <!-- 150 --> | <!-- 30% --> |
| | | |

## Test Results

### Unit Tests
```
<!-- Paste test output summary -->
Tests: X passed, Y failed
Coverage: Z%
```

### Integration Tests
```
<!-- Paste integration test results -->
```

### Manual Testing

#### Test Case 1: <!-- Name -->
- **Input:** <!-- Description -->
- **Expected:** <!-- Expected output -->
- **Actual:** <!-- Actual output -->
- **Status:** <!-- Pass/Fail -->

#### Test Case 2: <!-- Name -->
- **Input:** <!-- Description -->
- **Expected:** <!-- Expected output -->
- **Actual:** <!-- Actual output -->
- **Status:** <!-- Pass/Fail -->

## Error Analysis

### False Positives
| Input | Expected | Actual | Root Cause |
|-------|----------|--------|------------|
| | | | |

### False Negatives
| Input | Expected | Actual | Root Cause |
|-------|----------|--------|------------|
| | | | |

### Edge Case Failures
| Scenario | Issue | Severity |
|----------|-------|----------|
| | | |

## Findings & Recommendations

### Issues Found
1. <!-- Issue description -->
2. <!-- Issue description -->

### Recommended Improvements
1. <!-- Improvement suggestion -->
2. <!-- Improvement suggestion -->

### Prompt Tuning Suggestions
<!-- Suggestions for improving the prompt -->

## Validation Checklist

### Required for Approval
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Accuracy targets met
- [ ] Performance targets met
- [ ] No critical bugs found
- [ ] Documentation complete

### Optional Enhancements
- [ ] Additional test coverage
- [ ] Performance optimizations
- [ ] Prompt improvements

## Sign-off

**Validated By:** <!-- @username -->
**Validation Date:** <!-- YYYY-MM-DD -->
**Status:** <!-- Approved / Needs Work / Blocked -->

## Next Steps

- [ ] <!-- Action item 1 -->
- [ ] <!-- Action item 2 -->
- [ ] <!-- Create pilot-task issue if approved -->

---

**Related Issues:**
- Spec: <!-- Link -->
- Implementation: <!-- Link -->
- Pilot: <!-- Link when created -->
