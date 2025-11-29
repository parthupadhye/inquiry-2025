# PROMPT: Create Research Tracking Issues

## Instructions
- Create all files directly without asking for confirmation
- These are issue templates and a script to batch-create GitHub issues
- Do NOT create the actual research — just the tracking infrastructure

## Objective
Create GitHub issue templates and a batch creation script for tracking research tasks.

## Files to Create

### 1. .github/ISSUE_TEMPLATE/research-domain.md

```markdown
---
name: "🔬 Domain Research"
about: Research a domain topic (FTC, industry, workflows, etc.)
title: "Research: "
labels: research, research:domain
assignees: ''
---

## Research Topic
[What are we researching?]

## Objective
[What do we need to learn?]

## Questions to Answer
- [ ] Question 1
- [ ] Question 2
- [ ] Question 3

## Sources to Consult
- [ ] Source 1
- [ ] Source 2

## Deliverables
- [ ] `research/domains/[path]/[file].md`

## Definition of Done
- [ ] Questions answered with evidence
- [ ] Sources documented
- [ ] Findings written up
- [ ] Implications for product identified
```

### 2. .github/ISSUE_TEMPLATE/research-industry.md

```markdown
---
name: "🏭 Industry Research"
about: Research industry-specific claim requirements
title: "Research: [Industry] Industry Requirements"
labels: research, research:industry
assignees: ''
---

## Industry
[Industry name]

## Objective
Document claim requirements, regulations, and risk factors for this industry.

## Research Areas
- [ ] Regulatory bodies identified
- [ ] Claim categories specific to industry
- [ ] Substantiation requirements documented
- [ ] Risk factors identified
- [ ] Example claims collected
- [ ] Common violations documented

## Sources to Consult
- [ ] Regulatory websites
- [ ] Industry guidelines
- [ ] Enforcement actions
- [ ] Trade publications

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/[industry].md`

## Definition of Done
- [ ] All research areas completed
- [ ] Sources cited
- [ ] Risk patterns identified
- [ ] Ready for agent training
```

### 3. .github/ISSUE_TEMPLATE/agent-spec.md

```markdown
---
name: "📋 Agent Specification"
about: Write specification for an agent
title: "Spec: [Agent Name] Agent"
labels: agent-spec, component:agents
assignees: ''
---

## Agent Name
[Name]

## Agent Type
[Extraction / Classification / Verification / Synthesis / Workflow]

## Purpose
[What this agent does]

## Specification Tasks
- [ ] Define input schema (Zod/JSON Schema)
- [ ] Define output schema
- [ ] Document business rules
- [ ] Document algorithm/logic
- [ ] Define LLM prompt strategy
- [ ] Create 10+ test cases
- [ ] Identify edge cases
- [ ] Define error handling
- [ ] Set performance requirements

## Dependencies
- Depends on: [other agents]
- Used by: [workflows]

## Deliverables
- [ ] `research/agents/specifications/[agent]-spec.md`
- [ ] `research/agents/test-cases/[agent]/TC-001.json` (and more)

## Definition of Done
- [ ] Spec reviewed and approved
- [ ] Test cases cover happy path + edge cases
- [ ] Ready for implementation
```

### 4. .github/ISSUE_TEMPLATE/agent-validation.md

```markdown
---
name: "✅ Agent Validation"
about: Validate an implemented agent
title: "Validate: [Agent Name] v[X.X]"
labels: validation, agent-eval, component:agents
assignees: ''
---

## Agent
[Agent name and version]

## Validation Tasks
- [ ] Run all test cases
- [ ] Test against pilot data (5+ real briefs)
- [ ] Measure accuracy metrics
- [ ] Measure performance metrics
- [ ] Document issues found
- [ ] Verify error handling

## Metrics to Capture
| Metric | Target | Actual |
|--------|--------|--------|
| Accuracy | >90% | |
| Precision | >85% | |
| Recall | >85% | |
| Avg Latency | <2s | |
| P99 Latency | <10s | |

## Test Results
| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-001 | | |
| TC-002 | | |

## Pilot Data Tests
| Brief | Status | Issues |
|-------|--------|--------|
| Brief 1 | | |
| Brief 2 | | |

## Deliverables
- [ ] `research/agents/evaluations/[date]-[agent]-v[X.X].md`

