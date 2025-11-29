# PROMPT R.1.5: Source Credibility Framework — Documentation Structure

## Instructions
- Create all files directly without asking for confirmation
- Do not ask "Would you like me to create this file?" — just create it
- Do not ask "Should I save this?" — just save it
- Create documentation templates and structure only
- Do NOT perform actual research — leave placeholders for research to be filled later

## Objective
Create documentation templates for source credibility framework. Scaffolding only.

## Files to Create

### 1. research/domains/sources/README.md

```markdown
# Source Credibility Research

## Purpose
Define framework for evaluating and scoring source credibility for claim substantiation.

## Contents
- `source-types.md` — Catalog of source types
- `credibility-framework.md` — Scoring criteria and rubric
- `expiration-rules.md` — When sources expire

## Status
- [ ] Source types cataloged
- [ ] Credibility criteria defined
- [ ] Scoring rubric created
- [ ] Expiration rules documented

## Usage
This framework informs the SourceVerification and CredibilityScoring agents.
```

### 2. research/domains/sources/source-types.md

```markdown
# Source Types Catalog

## Status
- **Last Updated**: [DATE]
- **Version**: 0.1
- **Status**: Draft

## Source Categories

### 1. Scientific/Academic Sources

#### Peer-Reviewed Studies
**Description**: [To be defined]
**Credibility Level**: Very High
**Typical Use Cases**: Health claims, efficacy claims
**Validation Requirements**:
- [ ] Define requirements

**Metadata to Capture**:
- Journal name
- Impact factor
- Publication date
- Sample size
- Study type (RCT, meta-analysis, etc.)

---

#### Meta-Analyses
**Description**: [To be defined]
**Credibility Level**: Very High
**Typical Use Cases**: Aggregate evidence
**Validation Requirements**:
- [ ] Define requirements

---

#### Conference Papers
**Description**: [To be defined]
**Credibility Level**: Medium-High
**Typical Use Cases**: Emerging research
**Validation Requirements**:
- [ ] Define requirements

---

### 2. Government/Regulatory Sources

#### Government Statistics
**Description**: [To be defined]
**Credibility Level**: Very High
**Typical Use Cases**: Market data, demographic claims
**Examples**: Census, BLS, FDA databases
**Validation Requirements**:
- [ ] Define requirements

---

#### Regulatory Filings
**Description**: [To be defined]
**Credibility Level**: Very High
**Typical Use Cases**: Company data, financial claims
**Examples**: SEC filings, FDA approvals
**Validation Requirements**:
- [ ] Define requirements

---

#### Government Guidelines
**Description**: [To be defined]
**Credibility Level**: High
**Typical Use Cases**: Compliance, standards
**Validation Requirements**:
- [ ] Define requirements

---

### 3. Industry Sources

#### Industry Reports
**Description**: [To be defined]
**Credibility Level**: Medium-High
**Typical Use Cases**: Market claims, trends
**Examples**: Gartner, Forrester, Nielsen
**Validation Requirements**:
- [ ] Define requirements

---

#### Trade Publications
**Description**: [To be defined]
**Credibility Level**: Medium
**Typical Use Cases**: Industry news, trends
**Validation Requirements**:
- [ ] Define requirements

---

#### Industry Standards
**Description**: [To be defined]
**Credibility Level**: High
**Typical Use Cases**: Compliance, certifications
**Examples**: ISO, ASTM
**Validation Requirements**:
- [ ] Define requirements

---

### 4. Third-Party Sources

#### Third-Party Testing
**Description**: [To be defined]
**Credibility Level**: High
**Typical Use Cases**: Performance claims, safety claims
**Examples**: UL, Consumer Reports
**Validation Requirements**:
- [ ] Define requirements

---

#### Certifications
**Description**: [To be defined]
**Credibility Level**: High
**Typical Use Cases**: Quality claims, environmental claims
**Examples**: USDA Organic, Energy Star
**Validation Requirements**:
- [ ] Define requirements

---

#### Awards
**Description**: [To be defined]
**Credibility Level**: Medium
**Typical Use Cases**: Recognition claims
**Validation Requirements**:
- [ ] Define requirements

---

### 5. Company Sources

#### Internal Testing
**Description**: [To be defined]
**Credibility Level**: Medium
**Typical Use Cases**: Performance claims
**Validation Requirements**:
- [ ] Define requirements

---

#### Customer Surveys
**Description**: [To be defined]
**Credibility Level**: Medium
**Typical Use Cases**: Satisfaction claims
**Validation Requirements**:
- [ ] Define requirements
- Sample size
- Methodology
- Date conducted

---

#### Sales Data
**Description**: [To be defined]
**Credibility Level**: Medium
**Typical Use Cases**: Market share, sales claims
**Validation Requirements**:
- [ ] Define requirements

---

### 6. Expert Sources

#### Expert Testimony
**Description**: [To be defined]
**Credibility Level**: Medium-High
**Typical Use Cases**: Professional claims
**Validation Requirements**:
- [ ] Define requirements
- Credentials verification
- Conflict of interest check

---

#### Professional Endorsements
**Description**: [To be defined]
**Credibility Level**: Medium
**Typical Use Cases**: Recommendation claims
**Validation Requirements**:
- [ ] Define requirements

---

### 7. News/Media Sources

#### Major News Outlets
**Description**: [To be defined]
**Credibility Level**: Medium
**Typical Use Cases**: Current events, trends
**Validation Requirements**:
- [ ] Define requirements

---

#### Press Releases
**Description**: [To be defined]
**Credibility Level**: Low
**Typical Use Cases**: Announcements
**Validation Requirements**:
- [ ] Define requirements

---

## Source Type Matrix

| Source Type | Credibility | Best For | Expiration |
|-------------|-------------|----------|------------|
| Peer-reviewed study | Very High | Health, efficacy | 3-5 years |
| Government stats | Very High | Market data | 1-2 years |
| Industry report | Medium-High | Market claims | 1 year |
| Third-party test | High | Performance | Per test |
| Internal testing | Medium | Product claims | Per test |
| Customer survey | Medium | Satisfaction | 1 year |
| News article | Low-Medium | Trends | 6 months |

## Research Tasks
- [ ] Define each source type fully
- [ ] Identify validation requirements
- [ ] Map to claim categories
- [ ] Define metadata requirements
```

