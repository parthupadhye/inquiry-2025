#!/usr/bin/env python3
"""
Inquiry Framework - Research Management

Separate script for managing research documentation.
Does not modify application code.

Usage:
    python research.py init                      # Initialize research folder structure
    python research.py new domain <topic>        # Create domain research doc
    python research.py new spec <agent>          # Create agent specification
    python research.py new eval <agent> <ver>    # Create agent evaluation doc
    python research.py new pilot <agency>        # Create pilot folder
    python research.py new interview <agency>    # Create interview notes
    python research.py new finding <topic>       # Create research finding
    python research.py list [type]               # List research docs
    python research.py status                    # Show research status
"""

import os
import sys
from pathlib import Path
from datetime import datetime, date

# ============================================
# Configuration
# ============================================

# Find repo root (look for .git folder)
def find_repo_root():
    current = Path.cwd()
    while current != current.parent:
        if (current / ".git").exists():
            return current
        current = current.parent
    return Path.cwd()

REPO_ROOT = find_repo_root()
RESEARCH_DIR = REPO_ROOT / "research"

# ============================================
# Templates
# ============================================

TEMPLATES = {
    "domain": '''# Research: {title}

## Metadata
- **Date**: {date}
- **Status**: Draft
- **Author**: 
- **Tags**: {tags}

## Objective
[What are we trying to learn?]

## Questions to Answer
- [ ] Question 1
- [ ] Question 2
- [ ] Question 3

## Sources Consulted
- Source 1
- Source 2

## Key Findings

### Finding 1
[Description]

**Evidence:**
> Quote or data

**Implications:**
- Implication 1

### Finding 2
[Description]

## Implications for Inquiry

### Agents Affected
- [ ] Agent: [name] - [how]

### Workflows Affected
- [ ] Workflow: [name] - [how]

### New Requirements
- [ ] Requirement 1

## Action Items
- [ ] Action 1
- [ ] Action 2

## Open Questions
- [ ] Question 1

## References
1. Reference 1
2. Reference 2
''',

    "spec": '''# Agent Specification: {agent_name}

## Metadata
- **Version**: 0.1.0
- **Status**: Draft
- **Author**: 
- **Date**: {date}

## Overview

### Purpose
[What this agent does and why it exists]

### Agent Type
[Extraction / Classification / Verification / Synthesis / Workflow]

### Dependencies
- Depends on: [other agents/services]
- Used by: [workflows/agents that use this]

## Schemas

### Input Schema
```typescript
interface {agent_name}Input {{
  // Define input fields
}}
```

```json
{{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {{
    
  }},
  "required": []
}}
```

### Output Schema
```typescript
interface {agent_name}Output {{
  // Define output fields
}}
```

```json
{{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {{
    
  }},
  "required": []
}}
```

## Business Rules

### Rule 1: [Name]
- **Description**: [What the rule does]
- **Condition**: [When it applies]
- **Action**: [What happens]

### Rule 2: [Name]
- **Description**: 
- **Condition**: 
- **Action**: 

## Algorithm / Logic

### Step 1: [Name]
[Description of step]

### Step 2: [Name]
[Description of step]

## LLM Integration

### Prompt Strategy
[How prompts are constructed]

### Prompt Template
```
[Template with {{variables}}]
```

### Response Parsing
[How LLM response is parsed and validated]

## Error Handling

| Error Type | Cause | Handling |
|------------|-------|----------|
| Invalid input | Schema validation fails | Return validation error |
| LLM timeout | LLM doesn't respond | Retry 3x with backoff |
| | | |

## Test Cases

### TC-001: [Basic case]
- **Input**: 
```json
{{}}
```
- **Expected Output**:
```json
{{}}
```
- **Status**: Pending

### TC-002: [Edge case]
- **Input**: 
- **Expected Output**:
- **Status**: Pending

### TC-003: [Error case]
- **Input**: 
- **Expected Output**:
- **Status**: Pending

## Performance Requirements

| Metric | Target | Notes |
|--------|--------|-------|
| Latency (p50) | < 2s | |
| Latency (p99) | < 10s | |
| Accuracy | > 90% | |
| | | |

## Open Questions
- [ ] Question 1
- [ ] Question 2

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | {date} | Initial draft |
''',

    "eval": '''# Agent Evaluation: {agent_name} v{version}

## Metadata
- **Agent**: {agent_name}
- **Version**: {version}
- **Evaluation Date**: {date}
- **Evaluator**: 
- **Status**: In Progress

## Test Environment
- **Environment**: [Local / Staging / Production]
- **LLM Model**: [claude-sonnet-4-20250514 / etc.]
- **Neo4j Version**: 
- **Test Data**: [Description of test data used]

## Test Case Results

| ID | Description | Input | Expected | Actual | Status |
|----|-------------|-------|----------|--------|--------|
| TC-001 | | | | | ⏳ |
| TC-002 | | | | | ⏳ |
| TC-003 | | | | | ⏳ |
| TC-004 | | | | | ⏳ |
| TC-005 | | | | | ⏳ |

### Legend
- ✅ Pass
- ❌ Fail
- ⏳ Pending
- ⚠️ Pass with issues

## Pilot Data Tests

### Brief 1: [Agency] - [Brief Name]
- **Input**: [Description]
- **Expected**: [What we expected]
- **Actual**: [What happened]
- **Issues**: [Any issues found]
- **Status**: ⏳

### Brief 2: [Agency] - [Brief Name]
- **Input**: 
- **Expected**: 
- **Actual**: 
- **Issues**: 
- **Status**: ⏳

## Metrics

### Accuracy Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Overall Accuracy | | > 90% | |
| Precision | | > 85% | |
| Recall | | > 85% | |
| F1 Score | | > 85% | |

### Performance Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Avg Latency | | < 2s | |
| P50 Latency | | < 1.5s | |
| P99 Latency | | < 10s | |
| Throughput | | > 10/min | |

### Error Analysis
| Error Type | Count | % of Total | Root Cause |
|------------|-------|------------|------------|
| | | | |

## Issues Found

### Issue 1: [Title]
- **Severity**: [Critical / High / Medium / Low]
- **Description**: 
- **Steps to Reproduce**: 
- **Expected Behavior**: 
- **Actual Behavior**: 
- **Recommendation**: 

### Issue 2: [Title]
- **Severity**: 
- **Description**: 

## Recommendations

### Immediate Actions
1. Action 1
2. Action 2

### Future Improvements
1. Improvement 1
2. Improvement 2

## Conclusion

### Overall Assessment
[Pass / Fail / Conditional Pass]

### Summary
[Brief summary of evaluation results]

### Next Steps
- [ ] Step 1
- [ ] Step 2

## Sign-off
- [ ] Evaluator: 
- [ ] Reviewer: 
- [ ] Approved for: [Production / Further Testing / Rework]
''',

    "pilot": '''# Pilot: {agency_name}

## Overview
- **Agency**: {agency_name}
- **Start Date**: {date}
- **Status**: Onboarding
- **Primary Contact**: 
- **Technical Contact**: 

## Agency Profile
- **Size**: [employees]
- **Specialization**: 
- **Key Clients**: 
- **Content Volume**: [briefs/month]

## Onboarding Checklist
- [ ] Initial interview completed
- [ ] Workflow documented
- [ ] Sample briefs collected (target: 5+)
- [ ] Success criteria agreed
- [ ] Feedback schedule set
- [ ] Access provisioned
- [ ] Training completed

## Success Criteria
| Metric | Target | Current |
|--------|--------|---------|
| Legal rejection rate | < 10% | |
| Time to verification | < 2 hours | |
| User satisfaction | > 4/5 | |
| | | |

## Workflow Documentation
[Link to workflow doc or embed here]

## Collected Briefs

| # | Brief Name | Type | Date Received | Status |
|---|------------|------|---------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

## Feedback Sessions

| Date | Attendees | Summary | Action Items |
|------|-----------|---------|--------------|
| | | | |

## Issues & Requests

| # | Type | Description | Priority | Status |
|---|------|-------------|----------|--------|
| 1 | Bug | | | |
| 2 | Feature | | | |

## Notes
[General notes about this pilot]
''',

    "interview": '''# Interview: {agency_name}

## Metadata
- **Date**: {date}
- **Time**: 
- **Duration**: 
- **Attendees**: 
- **Interviewer**: 

## Context
[Purpose of this interview]

## Questions & Responses

### Q1: [Question]
**Response:**
> 

**Notes:**


### Q2: [Question]
**Response:**
> 

**Notes:**


### Q3: [Question]
**Response:**
> 

**Notes:**

## Key Takeaways
1. Takeaway 1
2. Takeaway 2
3. Takeaway 3

## Quotes
> "[Notable quote]" - [Speaker]

> "[Notable quote]" - [Speaker]

## Action Items
- [ ] Action 1
- [ ] Action 2

## Follow-up Questions
- Question 1
- Question 2

## Implications for Inquiry
- Implication 1
- Implication 2
''',

    "finding": '''# Finding: {title}

## Metadata
- **Date**: {date}
- **Source**: [Interview / Document / Observation / Analysis]
- **Confidence**: [High / Medium / Low]
- **Tags**: 

## Summary
[2-3 sentence summary of the finding]

## Details
[Full description of the finding]

## Evidence
[Data, quotes, or observations that support this finding]

> "Quote if applicable"

## Context
[Background information that helps interpret this finding]

## Implications

### For Product
- Implication 1

### For Agents
- Agent affected: [name]
- How: [description]

### For Workflows
- Workflow affected: [name]
- How: [description]

## Related Findings
- [Link to related finding 1]
- [Link to related finding 2]

## Action Items
- [ ] Action 1
- [ ] Action 2

## Questions Raised
- Question 1
- Question 2
'''
}

