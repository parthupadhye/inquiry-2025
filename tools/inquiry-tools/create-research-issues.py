#!/usr/bin/env python3
"""
Batch GitHub Issue Creator for eInquiry Research Tracking

Creates GitHub issues from YAML configuration files for:
- Domain research (FTC, FDA, SEC, etc.)
- Industry research (Supplements, Cosmetics, etc.)
- Agent specifications
- Agent validation
- Pilot tasks

Usage:
    python create-research-issues.py                    # Create all issues
    python create-research-issues.py --dry-run          # Preview without creating
    python create-research-issues.py --type domains     # Only domain issues
    python create-research-issues.py --type industries  # Only industry issues
    python create-research-issues.py --type agents      # Only agent issues
    python create-research-issues.py --type pilots      # Only pilot issues
    python create-research-issues.py --config custom.yaml  # Use custom config

Requirements:
    - GitHub CLI (gh) must be installed and authenticated
    - YAML configuration file (default: features.yaml)
"""

import argparse
import subprocess
import sys
import yaml
from pathlib import Path
from typing import Optional


def load_config(config_path: Path) -> dict:
    """Load YAML configuration file."""
    if not config_path.exists():
        print(f"Error: Configuration file not found: {config_path}")
        sys.exit(1)

    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def create_issue(
    title: str,
    body: str,
    labels: list[str],
    dry_run: bool = False
) -> Optional[str]:
    """Create a GitHub issue using the gh CLI."""

    label_args = []
    for label in labels:
        label_args.extend(['--label', label])

    cmd = ['gh', 'issue', 'create', '--title', title, '--body', body] + label_args

    if dry_run:
        print(f"\n{'='*60}")
        print(f"[DRY RUN] Would create issue:")
        print(f"  Title: {title}")
        print(f"  Labels: {', '.join(labels)}")
        print(f"  Body preview (first 500 chars):")
        print(f"  {body[:500]}...")
        return None

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        issue_url = result.stdout.strip()
        print(f"Created: {issue_url}")
        return issue_url
    except subprocess.CalledProcessError as e:
        print(f"Error creating issue '{title}': {e.stderr}")
        return None


def generate_domain_body(domain: dict) -> str:
    """Generate issue body for domain research."""
    return f"""## Domain Overview

**Domain Name:** {domain.get('name', '')}
**Regulatory Body:** {domain.get('regulator', '')}
**Jurisdiction:** {domain.get('jurisdiction', 'United States Federal')}

## Research Objectives

- [ ] Identify claim categories within this domain
- [ ] Document substantiation requirements per category
- [ ] Map risk levels and enforcement patterns
- [ ] Identify high-risk keywords and patterns
- [ ] Review recent enforcement actions (2023-2025)
- [ ] Create classification taxonomy

## Claim Categories to Research

| Category | Description | Priority |
|----------|-------------|----------|
{generate_table_rows(domain.get('categories', []))}

## Key Questions

1. What types of claims fall under this domain?
2. What evidence is required to substantiate each claim type?
3. What are the penalties for non-compliance?
4. What are recent enforcement trends?
5. Are there safe harbors or exemptions?

## Deliverables

- [ ] `research/domains/{domain.get('slug', 'domain')}/taxonomy.md` - Claim category taxonomy
- [ ] `research/domains/{domain.get('slug', 'domain')}/guidelines.md` - Regulatory guidelines summary
- [ ] `research/domains/{domain.get('slug', 'domain')}/enforcement.md` - Enforcement actions review
- [ ] `research/domains/{domain.get('slug', 'domain')}/patterns.md` - High-risk patterns and keywords

## Resources

{generate_resource_list(domain.get('resources', []))}

## Notes

{domain.get('notes', '')}

---

**Estimated Effort:** {domain.get('effort', 'Medium')}
"""