### 3. research/domains/sources/credibility-framework.md

```markdown
# Source Credibility Framework

## Status
- **Last Updated**: [DATE]
- **Version**: 0.1
- **Status**: Draft

## Overview
Framework for scoring source credibility to support claim verification.

## Credibility Score Definition
- **Range**: 0.0 - 1.0
- **0.0**: Not credible / unusable
- **0.5**: Moderate credibility / use with caution
- **1.0**: Highest credibility / authoritative

## Scoring Criteria

### 1. Source Authority (Weight: 30%)

| Factor | Description | Score Range |
|--------|-------------|-------------|
| Publisher reputation | [To be defined] | 0.0 - 1.0 |
| Author credentials | [To be defined] | 0.0 - 1.0 |
| Peer review status | [To be defined] | 0.0 - 1.0 |
| Editorial standards | [To be defined] | 0.0 - 1.0 |

**Scoring Rubric**:
- 0.9-1.0: [Criteria]
- 0.7-0.9: [Criteria]
- 0.5-0.7: [Criteria]
- 0.3-0.5: [Criteria]
- 0.0-0.3: [Criteria]

---

### 2. Methodology Rigor (Weight: 25%)

| Factor | Description | Score Range |
|--------|-------------|-------------|
| Study design | [To be defined] | 0.0 - 1.0 |
| Sample size | [To be defined] | 0.0 - 1.0 |
| Statistical validity | [To be defined] | 0.0 - 1.0 |
| Reproducibility | [To be defined] | 0.0 - 1.0 |

**Scoring Rubric**:
- 0.9-1.0: [Criteria]
- 0.7-0.9: [Criteria]
- 0.5-0.7: [Criteria]
- 0.3-0.5: [Criteria]
- 0.0-0.3: [Criteria]

---

### 3. Recency (Weight: 20%)

| Factor | Description | Score Range |
|--------|-------------|-------------|
| Publication date | [To be defined] | 0.0 - 1.0 |
| Data collection date | [To be defined] | 0.0 - 1.0 |
| Update frequency | [To be defined] | 0.0 - 1.0 |

**Scoring Rubric**:
- 0.9-1.0: < 1 year old
- 0.7-0.9: 1-2 years old
- 0.5-0.7: 2-3 years old
- 0.3-0.5: 3-5 years old
- 0.0-0.3: > 5 years old

---

### 4. Relevance (Weight: 15%)

| Factor | Description | Score Range |
|--------|-------------|-------------|
| Topic match | [To be defined] | 0.0 - 1.0 |
| Context applicability | [To be defined] | 0.0 - 1.0 |
| Geographic relevance | [To be defined] | 0.0 - 1.0 |

---

### 5. Independence (Weight: 10%)

| Factor | Description | Score Range |
|--------|-------------|-------------|
| Funding source | [To be defined] | 0.0 - 1.0 |
| Conflict of interest | [To be defined] | 0.0 - 1.0 |
| Editorial independence | [To be defined] | 0.0 - 1.0 |

---

## Composite Score Calculation

```
Credibility Score = 
  (Authority × 0.30) +
  (Methodology × 0.25) +
  (Recency × 0.20) +
  (Relevance × 0.15) +
  (Independence × 0.10)
