/**
 * Workflow generator for the Inquiry CLI.
 * Generates workflow definition and executor files from templates.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createFile, fileExists, readFile } from '../../utils/files.js';
import { renderTemplate } from '../../utils/templates.js';
import { logger } from '../../utils/logger.js';
import { promptForMissing } from '../../utils/prompts.js';
import { classify, camelize } from '../../utils/helpers.js';
import {
  type WorkflowGeneratorOptions,
  type GeneratedWorkflowFiles,
  type WorkflowStepDefinition,
  type WorkflowPreset,
  defaultWorkflowOptions,
  workflowPresets,
  presetChoices,
  stepTypeChoices,
  getWorkflowFilePaths,
  validateWorkflowOptions,
} from './schema.js';

// Get the directory of this file for template resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const templatesDir = path.join(packageRoot, 'templates/workflow');

/**
 * Result of workflow generation.
 */
export interface WorkflowGeneratorResult {
  success: boolean;
  files: GeneratedWorkflowFiles;
  errors: string[];
}

/**
 * Generates a new workflow with all associated files.
 */
export async function generateWorkflow(
  options: Partial<WorkflowGeneratorOptions>
): Promise<WorkflowGeneratorResult> {
  // Merge with defaults
  const opts: WorkflowGeneratorOptions = {
    ...defaultWorkflowOptions,
    ...options,
  } as WorkflowGeneratorOptions;

  // Apply preset if selected
  if (opts.preset && opts.preset !== 'custom' && opts.steps.length === 0) {
    const preset = workflowPresets[opts.preset];
    opts.steps = preset.steps;
    if (!opts.description) {
      opts.description = preset.description;
    }
  }

  // Validate options
  const validationErrors = validateWorkflowOptions(opts);
  if (validationErrors.length > 0) {
    return {
      success: false,
      files: {
        definition: '',
        executor: null,
        test: null,
        index: '',
      },
      errors: validationErrors,
    };
  }

  // Normalize names
  const workflowName = opts.name;
  const className = classify(workflowName) + 'Workflow';
  const variableName = camelize(workflowName) + 'Workflow';

  // Get file paths
  const files = getWorkflowFilePaths(opts.name, opts.directory, opts);

  // Process steps for template
  const processedSteps = opts.steps.map((step, index) => ({
    ...step,
    id: `step-${index + 1}-${step.name}`,
    className: classify(step.name) + 'Step',
    variableName: camelize(step.name) + 'Step',
  }));

  // Template variables
  const templateVars = {
    name: workflowName,
    className,
    variableName,
    description: opts.description || `${className} for the Inquiry Framework`,
    preset: opts.preset,
    steps: processedSteps,
    withExecutor: opts.withExecutor,
    withTest: opts.withTest,
    // Helper functions
    classify,
    camelize,
  };

  const errors: string[] = [];
  const fileOptions = { dryRun: opts.dryRun, overwrite: opts.force };

  // Log what we're doing
  if (opts.dryRun) {
    logger.info('Dry run - showing files that would be created:');
  } else {
    logger.info(`Generating workflow: ${className}`);
  }
  logger.newline();

  // Generate definition file
  try {
    const definitionContent = await renderTemplate(
      path.join(templatesDir, 'definition.ts.ejs'),
      templateVars
    );
    const result = await createFile(files.definition, definitionContent, fileOptions);
    logFileResult(result.action, files.definition, opts.dryRun);
    if (!result.success && result.error) {
      errors.push(`Definition file: ${result.error}`);
    }
  } catch (error) {
    errors.push(`Definition file: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Generate executor file
  if (files.executor) {
    try {
      const executorContent = await renderTemplate(
        path.join(templatesDir, 'executor.ts.ejs'),
        templateVars
      );
      const result = await createFile(files.executor, executorContent, fileOptions);
      logFileResult(result.action, files.executor, opts.dryRun);
      if (!result.success && result.error) {
        errors.push(`Executor file: ${result.error}`);
      }
    } catch (error) {
      errors.push(`Executor file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Generate test file
  if (files.test) {
    try {
      const testContent = await renderTemplate(
        path.join(templatesDir, 'test.ts.ejs'),
        templateVars
      );
      const result = await createFile(files.test, testContent, fileOptions);
      logFileResult(result.action, files.test, opts.dryRun);
      if (!result.success && result.error) {
        errors.push(`Test file: ${result.error}`);
      }
    } catch (error) {
      errors.push(`Test file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Generate index file
  try {
    const indexContent = await renderTemplate(
      path.join(templatesDir, 'index.ts.ejs'),
      templateVars
    );
    const result = await createFile(files.index, indexContent, fileOptions);
    logFileResult(result.action, files.index, opts.dryRun);
    if (!result.success && result.error) {
      errors.push(`Index file: ${result.error}`);
    }
  } catch (error) {
    errors.push(`Index file: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Update workflows index
  if (!opts.skipRegistry && !opts.dryRun) {
    try {
      await updateWorkflowsIndex(opts.name, opts.directory);
      logger.file('UPDATE', `${opts.directory}/index.ts`);
    } catch (error) {
      errors.push(`Registry update: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (!opts.skipRegistry && opts.dryRun) {
    logger.file('UPDATE', `${opts.directory}/index.ts (would update)`);
  }

  logger.newline();

  if (errors.length > 0) {
    logger.warn('Generation completed with errors:');
    errors.forEach((e) => logger.listItem(e));
  } else if (opts.dryRun) {
    logger.info('Dry run complete. Run without --dry-run to create files.');
  } else {
    logger.success(`Workflow ${className} generated successfully!`);
  }

  return {
    success: errors.length === 0,
    files,
    errors,
  };
}

/**
 * Prompts for missing workflow options.
 */
export async function promptWorkflowOptions(
  provided: Partial<WorkflowGeneratorOptions>
): Promise<WorkflowGeneratorOptions> {
  const result = await promptForMissing({
    fields: [
      {
        name: 'name',
        message: 'Workflow name (kebab-case):',
        type: 'input',
        validate: (value: string) => {
          if (!value || value.trim() === '') return 'Name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(value)) {
            return 'Name must be kebab-case (lowercase letters, numbers, hyphens)';
          }
          return true;
        },
      },
      {
        name: 'preset',
        message: 'Workflow preset:',
        type: 'select',
        choices: presetChoices,
        default: 'custom',
      },
      {
        name: 'description',
        message: 'Workflow description:',
        type: 'input',
        default: '',
      },
    ],
    provided: provided as Record<string, unknown>,
  });

  // Get steps from preset or empty array
  let steps: WorkflowStepDefinition[] = provided.steps ?? [];
  const selectedPreset = result.preset as WorkflowPreset;

  if (selectedPreset && selectedPreset !== 'custom' && steps.length === 0) {
    steps = workflowPresets[selectedPreset].steps;
  }

  return {
    ...defaultWorkflowOptions,
    ...provided,
    name: result.name as string,
    preset: selectedPreset,
    description: result.description as string,
    steps,
  } as WorkflowGeneratorOptions;
}

/**
 * Updates the workflows index file to export the new workflow.
 */
async function updateWorkflowsIndex(
  workflowName: string,
  directory: string
): Promise<void> {
  const indexPath = path.join(directory, 'index.ts');
  const exportLine = `export * from './${workflowName}/index.js';`;

  // Check if index exists
  const exists = await fileExists(indexPath);
  if (!exists) {
    // Create new index
    const content = `/**
 * Inquiry Framework Workflows
 */

// Workflow types
export * from './types/index.js';

// Generated workflows
${exportLine}
`;
    await createFile(indexPath, content, { overwrite: true });
    return;
  }

  // Read existing content
  const content = await readFile(indexPath);
  if (!content) {
    throw new Error('Could not read workflows index file');
  }

  // Check if export already exists
  if (content.includes(exportLine)) {
    return; // Already exported
  }

  // Add export at the end
  const updatedContent = content.trimEnd() + '\n' + exportLine + '\n';
  await createFile(indexPath, updatedContent, { overwrite: true });
}

/**
 * Logs a file operation result.
 */
function logFileResult(
  action: 'created' | 'updated' | 'skipped' | 'error',
  filePath: string,
  dryRun: boolean
): void {
  const relativePath = path.relative(process.cwd(), filePath);
  const suffix = dryRun ? ' (would create)' : '';

  switch (action) {
    case 'created':
      logger.file('CREATE', relativePath + suffix);
      break;
    case 'updated':
      logger.file('UPDATE', relativePath + suffix);
      break;
    case 'skipped':
      logger.file('SKIP', relativePath);
      break;
    case 'error':
      logger.file('ERROR', relativePath);
      break;
  }
}

// Re-export schema types
export type { WorkflowGeneratorOptions, GeneratedWorkflowFiles, WorkflowStepDefinition, WorkflowPreset } from './schema.js';
export { defaultWorkflowOptions, workflowPresets, presetChoices, validateWorkflowOptions } from './schema.js';