## Definition of Done
- [ ] All test cases pass
- [ ] Meets accuracy targets
- [ ] Meets performance targets
- [ ] Issues documented and triaged
- [ ] Sign-off received
```

### 5. .github/ISSUE_TEMPLATE/pilot-task.md

```markdown
---
name: "🧪 Pilot Task"
about: Track pilot-related work
title: "Pilot: [Agency] - [Task]"
labels: pilot, component:pilot
assignees: ''
---

## Agency
[Agency name]

## Task
[What needs to be done]

## Checklist
- [ ] Task item 1
- [ ] Task item 2
- [ ] Task item 3

## Deliverables
- [ ] `research/pilots/[agency]/[file].md`

## Definition of Done
- [ ] Task completed
- [ ] Documentation updated
- [ ] Feedback captured
```

### 6. tools/inquiry-tools/create-research-issues.py

```python
#!/usr/bin/env python3
"""
Batch create GitHub issues for research tracking.

Usage:
    python create-research-issues.py --type=industries
    python create-research-issues.py --type=agents
    python create-research-issues.py --type=all
    python create-research-issues.py --dry-run
"""

import os
import sys
from github import Github

# ============================================
# Configuration
# ============================================

REPO_NAME = os.environ.get("GITHUB_REPO", "your-username/inquiry-framework")

# ============================================
# Issue Definitions
# ============================================

INDUSTRY_ISSUES = [
    {
        "title": "Research: Pharmaceutical/Biotech Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Pharmaceutical / Biotech

## Objective
Document claim requirements for pharmaceutical and biotech advertising.

## Research Areas
- [ ] FDA advertising regulations (FDCA)
- [ ] DTC (Direct-to-Consumer) requirements
- [ ] Fair balance requirements
- [ ] Major statement requirements
- [ ] Pre-approval requirements
- [ ] Off-label promotion restrictions
- [ ] Risk information requirements

## Sources to Consult
- [ ] FDA OPDP guidance documents
- [ ] FDA warning letters
- [ ] PhRMA guidelines
- [ ] Recent enforcement actions

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/pharmaceutical.md`
"""
    },
    {
        "title": "Research: Automotive Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Automotive

## Objective
Document claim requirements for automotive advertising.

## Research Areas
- [ ] FTC automotive advertising rules
- [ ] EPA fuel economy claims
- [ ] Safety rating claims
- [ ] Pricing/financing disclosures
- [ ] Lease vs buy disclosures
- [ ] Used car requirements (Used Car Rule)

## Sources to Consult
- [ ] FTC Guides for the Automotive Industry
- [ ] EPA fuel economy guidelines
- [ ] NHTSA safety rating requirements
- [ ] State dealer advertising laws

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/automotive.md`
"""
    },
    {
        "title": "Research: Technology/SaaS Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Technology / SaaS

## Objective
Document claim requirements for technology and SaaS advertising.

## Research Areas
- [ ] Performance benchmark claims
- [ ] Security/privacy claims
- [ ] Uptime/availability claims
- [ ] Integration claims
- [ ] AI/ML capability claims
- [ ] Comparison claims vs competitors

## Sources to Consult
- [ ] FTC tech advertising guidance
- [ ] Industry benchmarking standards
- [ ] Security certification requirements
- [ ] Recent tech advertising enforcement

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/technology-saas.md`
"""
    },
    {
        "title": "Research: Telecommunications Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Telecommunications

## Objective
Document claim requirements for telecom advertising.

## Research Areas
- [ ] FCC advertising requirements
- [ ] Speed/coverage claims
- [ ] Network comparison claims
- [ ] Pricing transparency requirements
- [ ] 5G claims substantiation
- [ ] "Unlimited" plan disclosures

## Sources to Consult
- [ ] FCC advertising guidelines
- [ ] FTC telecom enforcement
- [ ] NAD telecom cases
- [ ] State PUC requirements

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/telecommunications.md`
"""
    },
    {
        "title": "Research: Insurance Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Insurance

## Objective
Document claim requirements for insurance advertising.

## Research Areas
- [ ] State insurance advertising regulations
- [ ] NAIC model rules
- [ ] Rate/savings claims
- [ ] Coverage claims
- [ ] Testimonial requirements
- [ ] Comparison claims

## Sources to Consult
- [ ] NAIC advertising model regulation
- [ ] State DOI guidelines
- [ ] FTC insurance advertising cases
- [ ] Industry best practices

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/insurance.md`
"""
    },
    {
        "title": "Research: Real Estate Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Real Estate

## Objective
Document claim requirements for real estate advertising.

## Research Areas
- [ ] Fair Housing Act requirements
- [ ] RESPA advertising rules
- [ ] Mortgage advertising (TILA, Reg Z)
- [ ] Investment property claims
- [ ] ROI/appreciation claims

## Sources to Consult
- [ ] HUD advertising guidelines
- [ ] CFPB mortgage advertising guidance
- [ ] State real estate commission rules
- [ ] NAR advertising guidelines

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/real-estate.md`
"""
    },
    {
        "title": "Research: Education Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Education (Higher Ed, EdTech, Training)

## Objective
Document claim requirements for education advertising.

## Research Areas
- [ ] FTC education advertising enforcement
- [ ] Gainful employment claims
- [ ] Job placement rate claims
- [ ] Accreditation claims
- [ ] Student outcome claims
- [ ] Financial aid disclosures

## Sources to Consult
- [ ] FTC for-profit college cases
- [ ] Department of Education guidance
- [ ] State AG education enforcement
- [ ] Accreditor advertising standards

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/education.md`
"""
    },
    {
        "title": "Research: Cosmetics/Beauty Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Cosmetics / Beauty

## Objective
Document claim requirements for cosmetics and beauty advertising.

## Research Areas
- [ ] FDA cosmetic vs drug distinction
- [ ] Anti-aging claims
- [ ] "Natural/organic" claims
- [ ] Clinical testing claims
- [ ] Before/after imagery
- [ ] Ingredient claims

## Sources to Consult
- [ ] FDA cosmetic labeling guidance
- [ ] FTC cosmetic advertising cases
- [ ] NAD cosmetic decisions
- [ ] EU cosmetics regulation (for comparison)

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/cosmetics-beauty.md`
"""
    },
    {
        "title": "Research: Alcohol/Beverage Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Alcohol / Beverage

## Objective
Document claim requirements for alcohol and beverage advertising.

## Research Areas
- [ ] TTB advertising regulations
- [ ] FTC alcohol advertising guidance
- [ ] State alcohol advertising laws
- [ ] Health claims restrictions
- [ ] Responsible drinking messaging
- [ ] Age-gating requirements

## Sources to Consult
- [ ] TTB advertising regulations
- [ ] FTC alcohol marketing guidance
- [ ] Industry self-regulatory codes (Distilled Spirits Council, Beer Institute)
- [ ] State ABC requirements

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/alcohol-beverage.md`
"""
    },
    {
        "title": "Research: Gaming/Gambling Industry Requirements",
        "labels": ["research", "research:industry", "phase:0-research"],
        "body": """## Industry
Gaming / Gambling / Sports Betting

## Objective
Document claim requirements for gaming and gambling advertising.

## Research Areas
- [ ] State gaming commission requirements
- [ ] Odds/payout claims
- [ ] Bonus/promotion disclosures
- [ ] Responsible gambling messaging
- [ ] Age verification requirements
- [ ] Prohibited claims

## Sources to Consult
- [ ] State gaming commission advertising rules
- [ ] FTC gambling advertising guidance
- [ ] Industry self-regulatory standards
- [ ] International comparison (UK Gambling Commission)

## Deliverables
- [ ] `research/domains/claim-categories/industry-specific/gaming-gambling.md`
"""
    },
]

