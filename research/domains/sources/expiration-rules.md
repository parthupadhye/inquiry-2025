# Source Expiration Rules

## Status
- **Last Updated**: [DATE]
- **Version**: 0.1
- **Status**: Draft

## Overview
Rules for when sources become too old to substantiate claims.

## General Principles

### Factors Affecting Expiration
1. [To be defined]
2. [To be defined]
3. [To be defined]

### Industry Variations
[To be researched]

## Expiration by Source Type

### Scientific Sources

| Source Type | Default Expiration | Exceptions |
|-------------|-------------------|------------|
| Peer-reviewed study | 5 years | Foundational research: longer |
| Meta-analysis | 3 years | If newer studies exist |
| Conference paper | 2 years | Until published |

**Notes**:
- [ ] Add notes from research

---

### Government Sources

| Source Type | Default Expiration | Exceptions |
|-------------|-------------------|------------|
| Census data | Until next census | Some datasets updated annually |
| Regulatory data | 2 years | Check for updates |
| Guidelines | Until superseded | Always use current version |

**Notes**:
- [ ] Add notes from research

---

### Industry Sources

| Source Type | Default Expiration | Exceptions |
|-------------|-------------------|------------|
| Industry report | 1 year | Annual reports: use current |
| Market research | 1 year | Fast-moving industries: 6 months |
| Trade publication | 6 months | News value only |

**Notes**:
- [ ] Add notes from research

---

### Company Sources

| Source Type | Default Expiration | Exceptions |
|-------------|-------------------|------------|
| Internal testing | Per test validity | Retesting may be required |
| Customer survey | 1 year | Ongoing surveys: rolling |
| Sales data | Varies | Current period only |

**Notes**:
- [ ] Add notes from research

---

### Third-Party Sources

| Source Type | Default Expiration | Exceptions |
|-------------|-------------------|------------|
| Third-party test | Per certification | Annual recertification common |
| Certification | Per certificate | Check validity dates |
| Awards | 3 years | "Award-winning" vs "Won [Year] Award" |

**Notes**:
- [ ] Add notes from research

---

## Claim-Specific Rules

### Health Claims
**Standard**: Most recent relevant evidence
**Maximum Age**: 5 years for studies
**Refresh Triggers**:
- [ ] New contradicting evidence
- [ ] Updated guidelines
- [ ] New safety data

---

### Performance Claims
**Standard**: Current product version
**Maximum Age**: N/A - must match current product
**Refresh Triggers**:
- [ ] Product reformulation
- [ ] Manufacturing change
- [ ] Competitor challenge

---

### Financial Claims
**Standard**: Most recent reporting period
**Maximum Age**: 1 year typical
**Refresh Triggers**:
- [ ] New financial report
- [ ] Material change
- [ ] Market conditions

---

### Environmental Claims
**Standard**: Current product/process
**Maximum Age**: Certification validity
**Refresh Triggers**:
- [ ] Supply chain change
- [ ] Process change
- [ ] Certification expiration

---

### Statistical Claims
**Standard**: Study validity period
**Maximum Age**: Varies by type
**Refresh Triggers**:
- [ ] New data available
- [ ] Methodology updates
- [ ] Population changes

---

## Expiration Warnings

### Warning Thresholds
| Time to Expiration | Warning Level |
|-------------------|---------------|
| > 6 months | None |
| 3-6 months | Info |
| 1-3 months | Warning |
| < 1 month | Critical |
| Expired | Error |

### Warning Actions
- [ ] Define notification workflow
- [ ] Define escalation path
- [ ] Define refresh process

## Research Tasks
- [ ] Research industry standards for source currency
- [ ] Consult with legal on expiration requirements
- [ ] Create expiration calculator
- [ ] Build refresh notification system
- [ ] Test rules against pilot data
