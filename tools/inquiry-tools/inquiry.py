#!/usr/bin/env python3
"""
Inquiry Framework - Development Workflow Manager

Usage:
    python inquiry.py list [--phase=N]           # List all features
    python inquiry.py show 1.1.1                 # Show feature details
    python inquiry.py start 1.1.1                # Create issue, show prompt
    python inquiry.py done [message]             # Commit and close current issue
    python inquiry.py status                     # Show current status

Setup:
    1. Create GitHub repo
    2. Set GITHUB_TOKEN environment variable
    3. Update 'repo' in features.yaml
    4. Run: python inquiry.py setup-labels
"""

import os
import sys
import subprocess
from pathlib import Path
from typing import Optional

import yaml

try:
    from github import Github
except ImportError:
    print("PyGithub not installed. Run: pip install PyGithub")
    sys.exit(1)


# ============================================
# Configuration
# ============================================

TOOLS_DIR = Path(__file__).parent
FEATURES_FILE = TOOLS_DIR / "features.yaml"
PROMPTS_DIR = TOOLS_DIR / "prompts"
CURRENT_FILE = TOOLS_DIR / ".current"  # Tracks current feature


def load_features() -> dict:
    """Load features from YAML file"""
    with open(FEATURES_FILE) as f:
        return yaml.safe_load(f)


def get_github() -> tuple:
    """Get GitHub client and repo"""
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("❌ GITHUB_TOKEN environment variable not set")
        print("   Create a token at: https://github.com/settings/tokens")
        print("   Then: export GITHUB_TOKEN=your_token")
        sys.exit(1)
    
    config = load_features()
    repo_name = config["project"].get("repo")
    
    if not repo_name:
        print("❌ Repository not configured in features.yaml")
        print("   Set project.repo to 'username/repo-name'")
        sys.exit(1)
    
    g = Github(token)
    try:
        repo = g.get_repo(repo_name)
    except Exception as e:
        print(f"❌ Could not access repo '{repo_name}': {e}")
        sys.exit(1)
    
    return g, repo


def get_current_feature() -> Optional[tuple]:
    """Get currently active feature (id, issue_number)"""
    if CURRENT_FILE.exists():
        content = CURRENT_FILE.read_text().strip()
        if ":" in content:
            feature_id, issue_num = content.split(":")
            return feature_id, int(issue_num)
    return None


def set_current_feature(feature_id: str, issue_number: int):
    """Set currently active feature"""
    CURRENT_FILE.write_text(f"{feature_id}:{issue_number}")


def clear_current_feature():
    """Clear currently active feature"""
    if CURRENT_FILE.exists():
        CURRENT_FILE.unlink()


# ============================================
# Commands
# ============================================

def cmd_list(phase: Optional[str] = None):
    """List all features"""
    config = load_features()
    features = config["features"]
    
    print("\n📋 INQUIRY FRAMEWORK FEATURES\n")
    print(f"{'ID':<8} {'Title':<50} {'Size':<12} {'Phase'}")
    print("-" * 90)
    
    current = get_current_feature()
    current_id = current[0] if current else None
    
    for fid, feature in features.items():
        # Filter by phase if specified
        if phase and feature.get("phase") != f"phase:{phase}":
            continue
        
        marker = "→ " if fid == current_id else "  "
        size = feature.get("size", "").replace("size:", "")
        phase_num = feature.get("phase", "").replace("phase:", "").split("-")[0]
        
        print(f"{marker}{fid:<6} {feature['title']:<50} {size:<12} {phase_num}")
    
    print()
    if current:
        print(f"Current: {current_id} (Issue #{current[1]})")
    print()


def cmd_show(feature_id: str):
    """Show feature details"""
    config = load_features()
    features = config["features"]
    
    if feature_id not in features:
        print(f"❌ Unknown feature: {feature_id}")
        print(f"   Run 'python inquiry.py list' to see all features")
        sys.exit(1)
    
    feature = features[feature_id]
    
    print(f"\n{'='*60}")
    print(f"FEATURE {feature_id}: {feature['title']}")
    print(f"{'='*60}\n")
    
    print(f"Phase:     {feature.get('phase', 'N/A')}")
    print(f"Component: {feature.get('component', 'N/A')}")
    print(f"Size:      {feature.get('size', 'N/A')}")
    print()
    
    print("DESCRIPTION:")
    print(feature.get("description", "No description"))
    print()
    
    print("ACCEPTANCE CRITERIA:")
    for criterion in feature.get("acceptance_criteria", []):
        print(f"  • {criterion}")
    print()
    
    print("FILES TO CREATE:")
    for file in feature.get("files", []):
        print(f"  • {file}")
    print()
    
    # Check for prompt
    prompt_file = PROMPTS_DIR / f"{feature_id}.md"
    if prompt_file.exists():
        print(f"PROMPT: {prompt_file}")
    else:
        print(f"PROMPT: Not yet created at {prompt_file}")
    print()