AGENT_SPEC_ISSUES = [
    {
        "title": "Spec: ClaimExtraction Agent",
        "labels": ["agent-spec", "component:agents", "phase:3-agents", "size:medium"],
        "body": """## Agent Name
ClaimExtraction

## Agent Type
Extraction

## Purpose
Extract verifiable claims from briefs and deliverables.

## Specification Tasks
- [ ] Define input schema (content, contentType, options)
- [ ] Define output schema (claims array with metadata)
- [ ] Document claim detection rules
- [ ] Document category assignment logic
- [ ] Define LLM prompt for extraction
- [ ] Create 15+ test cases across claim types
- [ ] Define confidence scoring
- [ ] Document edge cases (nested claims, implicit claims)

## Deliverables
- [ ] `research/agents/specifications/claim-extraction-spec.md`
- [ ] `research/agents/test-cases/claim-extraction/` (15+ test cases)
"""
    },
    {
        "title": "Spec: RiskScoring Agent",
        "labels": ["agent-spec", "component:agents", "phase:3-agents", "size:medium"],
        "body": """## Agent Name
RiskScoring

## Agent Type
Classification

## Purpose
Score claims by FTC risk level to prioritize verification.

## Specification Tasks
- [ ] Define input schema (claim object)
- [ ] Define output schema (score, level, factors)
- [ ] Document scoring algorithm
- [ ] Define risk factors and weights
- [ ] Define category-specific rules
- [ ] Create keyword pattern library
- [ ] Create 15+ test cases
- [ ] Calibrate thresholds

## Deliverables
- [ ] `research/agents/specifications/risk-scoring-spec.md`
- [ ] `research/agents/test-cases/risk-scoring/` (15+ test cases)
"""
    },
    {
        "title": "Spec: SourceFinder Agent",
        "labels": ["agent-spec", "component:agents", "phase:3-agents", "size:medium"],
        "body": """## Agent Name
SourceFinder

## Agent Type
Extraction

## Purpose
Find potential substantiation sources for a claim.

## Specification Tasks
- [ ] Define input schema (claim, search options)
- [ ] Define output schema (sources array)
- [ ] Document search strategies per claim type
- [ ] Define source ranking algorithm
- [ ] Document API integrations needed
- [ ] Create 10+ test cases
- [ ] Define fallback strategies

## Deliverables
- [ ] `research/agents/specifications/source-finder-spec.md`
- [ ] `research/agents/test-cases/source-finder/` (10+ test cases)
"""
    },
    {
        "title": "Spec: SourceVerification Agent",
        "labels": ["agent-spec", "component:agents", "phase:3-agents", "size:large"],
        "body": """## Agent Name
SourceVerification

## Agent Type
Verification

## Purpose
Verify claims against sources and determine substantiation status.

## Specification Tasks
- [ ] Define input schema (claim, sources)
- [ ] Define output schema (verification result, confidence, reasoning)
- [ ] Document verification logic
- [ ] Define support types (direct, indirect, partial)
- [ ] Define confidence calculation
- [ ] Document LLM prompt for verification
- [ ] Create 15+ test cases
- [ ] Define dispute handling

## Deliverables
- [ ] `research/agents/specifications/source-verification-spec.md`
- [ ] `research/agents/test-cases/source-verification/` (15+ test cases)
"""
    },
    {
        "title": "Spec: CredibilityScoring Agent",
        "labels": ["agent-spec", "component:agents", "phase:3-agents", "size:medium"],
        "body": """## Agent Name
CredibilityScoring

## Agent Type
Classification

## Purpose
Score source credibility based on authority, methodology, recency.

## Specification Tasks
- [ ] Define input schema (source object)
- [ ] Define output schema (score, factors, breakdown)
- [ ] Document scoring criteria (from credibility framework)
- [ ] Define weights per factor
- [ ] Create scoring rubrics
- [ ] Create 10+ test cases
- [ ] Define minimum thresholds per claim type

## Deliverables
- [ ] `research/agents/specifications/credibility-scoring-spec.md`
- [ ] `research/agents/test-cases/credibility-scoring/` (10+ test cases)
"""
    },
    {
        "title": "Spec: EvidenceExtraction Agent",
        "labels": ["agent-spec", "component:agents", "phase:3-agents", "size:medium"],
        "body": """## Agent Name
EvidenceExtraction

## Agent Type
Extraction

## Purpose
Extract specific evidence from sources that supports claims.

## Specification Tasks
- [ ] Define input schema (source, claim)
- [ ] Define output schema (evidence array)
- [ ] Document evidence types (quote, statistic, finding)
- [ ] Define relevance scoring
- [ ] Document LLM prompt for extraction
- [ ] Create 10+ test cases
- [ ] Define location tracking (page, section)

## Deliverables
- [ ] `research/agents/specifications/evidence-extraction-spec.md`
- [ ] `research/agents/test-cases/evidence-extraction/` (10+ test cases)
"""
    },
    {
        "title": "Spec: ReportGenerator Agent",
        "labels": ["agent-spec", "component:agents", "phase:3-agents", "size:large"],
        "body": """## Agent Name
ReportGenerator

## Agent Type
Synthesis

## Purpose
Generate verification reports from claims, verifications, and scores.

## Specification Tasks
- [ ] Define input schema (claims, verifications, scores, metadata)
- [ ] Define output schema (report object)
- [ ] Document report structure/sections
- [ ] Define recommendation logic
- [ ] Document summary generation
- [ ] Define output formats (JSON, PDF)
- [ ] Create 5+ test cases
- [ ] Define legal package format

## Deliverables
- [ ] `research/agents/specifications/report-generator-spec.md`
- [ ] `research/agents/test-cases/report-generator/` (5+ test cases)
"""
    },
    {
        "title": "Spec: BriefProcessor Workflow Agent",
        "labels": ["agent-spec", "component:agents", "phase:5-workflow", "size:large"],
        "body": """## Agent Name
BriefProcessor

## Agent Type
Workflow

## Purpose
Orchestrate the full brief verification pipeline.

## Specification Tasks
- [ ] Define input schema (brief content, options)
- [ ] Define output schema (complete verification package)
- [ ] Document workflow steps
- [ ] Define step dependencies
- [ ] Document parallel vs sequential execution
- [ ] Define error handling per step
- [ ] Create 5+ end-to-end test cases
- [ ] Define partial result handling

## Deliverables
- [ ] `research/agents/specifications/brief-processor-spec.md`
- [ ] `research/agents/test-cases/brief-processor/` (5+ test cases)
"""
    },
]

