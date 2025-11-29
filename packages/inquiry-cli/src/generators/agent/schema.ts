/**
 * Schema for the agent generator.
 * Defines all options and defaults for generating agents.
 */

import type { AgentType } from '../../../../inquiry/contracts/agent.js';

/**
 * Options for the agent generator.
 */
export interface AgentGeneratorOptions {
  /** Agent name (kebab-case) */
  name: string;
  /** Agent type category */
  type: AgentType;
  /** Description of what the agent does */
  description: string;
  /** Base directory for generated files */
  directory: string;
  /** Whether to generate test file */
  withTest: boolean;
  /** Whether to generate prompt file */
  withPrompt: boolean;
  /** Whether to generate schema file */
  withSchema: boolean;
  /** Whether to skip updating the registry */
  skipRegistry: boolean;
  /** Dry run mode (show files without creating) */
  dryRun: boolean;
  /** Force overwrite existing files */
  force: boolean;
}

/**
 * Default options for agent generation.
 */
export const defaultAgentOptions: Partial<AgentGeneratorOptions> = {
  type: 'custom',
  description: '',
  directory: 'inquiry/agents',
  withTest: true,
  withPrompt: true,
  withSchema: true,
  skipRegistry: false,
  dryRun: false,
  force: false,
};

/**
 * Agent type descriptions for prompts.
 */
export const agentTypeDescriptions: Record<AgentType, string> = {
  extraction: 'Extracts structured data from unstructured sources',
  validation: 'Validates and verifies data against rules or sources',
  transformation: 'Transforms data between formats or structures',
  analysis: 'Analyzes data and produces insights or summaries',
  orchestration: 'Coordinates multiple agents and workflows',
  notification: 'Sends notifications and alerts',
  custom: 'Custom agent type (no specific template)',
};

/**
 * Agent type choices for prompts.
 */
export const agentTypeChoices = Object.entries(agentTypeDescriptions).map(
  ([value, description]) => ({
    name: `${value} - ${description}`,
    value: value as AgentType,
  })
);

/**
 * Files generated for each agent.
 */
export interface GeneratedFiles {
  /** Main agent implementation file */
  agent: string;
  /** Agent input/output schema file */
  schema: string | null;
  /** Agent prompt template file */
  prompt: string | null;
  /** Agent test file */
  test: string | null;
  /** Agent index/exports file */
  index: string;
}

/**
 * Gets the file paths for a generated agent.
 */
export function getAgentFilePaths(
  name: string,
  directory: string,
  options: Pick<AgentGeneratorOptions, 'withTest' | 'withPrompt' | 'withSchema'>
): GeneratedFiles {
  const agentDir = `${directory}/${name}`;

  return {
    agent: `${agentDir}/${name}.agent.ts`,
    schema: options.withSchema ? `${agentDir}/${name}.schema.ts` : null,
    prompt: options.withPrompt ? `${agentDir}/${name}.prompt.ts` : null,
    test: options.withTest ? `${agentDir}/${name}.test.ts` : null,
    index: `${agentDir}/index.ts`,
  };
}

/**
 * Validates agent generator options.
 */
export function validateAgentOptions(
  options: Partial<AgentGeneratorOptions>
): string[] {
  const errors: string[] = [];

  if (!options.name) {
    errors.push('Agent name is required');
  } else {
    // Validate name format
    if (!/^[a-z][a-z0-9-]*$/.test(options.name)) {
      errors.push(
        'Agent name must be kebab-case (lowercase letters, numbers, and dashes, starting with a letter)'
      );
    }
  }

  if (options.type && !agentTypeDescriptions[options.type]) {
    errors.push(`Invalid agent type: ${options.type}`);
  }

  return errors;
}