def generate_industry_body(industry: dict) -> str:
    """Generate issue body for industry research."""
    return f"""## Industry Overview

**Industry Name:** {industry.get('name', '')}
**Primary Regulators:** {', '.join(industry.get('regulators', []))}
**Market Size:** {industry.get('market_size', 'TBD')}

## Research Objectives

- [ ] Identify common claim types in this industry
- [ ] Document industry-specific regulations
- [ ] Review self-regulatory guidelines (if any)
- [ ] Analyze recent enforcement trends
- [ ] Identify high-risk marketing practices
- [ ] Document compliant claim examples

## Common Claim Types

| Claim Type | Example | Risk Level | Applicable Regulation |
|------------|---------|------------|----------------------|
{generate_claim_type_rows(industry.get('claim_types', []))}

## Regulatory Landscape

### Federal Regulations
{generate_bullet_list(industry.get('federal_regulations', []))}

### State Regulations
{generate_bullet_list(industry.get('state_regulations', []))}

### Self-Regulatory Bodies
{generate_bullet_list(industry.get('self_regulatory', []))}

## Key Compliance Considerations

{generate_numbered_list(industry.get('compliance_considerations', []))}

## Deliverables

- [ ] `research/industries/{industry.get('slug', 'industry')}/overview.md` - Industry compliance overview
- [ ] `research/industries/{industry.get('slug', 'industry')}/claim-types.md` - Common claim patterns
- [ ] `research/industries/{industry.get('slug', 'industry')}/regulations.md` - Regulatory requirements
- [ ] `research/industries/{industry.get('slug', 'industry')}/examples.md` - Compliant/non-compliant examples

## Pilot Candidates

| Company/Product | Reason | Priority |
|-----------------|--------|----------|
{generate_pilot_rows(industry.get('pilot_candidates', []))}

## Resources

{generate_resource_list(industry.get('resources', []))}

## Notes

{industry.get('notes', '')}

---

**Estimated Effort:** {industry.get('effort', 'Medium')}
"""


def generate_agent_spec_body(agent: dict) -> str:
    """Generate issue body for agent specification."""
    return f"""## Agent Overview

**Agent Name:** {agent.get('name', '')}
**Agent Type:** {agent.get('type', 'Analysis')}
**Priority:** {agent.get('priority', 'Medium')}
**Complexity:** {agent.get('complexity', 'Medium')}

## Purpose & Responsibilities

{agent.get('purpose', '')}

## Input Contract

```typescript
{agent.get('input_schema', '// Define input schema')}
```

### Required Fields
{generate_bullet_list(agent.get('required_inputs', []))}

### Optional Fields
{generate_bullet_list(agent.get('optional_inputs', []))}

## Output Contract

```typescript
{agent.get('output_schema', '// Define output schema')}
```

### Output Fields
{generate_bullet_list(agent.get('output_fields', []))}

## Core Capabilities

{generate_numbered_list(agent.get('capabilities', []))}

## Processing Logic

{agent.get('processing_logic', '')}

## Dependencies

### Upstream Agents
{generate_bullet_list(agent.get('upstream_agents', ['None']))}

### Downstream Agents
{generate_bullet_list(agent.get('downstream_agents', ['None']))}

### External Services
{generate_bullet_list(agent.get('external_services', ['None']))}

## Error Handling

| Error Type | Handling Strategy |
|------------|------------------|
{generate_error_handling_rows(agent.get('error_handling', []))}

## Performance Requirements

| Metric | Target |
|--------|--------|
| Latency (p95) | {agent.get('latency_target', 'TBD')} |
| Throughput | {agent.get('throughput_target', 'TBD')} |
| Accuracy | {agent.get('accuracy_target', 'TBD')} |

## Prompt Engineering Notes

{agent.get('prompt_notes', '')}

## Test Scenarios

{generate_numbered_list(agent.get('test_scenarios', []))}

## Implementation Notes

{agent.get('implementation_notes', '')}

---

**Estimated Effort:** {agent.get('effort', 'Medium')}
**Related Domain:** {agent.get('related_domain', '')}
"""


