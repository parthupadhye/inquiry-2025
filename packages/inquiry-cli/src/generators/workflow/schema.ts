/**
 * Schema definitions for the workflow generator.
 */

import path from 'path';

/**
 * Step definition for workflow generation.
 */
export interface WorkflowStepDefinition {
  /** Step name */
  name: string;
  /** Step type */
  type: 'agent' | 'sequential' | 'parallel' | 'conditional' | 'transform' | 'wait';
  /** Agent ID (for agent steps) */
  agentId?: string;
  /** Step description */
  description?: string;
}

/**
 * Workflow type presets.
 */
export type WorkflowPreset =
  | 'claim-verification'  // Standard claim verification workflow
  | 'research'            // Research and evidence gathering
  | 'content-generation'  // Content/report generation
  | 'validation'          // Data validation workflow
  | 'custom';             // Custom workflow

/**
 * Options for the workflow generator.
 */
export interface WorkflowGeneratorOptions {
  /** Workflow name (kebab-case) */
  name: string;
  /** Workflow description */
  description: string;
  /** Output directory for generated files */
  directory: string;
  /** Workflow preset */
  preset: WorkflowPreset;
  /** Initial steps to include */
  steps: WorkflowStepDefinition[];
  /** Whether to generate executor */
  withExecutor: boolean;
  /** Whether to generate test file */
  withTest: boolean;
  /** Dry run mode */
  dryRun: boolean;
  /** Force overwrite existing files */
  force: boolean;
  /** Skip updating the registry */
  skipRegistry: boolean;
}

/**
 * Generated file paths.
 */
export interface GeneratedWorkflowFiles {
  definition: string;
  executor: string | null;
  test: string | null;
  index: string;
}

/**
 * Default options for workflow generation.
 */
export const defaultWorkflowOptions: Partial<WorkflowGeneratorOptions> = {
  directory: 'inquiry/workflows',
  preset: 'custom',
  steps: [],
  withExecutor: true,
  withTest: true,
  dryRun: false,
  force: false,
  skipRegistry: false,
};

/**
 * Preset configurations for common workflow types.
 */
export const workflowPresets: Record<WorkflowPreset, { description: string; steps: WorkflowStepDefinition[] }> = {
  'claim-verification': {
    description: 'Workflow for verifying claims with evidence gathering and analysis',
    steps: [
      { name: 'extract-claims', type: 'agent', agentId: 'claim-extractor', description: 'Extract claims from content' },
      { name: 'gather-evidence', type: 'parallel', description: 'Gather evidence from multiple sources' },
      { name: 'analyze-evidence', type: 'agent', agentId: 'evidence-analyzer', description: 'Analyze gathered evidence' },
      { name: 'verify-claims', type: 'agent', agentId: 'claim-verifier', description: 'Verify claims against evidence' },
      { name: 'generate-report', type: 'agent', agentId: 'report-generator', description: 'Generate verification report' },
    ],
  },
  research: {
    description: 'Workflow for researching topics and gathering information',
    steps: [
      { name: 'define-scope', type: 'agent', agentId: 'scope-definer', description: 'Define research scope' },
      { name: 'search-sources', type: 'parallel', description: 'Search multiple sources' },
      { name: 'filter-results', type: 'agent', agentId: 'result-filter', description: 'Filter and rank results' },
      { name: 'synthesize', type: 'agent', agentId: 'synthesizer', description: 'Synthesize findings' },
    ],
  },
  'content-generation': {
    description: 'Workflow for generating content and reports',
    steps: [
      { name: 'gather-inputs', type: 'sequential', description: 'Gather input data' },
      { name: 'outline', type: 'agent', agentId: 'outliner', description: 'Create content outline' },
      { name: 'draft', type: 'agent', agentId: 'drafter', description: 'Generate draft content' },
      { name: 'review', type: 'agent', agentId: 'reviewer', description: 'Review and edit content' },
    ],
  },
  validation: {
    description: 'Workflow for validating data against rules',
    steps: [
      { name: 'parse-input', type: 'transform', description: 'Parse and normalize input' },
      { name: 'validate-schema', type: 'agent', agentId: 'schema-validator', description: 'Validate against schema' },
      { name: 'validate-rules', type: 'agent', agentId: 'rule-validator', description: 'Validate against business rules' },
      { name: 'generate-report', type: 'agent', agentId: 'validation-reporter', description: 'Generate validation report' },
    ],
  },
  custom: {
    description: 'Custom workflow',
    steps: [],
  },
};

/**
 * Preset choices for prompts.
 */
export const presetChoices = [
  { value: 'custom', label: 'Custom - Start from scratch' },
  { value: 'claim-verification', label: 'Claim Verification - Verify claims with evidence' },
  { value: 'research', label: 'Research - Gather and synthesize information' },
  { value: 'content-generation', label: 'Content Generation - Create reports and content' },
  { value: 'validation', label: 'Validation - Validate data against rules' },
];

/**
 * Step type choices for prompts.
 */
export const stepTypeChoices = [
  { value: 'agent', label: 'Agent - Execute a single agent' },
  { value: 'sequential', label: 'Sequential - Execute steps in order' },
  { value: 'parallel', label: 'Parallel - Execute steps concurrently' },
  { value: 'conditional', label: 'Conditional - Branch based on condition' },
  { value: 'transform', label: 'Transform - Transform data' },
  { value: 'wait', label: 'Wait - Wait for event or time' },
];

/**
 * Gets file paths for generated workflow files.
 */
export function getWorkflowFilePaths(
  name: string,
  directory: string,
  options: Partial<WorkflowGeneratorOptions>
): GeneratedWorkflowFiles {
  const basePath = path.join(directory, name);

  return {
    definition: path.join(basePath, `${name}.workflow.ts`),
    executor: options.withExecutor !== false
      ? path.join(basePath, `${name}.executor.ts`)
      : null,
    test: options.withTest !== false
      ? path.join(basePath, `${name}.test.ts`)
      : null,
    index: path.join(basePath, 'index.ts'),
  };
}

/**
 * Validates workflow generator options.
 */
export function validateWorkflowOptions(options: WorkflowGeneratorOptions): string[] {
  const errors: string[] = [];

  if (!options.name || options.name.trim() === '') {
    errors.push('Workflow name is required');
  } else if (!/^[a-z][a-z0-9-]*$/.test(options.name)) {
    errors.push('Workflow name must be kebab-case (lowercase letters, numbers, hyphens)');
  }

  if (options.steps) {
    for (const step of options.steps) {
      if (!step.name || step.name.trim() === '') {
        errors.push('Step name is required');
      }
      if (step.type === 'agent' && !step.agentId) {
        errors.push(`Agent step "${step.name}" requires an agentId`);
      }
    }
  }

  return errors;
}