# Folder structure for init
FOLDER_STRUCTURE = {
    "domains": {
        "claim-categories": ["ftc-guidelines", "industry-specific"],
        "brief-types": ["templates", "samples"],
        "agency-workflow": [],
        "sources": [],
    },
    "agents": {
        "specifications": [],
        "test-cases": [],
        "evaluations": [],
    },
    "pilots": {},
    "knowledge-base": {
        "ftc": ["enforcement-actions", "guidelines"],
        "regulations": [],
    },
    "findings": [],
}


# ============================================
# Helper Functions
# ============================================

def ensure_dir(path: Path):
    """Create directory if it doesn't exist"""
    path.mkdir(parents=True, exist_ok=True)


def create_file(path: Path, content: str, overwrite: bool = False):
    """Create a file with content"""
    if path.exists() and not overwrite:
        print(f"⚠️  File exists: {path}")
        return False
    
    ensure_dir(path.parent)
    path.write_text(content)
    print(f"✅ Created: {path.relative_to(REPO_ROOT)}")
    return True


def slugify(text: str) -> str:
    """Convert text to slug"""
    return text.lower().replace(" ", "-").replace("_", "-")


def today() -> str:
    """Return today's date as string"""
    return date.today().isoformat()


# ============================================
# Commands
# ============================================