AGENT_VALIDATION_ISSUES = [
    {
        "title": "Validate: ClaimExtraction Agent v1.0",
        "labels": ["validation", "agent-eval", "component:agents", "phase:3-agents"],
        "body": """## Agent
ClaimExtraction v1.0

## Validation Scope
- [ ] All specification test cases
- [ ] 5+ pilot briefs
- [ ] Edge cases from spec

## Metrics Targets
| Metric | Target |
|--------|--------|
| Accuracy | >90% |
| Precision | >85% |
| Recall | >90% |
| Avg Latency | <3s |

## Deliverables
- [ ] `research/agents/evaluations/[date]-claim-extraction-v1.md`
"""
    },
    {
        "title": "Validate: RiskScoring Agent v1.0",
        "labels": ["validation", "agent-eval", "component:agents", "phase:3-agents"],
        "body": """## Agent
RiskScoring v1.0

## Validation Scope
- [ ] All specification test cases
- [ ] Expert calibration (compare to legal review)
- [ ] False positive/negative analysis

## Metrics Targets
| Metric | Target |
|--------|--------|
| Accuracy vs expert | >85% |
| False positive rate | <15% |
| False negative rate | <10% |
| Avg Latency | <500ms |

## Deliverables
- [ ] `research/agents/evaluations/[date]-risk-scoring-v1.md`
"""
    },
    {
        "title": "Validate: SourceVerification Agent v1.0",
        "labels": ["validation", "agent-eval", "component:agents", "phase:3-agents"],
        "body": """## Agent
SourceVerification v1.0

## Validation Scope
- [ ] All specification test cases
- [ ] Real claim/source pairs from pilots
- [ ] Edge cases (conflicting sources, partial support)

## Metrics Targets
| Metric | Target |
|--------|--------|
| Accuracy | >85% |
| Confidence calibration | Within 10% |
| Avg Latency | <5s |

## Deliverables
- [ ] `research/agents/evaluations/[date]-source-verification-v1.md`
"""
    },
    {
        "title": "Validate: ReportGenerator Agent v1.0",
        "labels": ["validation", "agent-eval", "component:agents", "phase:3-agents"],
        "body": """## Agent
ReportGenerator v1.0

## Validation Scope
- [ ] All specification test cases
- [ ] Pilot user feedback on report quality
- [ ] Legal team review of report format

## Metrics Targets
| Metric | Target |
|--------|--------|
| User satisfaction | >4/5 |
| Completeness | 100% |
| Avg generation time | <10s |

## Deliverables
- [ ] `research/agents/evaluations/[date]-report-generator-v1.md`
"""
    },
    {
        "title": "Validate: BriefProcessor Workflow v1.0",
        "labels": ["validation", "agent-eval", "component:agents", "phase:5-workflow"],
        "body": """## Agent
BriefProcessor v1.0

## Validation Scope
- [ ] End-to-end test cases
- [ ] 10+ pilot briefs full processing
- [ ] Error recovery scenarios

## Metrics Targets
| Metric | Target |
|--------|--------|
| End-to-end success rate | >95% |
| Total processing time | <2 min |
| User satisfaction | >4/5 |

## Deliverables
- [ ] `research/agents/evaluations/[date]-brief-processor-v1.md`
"""
    },
]