def cmd_start(feature_id: str):
    """Create GitHub issue and show prompt"""
    # Check not already working on something
    current = get_current_feature()
    if current:
        print(f"❌ Already working on {current[0]} (Issue #{current[1]})")
        print(f"   Run 'python inquiry.py done' to complete it first")
        print(f"   Or 'python inquiry.py abort' to abandon it")
        sys.exit(1)
    
    config = load_features()
    features = config["features"]
    
    if feature_id not in features:
        print(f"❌ Unknown feature: {feature_id}")
        sys.exit(1)
    
    feature = features[feature_id]
    _, repo = get_github()
    
    # Build issue body
    body_parts = []
    
    if feature.get("description"):
        body_parts.append("## Description")
        body_parts.append(feature["description"].strip())
        body_parts.append("")
    
    if feature.get("acceptance_criteria"):
        body_parts.append("## Acceptance Criteria")
        for criterion in feature["acceptance_criteria"]:
            body_parts.append(f"- [ ] {criterion}")
        body_parts.append("")
    
    if feature.get("files"):
        body_parts.append("## Files to Create/Modify")
        for file in feature["files"]:
            body_parts.append(f"- `{file}`")
        body_parts.append("")
    
    body_parts.append(f"## Prompt")
    body_parts.append(f"See `tools/prompts/{feature_id}.md`")
    
    body = "\n".join(body_parts)
    
    # Get labels
    labels = []
    for label_type in ["phase", "component", "size"]:
        label_name = feature.get(label_type)
        if label_name:
            try:
                label = repo.get_label(label_name)
                labels.append(label)
            except:
                # Create label if it doesn't exist
                try:
                    label = repo.create_label(label_name, "0366d6")
                    labels.append(label)
                except:
                    pass
    
    # Create issue
    title = f"[{feature_id}] {feature['title']}"
    issue = repo.create_issue(title=title, body=body, labels=labels)
    
    print(f"\n✅ Created Issue #{issue.number}: {feature['title']}")
    print(f"   {issue.html_url}\n")
    
    # Track current feature
    set_current_feature(feature_id, issue.number)
    
    # Show prompt
    prompt_file = PROMPTS_DIR / f"{feature_id}.md"
    if prompt_file.exists():
        print(f"{'='*60}")
        print("PROMPT")
        print(f"{'='*60}\n")
        print(prompt_file.read_text())
    else:
        print(f"⚠️  No prompt file at: {prompt_file}")
        print(f"   Create it or use the acceptance criteria above.\n")
    
    print(f"{'='*60}")
    print(f"When done, run: python inquiry.py done")
    print(f"{'='*60}\n")


def cmd_done(message: Optional[str] = None):
    """Commit and close current issue"""
    current = get_current_feature()
    if not current:
        print("❌ No current feature. Run 'python inquiry.py start <id>' first")
        sys.exit(1)
    
    feature_id, issue_number = current
    
    config = load_features()
    feature = config["features"].get(feature_id, {})
    
    # Check for uncommitted changes
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True, text=True
    )
    
    if not result.stdout.strip():
        print("⚠️  No changes to commit")
        confirm = input("Close issue anyway? [y/N]: ")
        if confirm.lower() != "y":
            return
    else:
        # Build commit message
        if not message:
            # Derive from feature
            component = feature.get("component", "").replace("component:", "")
            title = feature.get("title", feature_id)
            message = f"feat({component}): {title}"
        
        full_message = f"{message}\n\nCloses #{issue_number}"
        
        # Git add and commit
        print("\n📦 Staging changes...")
        subprocess.run(["git", "add", "."])
        
        print(f"📝 Committing: {message}")
        subprocess.run(["git", "commit", "-m", full_message])
        
        # Get commit SHA
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True
        )
        commit_sha = result.stdout.strip()
        
        # Push
        print("🚀 Pushing...")
        subprocess.run(["git", "push"])
    
    # Close issue via API (backup in case auto-close doesn't work)
    _, repo = get_github()
    issue = repo.get_issue(issue_number)
    
    if issue.state == "open":
        if 'commit_sha' in dir():
            issue.create_comment(f"Completed in commit {commit_sha}")
        issue.edit(state="closed")
        print(f"✅ Closed Issue #{issue_number}")
    
    # Clear current
    clear_current_feature()
    
    print(f"\n🎉 Feature {feature_id} complete!\n")


def cmd_abort():
    """Abandon current feature without closing issue"""
    current = get_current_feature()
    if not current:
        print("No current feature")
        return
    
    feature_id, issue_number = current
    
    confirm = input(f"Abandon {feature_id} (Issue #{issue_number})? Issue will remain open. [y/N]: ")
    if confirm.lower() == "y":
        clear_current_feature()
        print(f"Abandoned {feature_id}. Issue #{issue_number} still open.")


def cmd_status():
    """Show current status"""
    current = get_current_feature()
    
    if current:
        feature_id, issue_number = current
        config = load_features()
        feature = config["features"].get(feature_id, {})
        
        print(f"\n📍 CURRENT: {feature_id}")
        print(f"   Title: {feature.get('title', 'Unknown')}")
        print(f"   Issue: #{issue_number}")
        print(f"\n   Run 'python inquiry.py done' to complete")
        print(f"   Run 'python inquiry.py abort' to abandon\n")
    else:
        print("\n📍 No feature in progress")
        print("   Run 'python inquiry.py start <id>' to begin\n")
    
    # Show git status
    print("📁 Git Status:")
    subprocess.run(["git", "status", "--short"])
    print()