def cmd_init():
    """Initialize research folder structure"""
    print(f"\n📁 Initializing research structure in {REPO_ROOT}\n")
    
    def create_structure(base: Path, structure: dict):
        for name, children in structure.items():
            folder = base / name
            ensure_dir(folder)
            print(f"  Created: {folder.relative_to(REPO_ROOT)}/")
            
            # Create .gitkeep for empty folders
            gitkeep = folder / ".gitkeep"
            if not any(folder.iterdir()) or (len(list(folder.iterdir())) == 1 and gitkeep.exists()):
                gitkeep.touch()
            
            if isinstance(children, dict):
                create_structure(folder, children)
            elif isinstance(children, list):
                for child in children:
                    child_folder = folder / child
                    ensure_dir(child_folder)
                    print(f"  Created: {child_folder.relative_to(REPO_ROOT)}/")
                    (child_folder / ".gitkeep").touch()
    
    create_structure(RESEARCH_DIR, FOLDER_STRUCTURE)
    
    # Create README
    readme_content = '''# Research

This folder contains all research documentation for the Inquiry Framework.

## Structure

```
research/
├── domains/           # Domain research
│   ├── claim-categories/
│   ├── brief-types/
│   ├── agency-workflow/
│   └── sources/
├── agents/            # Agent specifications and evaluations
│   ├── specifications/
│   ├── test-cases/
│   └── evaluations/
├── pilots/            # Pilot agency documentation
├── knowledge-base/    # Reference materials
│   ├── ftc/
│   └── regulations/
└── findings/          # Individual research findings
```

## Managing Research

Use the research management script:

```bash
python tools/inquiry-tools/research.py new domain "FTC claim categories"
python tools/inquiry-tools/research.py new spec ClaimExtraction
python tools/inquiry-tools/research.py new pilot "Agency A"
```

See `python tools/inquiry-tools/research.py --help` for all commands.
'''
    create_file(RESEARCH_DIR / "README.md", readme_content, overwrite=True)
    
    print(f"\n✅ Research structure initialized\n")