DOMAIN_RESEARCH_ISSUES = [
    {
        "title": "Research: NAD Case Analysis",
        "labels": ["research", "research:domain", "phase:0-research"],
        "body": """## Research Topic
National Advertising Division (NAD) case patterns

## Objective
Analyze NAD cases to identify claim patterns and substantiation standards.

## Questions to Answer
- [ ] What claim types are most frequently challenged?
- [ ] What substantiation is typically accepted?
- [ ] What are common challenger arguments?
- [ ] How do outcomes vary by industry?

## Sources to Consult
- [ ] NAD case reports (2022-2025)
- [ ] BBB National Programs database
- [ ] Industry analyses of NAD trends

## Deliverables
- [ ] `research/knowledge-base/nad-case-analysis.md`
"""
    },
    {
        "title": "Research: Competitor Analysis",
        "labels": ["research", "research:domain", "phase:0-research"],
        "body": """## Research Topic
Competitive landscape for claim verification tools

## Objective
Understand existing solutions and differentiation opportunities.

## Questions to Answer
- [ ] What tools exist for claim verification?
- [ ] How do agencies currently handle substantiation?
- [ ] What are gaps in current solutions?
- [ ] Where does Diligence differentiate?

## Competitors to Research
- [ ] Legal review services
- [ ] Compliance software
- [ ] AI writing tools with fact-checking

## Deliverables
- [ ] `research/domains/competitor-analysis.md`
"""
    },
]