```

## Credibility Thresholds

| Score | Rating | Recommendation |
|-------|--------|----------------|
| 0.9 - 1.0 | Excellent | Authoritative source |
| 0.7 - 0.9 | Good | Reliable for most claims |
| 0.5 - 0.7 | Moderate | Use with supporting sources |
| 0.3 - 0.5 | Low | Additional substantiation needed |
| 0.0 - 0.3 | Poor | Not recommended |

## Claim-Type Requirements

| Claim Category | Min Credibility | Recommended Sources |
|----------------|-----------------|---------------------|
| Health | 0.8 | Peer-reviewed, govt |
| Financial | 0.7 | Audited, govt, filings |
| Performance | 0.6 | Testing, studies |
| Comparative | 0.7 | Third-party testing |
| Environmental | 0.7 | Certifications, testing |
| General | 0.5 | Any credible source |

## Research Tasks
- [ ] Validate scoring weights
- [ ] Define detailed rubrics
- [ ] Test against real sources
- [ ] Calibrate thresholds
```

### 4. research/domains/sources/expiration-rules.md

```markdown
# Source Expiration Rules

## Status
- **Last Updated**: [DATE]
- **Version**: 0.1
- **Status**: Draft

## Overview
Rules for when sources expire and claims need re-verification.

## Expiration by Source Type

| Source Type | Default Expiration | Factors |
|-------------|-------------------|---------|
| Peer-reviewed study | 3-5 years | Field pace of change |
| Government statistics | 1-2 years | Update frequency |
| Industry report | 1 year | Market volatility |
| Survey data | 1 year | Sample relevance |
| Internal testing | Per product cycle | Product changes |
| Certifications | Per certificate | Renewal dates |
| News articles | 6 months | Relevance decay |
| Awards | 1 year | Award validity |

## Expiration by Claim Category

| Claim Category | Max Source Age | Rationale |
|----------------|---------------|-----------|
| Health/Medical | 3 years | Research advances |
| Financial | 1 year | Market changes |
| Technology | 1-2 years | Rapid innovation |
| Environmental | 2 years | Standard changes |
| Market/Statistical | 1-2 years | Data freshness |
| General product | 3 years | Product stability |

## Expiration Triggers

### Automatic Expiration
- Source age exceeds threshold
- Source URL returns 404
- Source publisher retraction

### Manual Review Triggers
- Significant industry change
- Regulatory update
- Competitive development
- Product reformulation

## Re-Verification Process

### When Expiration Approaches
1. Flag claim for review
2. Search for updated source
3. If found: Update source, reset expiration
4. If not found: Flag for manual review

### Re-Verification Priority

| Time to Expiration | Priority | Action |
|-------------------|----------|--------|
| > 90 days | Low | Queue for batch |
| 30-90 days | Medium | Schedule review |
| < 30 days | High | Immediate review |
| Expired | Critical | Block claim |

## Research Tasks
- [ ] Validate expiration periods
- [ ] Define industry-specific rules
- [ ] Design notification system
- [ ] Create re-verification workflow
```

## Folder Structure to Create

```
research/
└── domains/
    └── sources/
        ├── README.md
        ├── source-types.md
        ├── credibility-framework.md
        └── expiration-rules.md
```

## Success Criteria
- [ ] All 4 files created
- [ ] Source types cataloged
- [ ] Scoring framework defined
- [ ] Expiration rules documented