def generate_pilot_body(pilot: dict) -> str:
    """Generate issue body for pilot task."""
    return f"""## Pilot Overview

**Pilot Name:** {pilot.get('name', '')}
**Target Industry:** {pilot.get('industry', '')}
**Agent(s) Being Tested:** {', '.join(pilot.get('agents', []))}

## Pilot Objectives

- [ ] Validate agent accuracy on real-world data
- [ ] Identify edge cases and failure modes
- [ ] Measure processing time and resource usage
- [ ] Gather feedback for prompt improvements
- [ ] Document findings for broader rollout

## Target Data Source

**Source Type:** {pilot.get('source_type', '')}
**Source URL/Location:** {pilot.get('source_url', '')}
**Data Volume:** {pilot.get('data_volume', '')}
**Date Range:** {pilot.get('date_range', '')}

## Scope Definition

### In Scope
{generate_bullet_list(pilot.get('in_scope', []))}

### Out of Scope
{generate_bullet_list(pilot.get('out_of_scope', []))}

## Expected Outcomes

### Quantitative Targets
| Metric | Target |
|--------|--------|
| Claim Detection Rate | {pilot.get('detection_target', '>90%')} |
| Classification Accuracy | {pilot.get('accuracy_target', '>85%')} |
| Processing Time | {pilot.get('time_target', '<5s per page')} |
| False Positive Rate | {pilot.get('fp_target', '<10%')} |

## Success Criteria

### Required for Pass
{generate_bullet_list(pilot.get('success_criteria', []))}

## Notes

{pilot.get('notes', '')}

---

**Estimated Effort:** {pilot.get('effort', 'Medium')}
**Prerequisites:** {', '.join(pilot.get('prerequisites', []))}
"""


# Helper functions for generating markdown content
def generate_table_rows(items: list) -> str:
    if not items:
        return "| TBD | TBD | TBD |"
    rows = []
    for item in items:
        if isinstance(item, dict):
            rows.append(f"| {item.get('name', '')} | {item.get('description', '')} | {item.get('priority', 'Medium')} |")
        else:
            rows.append(f"| {item} | TBD | Medium |")
    return '\n'.join(rows)


def generate_claim_type_rows(items: list) -> str:
    if not items:
        return "| TBD | TBD | TBD | TBD |"
    rows = []
    for item in items:
        if isinstance(item, dict):
            rows.append(f"| {item.get('type', '')} | {item.get('example', '')} | {item.get('risk', 'Medium')} | {item.get('regulation', '')} |")
        else:
            rows.append(f"| {item} | TBD | Medium | TBD |")
    return '\n'.join(rows)


def generate_pilot_rows(items: list) -> str:
    if not items:
        return "| TBD | TBD | TBD |"
    rows = []
    for item in items:
        if isinstance(item, dict):
            rows.append(f"| {item.get('name', '')} | {item.get('reason', '')} | {item.get('priority', 'Medium')} |")
        else:
            rows.append(f"| {item} | TBD | Medium |")
    return '\n'.join(rows)


def generate_error_handling_rows(items: list) -> str:
    if not items:
        return "| TBD | TBD |"
    rows = []
    for item in items:
        if isinstance(item, dict):
            rows.append(f"| {item.get('error', '')} | {item.get('strategy', '')} |")
        else:
            rows.append(f"| {item} | TBD |")
    return '\n'.join(rows)


def generate_bullet_list(items: list) -> str:
    if not items:
        return "- TBD"
    return '\n'.join(f"- {item}" for item in items)


def generate_numbered_list(items: list) -> str:
    if not items:
        return "1. TBD"
    return '\n'.join(f"{i+1}. {item}" for i, item in enumerate(items))


def generate_resource_list(items: list) -> str:
    if not items:
        return "- TBD"
    lines = []
    for item in items:
        if isinstance(item, dict):
            lines.append(f"- [{item.get('title', 'Link')}]({item.get('url', '#')})")
        else:
            lines.append(f"- {item}")
    return '\n'.join(lines)