# ============================================
# Main Script
# ============================================

def create_issues(issue_list, dry_run=False):
    """Create GitHub issues from a list of issue definitions."""
    
    if dry_run:
        print("DRY RUN - Issues that would be created:\n")
        for issue in issue_list:
            print(f"  📋 {issue['title']}")
            print(f"     Labels: {', '.join(issue['labels'])}")
        print(f"\nTotal: {len(issue_list)} issues")
        return
    
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("❌ GITHUB_TOKEN not set")
        sys.exit(1)
    
    g = Github(token)
    repo = g.get_repo(REPO_NAME)
    
    created = 0
    for issue in issue_list:
        try:
            # Check if issue already exists
            existing = list(repo.get_issues(state="all"))
            if any(i.title == issue["title"] for i in existing):
                print(f"⏭️  Skipped (exists): {issue['title']}")
                continue
            
            repo.create_issue(
                title=issue["title"],
                body=issue["body"],
                labels=issue["labels"]
            )
            print(f"✅ Created: {issue['title']}")
            created += 1
        except Exception as e:
            print(f"❌ Failed: {issue['title']} - {e}")
    
    print(f"\n✅ Created {created} issues")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Create research tracking issues")
    parser.add_argument("--type", choices=["industries", "agents", "validation", "domain", "all"], 
                        default="all", help="Type of issues to create")
    parser.add_argument("--dry-run", action="store_true", help="Preview without creating")
    args = parser.parse_args()
    
    issues = []
    
    if args.type in ["industries", "all"]:
        issues.extend(INDUSTRY_ISSUES)
    
    if args.type in ["agents", "all"]:
        issues.extend(AGENT_SPEC_ISSUES)
    
    if args.type in ["validation", "all"]:
        issues.extend(AGENT_VALIDATION_ISSUES)
    
    if args.type in ["domain", "all"]:
        issues.extend(DOMAIN_RESEARCH_ISSUES)
    
    if not issues:
        print("No issues to create")
        return
    
    print(f"Creating {len(issues)} issues...\n")
    create_issues(issues, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
```

## Folder Structure to Create

```
.github/
└── ISSUE_TEMPLATE/
    ├── research-domain.md
    ├── research-industry.md
    ├── agent-spec.md
    ├── agent-validation.md
    └── pilot-task.md

tools/inquiry-tools/
└── create-research-issues.py
```

## Usage

```bash
# Preview all issues
python create-research-issues.py --dry-run

# Create industry research issues only
python create-research-issues.py --type=industries

# Create agent spec issues only
python create-research-issues.py --type=agents

# Create validation issues only
python create-research-issues.py --type=validation

# Create all issues
python create-research-issues.py --type=all
```

## Issues Created

### Industries (10 issues)
- Pharmaceutical/Biotech
- Automotive
- Technology/SaaS
- Telecommunications
- Insurance
- Real Estate
- Education
- Cosmetics/Beauty
- Alcohol/Beverage
- Gaming/Gambling

### Agent Specs (8 issues)
- ClaimExtraction
- RiskScoring
- SourceFinder
- SourceVerification
- CredibilityScoring
- EvidenceExtraction
- ReportGenerator
- BriefProcessor

### Agent Validation (5 issues)
- ClaimExtraction v1.0
- RiskScoring v1.0
- SourceVerification v1.0
- ReportGenerator v1.0
- BriefProcessor v1.0

### Domain Research (2 issues)
- NAD Case Analysis
- Competitor Analysis

## Success Criteria
- [ ] Issue templates created in .github/ISSUE_TEMPLATE/
- [ ] Batch creation script created
- [ ] Script runs without errors
- [ ] --dry-run shows preview