def cmd_new_domain(topic: str):
    """Create new domain research document"""
    slug = slugify(topic)
    
    # Determine folder based on topic keywords
    if any(kw in slug for kw in ["ftc", "claim", "category", "substantiation"]):
        folder = RESEARCH_DIR / "domains" / "claim-categories"
    elif any(kw in slug for kw in ["brief", "deliverable", "type"]):
        folder = RESEARCH_DIR / "domains" / "brief-types"
    elif any(kw in slug for kw in ["workflow", "agency", "process"]):
        folder = RESEARCH_DIR / "domains" / "agency-workflow"
    elif any(kw in slug for kw in ["source", "credibility"]):
        folder = RESEARCH_DIR / "domains" / "sources"
    elif any(kw in slug for kw in ["health", "financial", "cpg", "food", "environment"]):
        folder = RESEARCH_DIR / "domains" / "claim-categories" / "industry-specific"
    else:
        folder = RESEARCH_DIR / "domains"
    
    filename = f"{slug}.md"
    filepath = folder / filename
    
    content = TEMPLATES["domain"].format(
        title=topic,
        date=today(),
        tags=slug.replace("-", ", ")
    )
    
    create_file(filepath, content)


def cmd_new_spec(agent_name: str):
    """Create new agent specification"""
    # Normalize agent name
    name = agent_name.replace("-", " ").replace("_", " ").title().replace(" ", "")
    slug = slugify(agent_name)
    
    folder = RESEARCH_DIR / "agents" / "specifications"
    filepath = folder / f"{slug}-spec.md"
    
    content = TEMPLATES["spec"].format(
        agent_name=name,
        date=today()
    )
    
    create_file(filepath, content)
    
    # Also create test-cases folder
    test_folder = RESEARCH_DIR / "agents" / "test-cases" / slug
    ensure_dir(test_folder)
    print(f"✅ Created: {test_folder.relative_to(REPO_ROOT)}/")
    
    # Create sample test case file
    sample_test = test_folder / "TC-001.json"
    sample_content = '''{
  "id": "TC-001",
  "name": "Basic test case",
  "description": "",
  "input": {
    
  },
  "expectedOutput": {
    
  },
  "tags": ["basic"]
}
'''
    create_file(sample_test, sample_content)


def cmd_new_eval(agent_name: str, version: str):
    """Create new agent evaluation document"""
    name = agent_name.replace("-", " ").replace("_", " ").title().replace(" ", "")
    slug = slugify(agent_name)
    
    folder = RESEARCH_DIR / "agents" / "evaluations"
    filename = f"{today()}-{slug}-v{version.replace('.', '-')}.md"
    filepath = folder / filename
    
    content = TEMPLATES["eval"].format(
        agent_name=name,
        version=version,
        date=today()
    )
    
    create_file(filepath, content)


def cmd_new_pilot(agency_name: str):
    """Create new pilot agency folder and docs"""
    slug = slugify(agency_name)
    
    folder = RESEARCH_DIR / "pilots" / slug
    ensure_dir(folder)
    ensure_dir(folder / "briefs")
    ensure_dir(folder / "feedback")
    
    # Create main pilot doc
    filepath = folder / "README.md"
    content = TEMPLATES["pilot"].format(
        agency_name=agency_name,
        date=today()
    )
    create_file(filepath, content)
    
    print(f"✅ Created: {folder.relative_to(REPO_ROOT)}/briefs/")
    print(f"✅ Created: {folder.relative_to(REPO_ROOT)}/feedback/")


def cmd_new_interview(agency_name: str):
    """Create new interview notes document"""
    slug = slugify(agency_name)
    
    folder = RESEARCH_DIR / "pilots" / slug / "feedback"
    ensure_dir(folder)
    
    filename = f"{today()}-interview.md"
    filepath = folder / filename
    
    content = TEMPLATES["interview"].format(
        agency_name=agency_name,
        date=today()
    )
    
    create_file(filepath, content)


