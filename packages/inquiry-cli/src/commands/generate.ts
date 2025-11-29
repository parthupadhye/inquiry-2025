/**
 * Generate command for Inquiry CLI.
 * Generates agents, workflows, and other components from templates.
 */

import chalk from 'chalk';
import type { AgentType } from '../../../inquiry/contracts/agent.js';
import { generateAgent, promptAgentOptions } from '../generators/agent/index.js';
import { generateNode, promptNodeOptions } from '../generators/node/index.js';
import { generateWorkflow, promptWorkflowOptions, type WorkflowPreset } from '../generators/workflow/index.js';
import { logger } from '../utils/logger.js';

/**
 * Options for the generate command.
 */
export interface GenerateOptions {
  /** Dry run mode - show files without creating */
  dryRun?: boolean;
  /** Verbose output */
  verbose?: boolean;
  /** Agent/component type */
  type?: string;
  /** Force overwrite existing files */
  force?: boolean;
  /** Skip test file generation */
  skipTest?: boolean;
  /** Skip prompt file generation */
  skipPrompt?: boolean;
  /** Skip schema file generation */
  skipSchema?: boolean;
  /** Skip registry update */
  skipRegistry?: boolean;
  /** Base directory for generated files */
  directory?: string;
  /** Description for the component */
  description?: string;
  /** Skip prompts and use defaults */
  yes?: boolean;
}

/**
 * Available schematics for generation.
 */
const SCHEMATICS = {
  agent: {
    aliases: ['a', 'ag'],
    description: 'Generate a new agent',
  },
  workflow: {
    aliases: ['w', 'wf'],
    description: 'Generate a new workflow',
  },
  node: {
    aliases: ['n'],
    description: 'Generate a Neo4j node type',
  },
  contract: {
    aliases: ['c', 'ct'],
    description: 'Generate contract types',
  },
} as const;

type SchematicName = keyof typeof SCHEMATICS;

/**
 * Main generate command handler.
 */
export async function generateCommand(
  schematic: string,
  name: string | undefined,
  options: GenerateOptions
): Promise<void> {
  // Resolve schematic name from alias
  const resolvedSchematic = resolveSchematic(schematic);

  if (!resolvedSchematic) {
    logger.error('Unknown schematic: ' + schematic);
    logger.newline();
    showAvailableSchematics();
    process.exit(1);
  }

  switch (resolvedSchematic) {
    case 'agent':
      await handleAgentGeneration(name, options);
      break;

    case 'workflow':
      await handleWorkflowGeneration(name, options);
      break;

    case 'node':
      await handleNodeGeneration(name, options);
      break;

    case 'contract':
      logger.warn('Contract generation coming soon!');
      break;

    default:
      logger.error('Schematic "' + resolvedSchematic + '" not implemented');
  }
}

/**
 * Handles agent generation.
 */
async function handleAgentGeneration(
  name: string | undefined,
  options: GenerateOptions
): Promise<void> {
  try {
    // Build initial options from CLI args
    const initialOptions = {
      name: name ?? '',
      type: options.type as AgentType | undefined,
      description: options.description ?? '',
      directory: options.directory ?? 'inquiry/agents',
      withTest: !options.skipTest,
      withPrompt: !options.skipPrompt,
      withSchema: !options.skipSchema,
      skipRegistry: options.skipRegistry ?? false,
      dryRun: options.dryRun ?? false,
      force: options.force ?? false,
    };

    // Prompt for missing options (unless --yes flag)
    const finalOptions = options.yes
      ? { ...initialOptions, name: name ?? 'my-agent', type: initialOptions.type ?? 'custom' as AgentType }
      : await promptAgentOptions(initialOptions);

    // Generate the agent
    const result = await generateAgent(finalOptions);

    if (!result.success) {
      logger.newline();
      logger.error('Agent generation failed');
      result.errors.forEach((error) => logger.listItem(error));
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('User force closed')) {
      logger.newline();
      logger.info('Generation cancelled');
      process.exit(0);
    }
    throw error;
  }
}

/**
 * Handles node generation.
 */
async function handleNodeGeneration(
  name: string | undefined,
  options: GenerateOptions
): Promise<void> {
  try {
    // Build initial options from CLI args
    const initialOptions = {
      name: name ?? '',
      description: options.description ?? '',
      directory: options.directory ?? 'inquiry/graph/schema',
      withQueries: true,
      withConstraints: true,
      withTimestamps: true,
      withId: true,
      skipIndex: options.skipRegistry ?? false,
      dryRun: options.dryRun ?? false,
      force: options.force ?? false,
      properties: [],
    };

    // Prompt for missing options (unless --yes flag)
    const finalOptions = options.yes
      ? { ...initialOptions, name: name ?? 'MyNode' }
      : await promptNodeOptions(initialOptions);

    // Generate the node
    const result = await generateNode(finalOptions);

    if (!result.success) {
      logger.newline();
      logger.error('Node generation failed');
      result.errors.forEach((error) => logger.listItem(error));
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('User force closed')) {
      logger.newline();
      logger.info('Generation cancelled');
      process.exit(0);
    }
    throw error;
  }
}

/**
 * Handles workflow generation.
 */
async function handleWorkflowGeneration(
  name: string | undefined,
  options: GenerateOptions
): Promise<void> {
  try {
    // Build initial options from CLI args
    const initialOptions = {
      name: name ?? '',
      description: options.description ?? '',
      directory: options.directory ?? 'inquiry/workflows',
      preset: (options.type as WorkflowPreset) ?? 'custom',
      steps: [],
      withExecutor: true,
      withTest: !options.skipTest,
      skipRegistry: options.skipRegistry ?? false,
      dryRun: options.dryRun ?? false,
      force: options.force ?? false,
    };

    // Prompt for missing options (unless --yes flag)
    const finalOptions = options.yes
      ? { ...initialOptions, name: name ?? 'my-workflow' }
      : await promptWorkflowOptions(initialOptions);

    // Generate the workflow
    const result = await generateWorkflow(finalOptions);

    if (!result.success) {
      logger.newline();
      logger.error('Workflow generation failed');
      result.errors.forEach((error) => logger.listItem(error));
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('User force closed')) {
      logger.newline();
      logger.info('Generation cancelled');
      process.exit(0);
    }
    throw error;
  }
}

/**
 * Resolves a schematic name from input (handles aliases).
 */
function resolveSchematic(input: string): SchematicName | null {
  const normalizedInput = input.toLowerCase();

  // Check direct match
  if (normalizedInput in SCHEMATICS) {
    return normalizedInput as SchematicName;
  }

  // Check aliases
  for (const [name, config] of Object.entries(SCHEMATICS)) {
    if (config.aliases.includes(normalizedInput)) {
      return name as SchematicName;
    }
  }

  return null;
}

/**
 * Shows available schematics.
 */
function showAvailableSchematics(): void {
  logger.info('Available schematics:');
  logger.newline();

  for (const [name, config] of Object.entries(SCHEMATICS)) {
    const aliases = config.aliases.length > 0 ? ' (' + config.aliases.join(', ') + ')' : '';
    console.log('  ' + chalk.cyan(name) + chalk.gray(aliases));
    console.log('    ' + config.description);
  }

  logger.newline();
  logger.dim('Usage: inquiry generate <schematic> [name] [options]');
  logger.dim('Example: inquiry generate agent my-agent --type extraction');
}
