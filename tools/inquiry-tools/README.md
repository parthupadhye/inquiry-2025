# Inquiry Framework - Development Tools

Workflow automation for building the Inquiry Framework feature by feature.

## Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set GitHub token
export GITHUB_TOKEN=your_personal_access_token

# Update repo in features.yaml
# Set project.repo to "your-username/inquiry-framework"

# Create labels in GitHub
python inquiry.py setup-labels
```

## Workflow

### 1. See Available Features

```bash
# List all features
python inquiry.py list

# Filter by phase
python inquiry.py list --phase=1-foundation

# Show feature details
python inquiry.py show 1.1.1
```

### 2. Start a Feature

```bash
python inquiry.py start 1.1.1
```

This will:
- Create a GitHub issue with acceptance criteria
- Show the prompt for that feature
- Track it as your current feature

### 3. Build the Feature

- Copy the prompt from terminal or `prompts/1.1.1.md`
- Paste into Claude
- Review and adjust generated code
- Test it works

### 4. Complete the Feature

```bash
python inquiry.py done
```

This will:
- Stage all changes (`git add .`)
- Commit with message referencing the issue
- Push to GitHub
- Close the issue automatically

### 5. Check Status

```bash
python inquiry.py status
```

## Commands

| Command | Description |
|---------|-------------|
| `list [--phase=N]` | List all features, optionally filtered |
| `show <id>` | Show feature details |
| `start <id>` | Create issue, show prompt, start tracking |
| `done [message]` | Commit, push, close issue |
| `abort` | Stop tracking without closing issue |
| `status` | Show current feature and git status |
| `setup-labels` | Create all labels in GitHub |
| `create-prompt <id>` | Create empty prompt file for a feature |

## Files

```
tools/
├── inquiry.py       # Main workflow script
├── features.yaml    # All feature definitions
├── prompts/         # Prompt files per feature
│   ├── 1.1.1.md
│   ├── 1.1.2.md
│   └── ...
├── requirements.txt # Python dependencies
└── README.md        # This file
```

## Feature IDs

Features are numbered by phase and sequence:

```
X.Y.Z
│ │ │
│ │ └── Sequence within category
│ └──── Category within phase
└────── Phase number

Example: 1.1.1
- Phase 1 (Foundation)
- Category 1 (CLI)
- Feature 1 (Package setup)
```

## Phases

1. **Foundation** - CLI and workspace setup
2. **Contracts** - Types and validation
3. **Agents** - Agent system
4. **Data** - Neo4j and Firestore
5. **Workflow** - Workflow engine

## Creating New Prompts

```bash
# Generate prompt template from feature definition
python inquiry.py create-prompt 1.1.2

# Edit the generated file
code prompts/1.1.2.md
```