def cmd_setup_labels():
    """Create all labels in GitHub repo"""
    _, repo = get_github()
    config = load_features()
    
    print("\n🏷️  Setting up labels...\n")
    
    for category in ["phases", "components", "sizes"]:
        for label_def in config.get("labels", {}).get(category, []):
            name = label_def["name"]
            color = label_def.get("color", "0366d6")
            desc = label_def.get("description", "")
            
            try:
                existing = repo.get_label(name)
                existing.edit(name=name, color=color, description=desc)
                print(f"  Updated: {name}")
            except:
                repo.create_label(name=name, color=color, description=desc)
                print(f"  Created: {name}")
    
    print("\n✅ Labels ready\n")


def cmd_create_prompt(feature_id: str):
    """Create empty prompt file for a feature"""
    config = load_features()
    features = config["features"]
    
    if feature_id not in features:
        print(f"❌ Unknown feature: {feature_id}")
        sys.exit(1)
    
    feature = features[feature_id]
    _create_prompt_file(feature_id, feature)


def _create_prompt_file(feature_id: str, feature: dict, overwrite: bool = False):
    """Internal function to create a prompt file"""
    prompt_file = PROMPTS_DIR / f"{feature_id}.md"
    
    if prompt_file.exists() and not overwrite:
        print(f"⚠️  Prompt already exists: {prompt_file}")
        return False
    
    # Create prompts directory if needed
    PROMPTS_DIR.mkdir(exist_ok=True)
    
    # Build template
    content = f"""# PROMPT {feature_id}: {feature['title']}

## Instructions
- Create all files directly without asking for confirmation
- Do not ask "Would you like me to create this file?" — just create it
- Do not ask "Should I save this?" — just save it
- Output complete, working code for all files
- Save files to the specified paths

## Context
{feature.get('description', 'TODO: Add context').strip()}

## Tech Stack
- TypeScript 5.4+
- Node.js 20+
- [Add relevant technologies]

## Requirements

### Acceptance Criteria
"""
    
    for criterion in feature.get("acceptance_criteria", []):
        content += f"- {criterion}\n"
    
    content += """
### Files to Create
"""
    
    for file in feature.get("files", []):
        content += f"- `{file}`\n"
    
    content += """
## Implementation Details

[Add detailed implementation instructions here]

## Success Criteria
- [ ] All files created
- [ ] Tests pass
- [ ] Acceptance criteria met
"""
    
    prompt_file.write_text(content)
    print(f"✅ Created: {prompt_file}")
    return True


def cmd_create_all_prompts(overwrite: bool = False):
    """Create prompt files for all features"""
    config = load_features()
    features = config["features"]
    
    PROMPTS_DIR.mkdir(exist_ok=True)
    
    created = 0
    skipped = 0
    
    print(f"\n📝 Creating prompts for {len(features)} features...\n")
    
    for feature_id, feature in features.items():
        prompt_file = PROMPTS_DIR / f"{feature_id}.md"
        
        if prompt_file.exists() and not overwrite:
            print(f"   Skipped: {feature_id} (exists)")
            skipped += 1
        else:
            _create_prompt_file(feature_id, feature, overwrite)
            created += 1
    
    print(f"\n✅ Done: {created} created, {skipped} skipped")
    if skipped > 0 and not overwrite:
        print(f"   Run with --overwrite to replace existing prompts")


# ============================================
# Main
# ============================================

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "list":
        phase = None
        for arg in sys.argv[2:]:
            if arg.startswith("--phase="):
                phase = arg.split("=")[1]
        cmd_list(phase)
    
    elif command == "show":
        if len(sys.argv) < 3:
            print("Usage: python inquiry.py show <feature_id>")
            sys.exit(1)
        cmd_show(sys.argv[2])
    
    elif command == "start":
        if len(sys.argv) < 3:
            print("Usage: python inquiry.py start <feature_id>")
            sys.exit(1)
        cmd_start(sys.argv[2])
    
    elif command == "done":
        message = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
        cmd_done(message)
    
    elif command == "abort":
        cmd_abort()
    
    elif command == "status":
        cmd_status()
    
    elif command == "setup-labels":
        cmd_setup_labels()
    
    elif command == "create-prompt":
        if len(sys.argv) < 3:
            print("Usage: python inquiry.py create-prompt <feature_id>")
            sys.exit(1)
        cmd_create_prompt(sys.argv[2])
    
    elif command == "create-all-prompts":
        overwrite = "--overwrite" in sys.argv
        cmd_create_all_prompts(overwrite)
    
    else:
        print(f"Unknown command: {command}")
        print("Commands: list, show, start, done, abort, status, setup-labels, create-prompt, create-all-prompts")
        sys.exit(1)


if __name__ == "__main__":
    main()