def cmd_new_finding(topic: str):
    """Create new research finding document"""
    slug = slugify(topic)
    
    folder = RESEARCH_DIR / "findings"
    filename = f"{today()}-{slug}.md"
    filepath = folder / filename
    
    content = TEMPLATES["finding"].format(
        title=topic,
        date=today()
    )
    
    create_file(filepath, content)


def cmd_list(doc_type: str = None):
    """List research documents"""
    print(f"\n📚 Research Documents\n")
    
    if not RESEARCH_DIR.exists():
        print("❌ Research folder not found. Run 'python research.py init' first.")
        return
    
    def list_files(folder: Path, indent: int = 0):
        if not folder.exists():
            return
        
        for item in sorted(folder.iterdir()):
            if item.name.startswith("."):
                continue
            
            prefix = "  " * indent
            if item.is_dir():
                print(f"{prefix}📁 {item.name}/")
                list_files(item, indent + 1)
            elif item.suffix == ".md":
                print(f"{prefix}📄 {item.name}")
    
    if doc_type:
        type_map = {
            "domain": RESEARCH_DIR / "domains",
            "spec": RESEARCH_DIR / "agents" / "specifications",
            "eval": RESEARCH_DIR / "agents" / "evaluations",
            "pilot": RESEARCH_DIR / "pilots",
            "finding": RESEARCH_DIR / "findings",
        }
        folder = type_map.get(doc_type)
        if folder:
            list_files(folder)
        else:
            print(f"Unknown type: {doc_type}")
            print("Types: domain, spec, eval, pilot, finding")
    else:
        list_files(RESEARCH_DIR)
    
    print()


def cmd_status():
    """Show research status"""
    print(f"\n📊 Research Status\n")
    
    if not RESEARCH_DIR.exists():
        print("❌ Research folder not found. Run 'python research.py init' first.")
        return
    
    def count_files(folder: Path, extension: str = ".md") -> int:
        if not folder.exists():
            return 0
        return len([f for f in folder.rglob(f"*{extension}") if not f.name.startswith(".")])
    
    stats = {
        "Domain Research": count_files(RESEARCH_DIR / "domains"),
        "Agent Specs": count_files(RESEARCH_DIR / "agents" / "specifications"),
        "Agent Evaluations": count_files(RESEARCH_DIR / "agents" / "evaluations"),
        "Test Cases": count_files(RESEARCH_DIR / "agents" / "test-cases", ".json"),
        "Pilots": len([d for d in (RESEARCH_DIR / "pilots").iterdir() if d.is_dir()]) if (RESEARCH_DIR / "pilots").exists() else 0,
        "Findings": count_files(RESEARCH_DIR / "findings"),
    }
    
    for category, count in stats.items():
        bar = "█" * min(count, 20)
        print(f"  {category:<20} {bar} {count}")
    
    print()


# ============================================
# Main
# ============================================

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "init":
        cmd_init()
    
    elif command == "new":
        if len(sys.argv) < 4:
            print("Usage: python research.py new <type> <name>")
            print("Types: domain, spec, eval, pilot, interview, finding")
            sys.exit(1)
        
        doc_type = sys.argv[2]
        
        if doc_type == "domain":
            cmd_new_domain(sys.argv[3])
        elif doc_type == "spec":
            cmd_new_spec(sys.argv[3])
        elif doc_type == "eval":
            if len(sys.argv) < 5:
                print("Usage: python research.py new eval <agent> <version>")
                sys.exit(1)
            cmd_new_eval(sys.argv[3], sys.argv[4])
        elif doc_type == "pilot":
            cmd_new_pilot(sys.argv[3])
        elif doc_type == "interview":
            cmd_new_interview(sys.argv[3])
        elif doc_type == "finding":
            cmd_new_finding(sys.argv[3])
        else:
            print(f"Unknown type: {doc_type}")
            print("Types: domain, spec, eval, pilot, interview, finding")
            sys.exit(1)
    
    elif command == "list":
        doc_type = sys.argv[2] if len(sys.argv) > 2 else None
        cmd_list(doc_type)
    
    elif command == "status":
        cmd_status()
    
    elif command in ["-h", "--help", "help"]:
        print(__doc__)
    
    else:
        print(f"Unknown command: {command}")
        print("Commands: init, new, list, status")
        sys.exit(1)


if __name__ == "__main__":
    main()
