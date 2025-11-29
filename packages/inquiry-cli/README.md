# @inquiry/cli

CLI for Inquiry Framework schematics - Generate agents, workflows, and more.

## Installation

```bash
pnpm install @inquiry/cli
```

## Usage

```bash
# Show help
inquiry --help

# Show version
inquiry --version

# Initialize Inquiry workspace
inquiry init

# Generate components
inquiry generate agent MyAgent
inquiry g agent MyAgent --type=extraction
inquiry g workflow ClaimVerification
```

## Commands

### `inquiry init`

Initialize an Inquiry workspace in your project.

Options:
- `--dry-run` - Preview changes without writing files
- `--verbose` - Show detailed output

### `inquiry generate <schematic> [name]`

Generate components for your Inquiry project.

Alias: `inquiry g`

Arguments:
- `<schematic>` - Type of component to generate (agent, node, workflow, contracts)
- `[name]` - Name of the component

Options:
- `--type <type>` - Component subtype
- `--dry-run` - Preview changes without writing files
- `--verbose` - Show detailed output

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck

# Link globally for testing
pnpm link --global
```

## License

MIT
