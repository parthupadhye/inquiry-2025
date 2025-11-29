/**
 * Agent generator for the Inquiry CLI.
 * Generates agent files from templates.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import type { AgentType } from '../../../../inquiry/contracts/agent.js';
import { createFile, fileExists, readFile } from '../../utils/files.js';
import { renderTemplate } from '../../utils/templates.js';
import { logger } from '../../utils/logger.js';
import { promptForMissing, commonPrompts } from '../../utils/prompts.js';
import { dasherize, classify, camelize } from '../../utils/helpers.js';
import {
  type AgentGeneratorOptions,
  type GeneratedFiles,
  defaultAgentOptions,
  agentTypeChoices,
  getAgentFilePaths,
  validateAgentOptions,
} from './schema.js';

// Get the directory of this file for template resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// The bundled file is at dist/index.js, so go up one level to package root
const packageRoot = path.resolve(__dirname, '..');
const templatesDir = path.join(packageRoot, 'templates/agent');

/**
 * Result of agent generation.
 */
export interface AgentGeneratorResult {
  success: boolean;
  files: GeneratedFiles;
  errors: string[];
}

/**
 * Generates a new agent with all associated files.
 *
 * @param options - Generator options
 * @returns Generation result
 */
export async function generateAgent(
  options: Partial<AgentGeneratorOptions>
): Promise<AgentGeneratorResult> {
  // Merge with defaults
  const opts: AgentGeneratorOptions = {
    ...defaultAgentOptions,
    ...options,
  } as AgentGeneratorOptions;

  // Validate options
  const validationErrors = validateAgentOptions(opts);
  if (validationErrors.length > 0) {
    return {
      success: false,
      files: {
        agent: '',
        schema: null,
        prompt: null,
        test: null,
        index: '',
      },
      errors: validationErrors,
    };
  }

  // Normalize the name to kebab-case
  const normalizedName = dasherize(opts.name);
  const className = classify(normalizedName) + 'Agent';
  const variableName = camelize(normalizedName) + 'Agent';

  // Get file paths
  const files = getAgentFilePaths(normalizedName, opts.directory, opts);

  // Template variables
  const templateVars = {
    name: normalizedName,
    className,
    variableName,
    type: opts.type,
    description: opts.description || `${className} for the Inquiry Framework`,
    withSchema: opts.withSchema,
    withPrompt: opts.withPrompt,
    withTest: opts.withTest,
  };

  const errors: string[] = [];
  const fileOptions = { dryRun: opts.dryRun, overwrite: opts.force };

  // Log what we're doing
  if (opts.dryRun) {
    logger.info('Dry run - showing files that would be created:');
  } else {
    logger.info(`Generating agent: ${className}`);
  }
  logger.newline();

  // Generate main agent file
  try {
    const agentContent = await renderTemplate(
      path.join(templatesDir, 'agent.ts.ejs'),
      templateVars
    );
    const result = await createFile(files.agent, agentContent, fileOptions);
    logFileResult(result.action, files.agent, opts.dryRun);
    if (!result.success && result.error) {
      errors.push(`Agent file: ${result.error}`);
    }
  } catch (error) {
    errors.push(`Agent file: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Generate schema file
  if (files.schema) {
    try {
      const schemaContent = await renderTemplate(
        path.join(templatesDir, 'schema.ts.ejs'),
        templateVars
      );
      const result = await createFile(files.schema, schemaContent, fileOptions);
      logFileResult(result.action, files.schema, opts.dryRun);
      if (!result.success && result.error) {
        errors.push(`Schema file: ${result.error}`);
      }
    } catch (error) {
      errors.push(`Schema file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Generate prompt file
  if (files.prompt) {
    try {
      const promptContent = await renderTemplate(
        path.join(templatesDir, 'prompt.ts.ejs'),
        templateVars
      );
      const result = await createFile(files.prompt, promptContent, fileOptions);
      logFileResult(result.action, files.prompt, opts.dryRun);
      if (!result.success && result.error) {
        errors.push(`Prompt file: ${result.error}`);
      }
    } catch (error) {
      errors.push(`Prompt file: ${error instanceof Error ? error.message : String(error)}`);
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

  // Update agents index if not skipped
  if (!opts.skipRegistry && !opts.dryRun) {
    try {
      await updateAgentsIndex(normalizedName, opts.directory);
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
    logger.success(`Agent ${className} generated successfully!`);
  }

  return {
    success: errors.length === 0,
    files,
    errors,
  };
}

/**
 * Prompts for missing agent options.
 */
export async function promptAgentOptions(
  provided: Partial<AgentGeneratorOptions>
): Promise<AgentGeneratorOptions> {
  const result = await promptForMissing({
    fields: [
      commonPrompts.name('Agent'),
      {
        name: 'type',
        message: 'Agent type:',
        type: 'select',
        choices: agentTypeChoices,
        default: 'custom',
      },
      {
        name: 'description',
        message: 'Agent description:',
        type: 'input',
        default: '',
      },
    ],
    provided: provided as Record<string, unknown>,
  });

  return {
    ...defaultAgentOptions,
    ...provided,
    name: result.name as string,
    type: result.type as AgentType,
    description: result.description as string,
  } as AgentGeneratorOptions;
}

/**
 * Updates the agents index file to export the new agent.
 */
async function updateAgentsIndex(
  agentName: string,
  directory: string
): Promise<void> {
  const indexPath = path.join(directory, 'index.ts');
  const exportLine = `export * from './${agentName}/index.js';`;

  // Check if index exists
  const exists = await fileExists(indexPath);
  if (!exists) {
    // Create new index
    const content = `/**
 * Inquiry Framework Agents
 */

// Base agent module
export * from './base/index.js';

// Agent registry module
export * from './registry/index.js';

// Generated agents
${exportLine}
`;
    await createFile(indexPath, content, { overwrite: true });
    return;
  }

  // Read existing content
  const content = await readFile(indexPath);
  if (!content) {
    throw new Error('Could not read agents index file');
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
export type { AgentGeneratorOptions, GeneratedFiles } from './schema.js';
export { defaultAgentOptions, agentTypeChoices, validateAgentOptions } from './schema.js';
