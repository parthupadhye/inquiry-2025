#!/usr/bin/env python3
"""
Generate combined prompts for batch execution.

Usage:
    python generate-all-prompts.py                    # All prompts
    python generate-all-prompts.py --type=R          # Research only (R.x.x)
    python generate-all-prompts.py --type=S          # Specs only (S.x.x)
    python generate-all-prompts.py --type=V          # Validation only (V.x.x)
    python generate-all-prompts.py --type=P          # Pilot only (P.x.x)
    python generate-all-prompts.py --type=R,S        # Multiple types
    python generate-all-prompts.py --ids=R.1.1,R.1.2 # Specific IDs
    python generate-all-prompts.py --phase=0         # By phase
    python generate-all-prompts.py --output=combined.md  # Custom output file
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

# ============================================
# Configuration
# ============================================

PROMPTS_DIR = Path(__file__).parent / "prompts"
OUTPUT_DIR = Path(__file__).parent / "generated"

# ============================================
# Functions
# ============================================

def get_prompt_files():
    """Get all prompt markdown files."""
    if not PROMPTS_DIR.exists():
        return []
    
    files = []
    for f in sorted(PROMPTS_DIR.glob("*.md")):
        # Extract ID from filename (e.g., R.1.1.md -> R.1.1)
        prompt_id = f.stem
        files.append({
            "id": prompt_id,
            "path": f,
            "type": prompt_id.split(".")[0] if "." in prompt_id else prompt_id[0],
        })
    return files


def filter_prompts(prompts, types=None, ids=None, phase=None):
    """Filter prompts by type, specific IDs, or phase."""
    filtered = prompts
    
    if ids:
        id_list = [i.strip() for i in ids.split(",")]
        filtered = [p for p in filtered if p["id"] in id_list]
    
    if types:
        type_list = [t.strip().upper() for t in types.split(",")]
        filtered = [p for p in filtered if p["type"].upper() in type_list]
    
    if phase is not None:
        # Filter by phase number in ID (e.g., R.1.x = phase 1)
        filtered = [p for p in filtered if f".{phase}." in p["id"] or p["id"].startswith(f"{p['type']}.{phase}")]
    
    return filtered


def combine_prompts(prompts, include_separator=True):
    """Combine multiple prompt files into one."""
    combined = []
    
    combined.append(f"# Combined Prompts")
    combined.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    combined.append(f"Total prompts: {len(prompts)}")
    combined.append("")
    combined.append("## Prompts Included")
    for p in prompts:
        combined.append(f"- {p['id']}")
    combined.append("")
    combined.append("---")
    combined.append("")
    
    for i, prompt in enumerate(prompts):
        content = prompt["path"].read_text(encoding="utf-8")
        
        if include_separator and i > 0:
            combined.append("")
            combined.append("---")
            combined.append("")
        
        combined.append(f"<!-- PROMPT: {prompt['id']} -->")
        combined.append("")
        combined.append(content)
    
    return "\n".join(combined)


def list_prompts(prompts):
    """Print list of available prompts."""
    print("\n📋 Available Prompts\n")
    
    by_type = {}
    for p in prompts:
        t = p["type"]
        if t not in by_type:
            by_type[t] = []
        by_type[t].append(p)
    
    type_names = {
        "R": "Research",
        "S": "Specs",
        "V": "Validation",
        "P": "Pilot",
        "1": "Phase 1",
        "2": "Phase 2",
        "3": "Phase 3",
        "4": "Phase 4",
        "5": "Phase 5",
    }
    
    for t, items in sorted(by_type.items()):
        name = type_names.get(t, t)
        print(f"  {name} ({t}.x.x)")
        for p in items:
            print(f"    • {p['id']}")
        print()


def main():
    parser = argparse.ArgumentParser(description="Generate combined prompts")
    parser.add_argument("--type", "-t", help="Filter by type (R, S, V, P) - comma separated")
    parser.add_argument("--ids", "-i", help="Specific prompt IDs - comma separated")
    parser.add_argument("--phase", "-p", type=int, help="Filter by phase number")
    parser.add_argument("--output", "-o", help="Output filename")
    parser.add_argument("--list", "-l", action="store_true", help="List available prompts")
    parser.add_argument("--stdout", action="store_true", help="Print to stdout instead of file")
    args = parser.parse_args()
    
    # Get all prompts
    prompts = get_prompt_files()
    
    if not prompts:
        print("❌ No prompts found in prompts/ directory")
        sys.exit(1)
    
    # List mode
    if args.list:
        list_prompts(prompts)
        return
    
    # Filter prompts
    filtered = filter_prompts(
        prompts,
        types=args.type,
        ids=args.ids,
        phase=args.phase
    )
    
    if not filtered:
        print("❌ No prompts match the filter criteria")
        print("\nUse --list to see available prompts")
        sys.exit(1)
    
    # Combine prompts
    combined = combine_prompts(filtered)
    
    # Output
    if args.stdout:
        print(combined)
    else:
        OUTPUT_DIR.mkdir(exist_ok=True)
        
        # Generate output filename
        if args.output:
            output_file = OUTPUT_DIR / args.output
        else:
            if args.type:
                suffix = args.type.replace(",", "-").upper()
            elif args.ids:
                suffix = "custom"
            elif args.phase is not None:
                suffix = f"phase-{args.phase}"
            else:
                suffix = "all"
            output_file = OUTPUT_DIR / f"prompts-{suffix}.md"
        
        output_file.write_text(combined, encoding="utf-8")
        print(f"✅ Generated: {output_file}")
        print(f"   Prompts: {len(filtered)}")
        print(f"\nIncluded:")
        for p in filtered:
            print(f"   • {p['id']}")


if __name__ == "__main__":
    main()