def create_domain_issues(config: dict, dry_run: bool = False) -> list[str]:
    """Create issues for all configured domains."""
    urls = []
    domains = config.get('domains', [])

    print(f"\n{'='*60}")
    print(f"Creating {len(domains)} domain research issue(s)...")

    for domain in domains:
        title = f"[Research] Domain: {domain.get('name', 'Unknown')}"
        body = generate_domain_body(domain)
        labels = ['research', 'domain'] + domain.get('labels', [])

        url = create_issue(title, body, labels, dry_run)
        if url:
            urls.append(url)

    return urls


def create_industry_issues(config: dict, dry_run: bool = False) -> list[str]:
    """Create issues for all configured industries."""
    urls = []
    industries = config.get('industries', [])

    print(f"\n{'='*60}")
    print(f"Creating {len(industries)} industry research issue(s)...")

    for industry in industries:
        title = f"[Research] Industry: {industry.get('name', 'Unknown')}"
        body = generate_industry_body(industry)
        labels = ['research', 'industry'] + industry.get('labels', [])

        url = create_issue(title, body, labels, dry_run)
        if url:
            urls.append(url)

    return urls


def create_agent_issues(config: dict, dry_run: bool = False) -> list[str]:
    """Create issues for all configured agents."""
    urls = []
    agents = config.get('agents', [])

    print(f"\n{'='*60}")
    print(f"Creating {len(agents)} agent specification issue(s)...")

    for agent in agents:
        title = f"[Agent] Spec: {agent.get('name', 'Unknown')}"
        body = generate_agent_spec_body(agent)
        labels = ['agent', 'specification'] + agent.get('labels', [])

        url = create_issue(title, body, labels, dry_run)
        if url:
            urls.append(url)

    return urls


def create_pilot_issues(config: dict, dry_run: bool = False) -> list[str]:
    """Create issues for all configured pilots."""
    urls = []
    pilots = config.get('pilots', [])

    print(f"\n{'='*60}")
    print(f"Creating {len(pilots)} pilot task issue(s)...")

    for pilot in pilots:
        title = f"[Pilot] {pilot.get('name', 'Unknown')}"
        body = generate_pilot_body(pilot)
        labels = ['pilot', 'testing'] + pilot.get('labels', [])

        url = create_issue(title, body, labels, dry_run)
        if url:
            urls.append(url)

    return urls


def main():
    parser = argparse.ArgumentParser(
        description='Batch create GitHub issues for eInquiry research tracking'
    )
    parser.add_argument(
        '--config', '-c',
        type=Path,
        default=Path(__file__).parent / 'features.yaml',
        help='Path to YAML configuration file (default: features.yaml)'
    )
    parser.add_argument(
        '--dry-run', '-n',
        action='store_true',
        help='Preview issues without creating them'
    )
    parser.add_argument(
        '--type', '-t',
        choices=['all', 'domains', 'industries', 'agents', 'pilots'],
        default='all',
        help='Type of issues to create (default: all)'
    )

    args = parser.parse_args()

    # Load configuration
    print(f"Loading configuration from: {args.config}")
    config = load_config(args.config)

    if args.dry_run:
        print("\n*** DRY RUN MODE - No issues will be created ***")

    # Create issues based on type filter
    created_urls = []

    if args.type in ['all', 'domains']:
        created_urls.extend(create_domain_issues(config, args.dry_run))

    if args.type in ['all', 'industries']:
        created_urls.extend(create_industry_issues(config, args.dry_run))

    if args.type in ['all', 'agents']:
        created_urls.extend(create_agent_issues(config, args.dry_run))

    if args.type in ['all', 'pilots']:
        created_urls.extend(create_pilot_issues(config, args.dry_run))

    # Summary
    print(f"\n{'='*60}")
    if args.dry_run:
        print(f"DRY RUN COMPLETE")
        print(f"Would create {len(created_urls) if created_urls else 'multiple'} issue(s)")
    else:
        print(f"COMPLETE")
        print(f"Created {len(created_urls)} issue(s)")
        if created_urls:
            print("\nCreated issues:")
            for url in created_urls:
                print(f"  - {url}")


if __name__ == '__main__':
    main()
