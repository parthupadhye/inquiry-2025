/**
 * Node generator for the Inquiry CLI.
 * Generates Neo4j node type files from templates.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createFile, fileExists, readFile } from '../../utils/files.js';
import { renderTemplate } from '../../utils/templates.js';
import { logger } from '../../utils/logger.js';
import { promptForMissing } from '../../utils/prompts.js';
import { classify, camelize } from '../../utils/helpers.js';
import {
  type NodeGeneratorOptions,
  type GeneratedNodeFiles,
  type NodePropertyDefinition,
  defaultNodeOptions,
  propertyPresets,
  propertyTypeChoices,
  getNodeFilePaths,
  validateNodeOptions,
  tsCypherType,
} from './schema.js';

// Get the directory of this file for template resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const templatesDir = path.join(packageRoot, 'templates/node');

/**
 * Result of node generation.
 */
export interface NodeGeneratorResult {
  success: boolean;
  files: GeneratedNodeFiles;
  errors: string[];
}

/**
 * Generates a new Neo4j node type with all associated files.
 */
export async function generateNode(
  options: Partial<NodeGeneratorOptions>
): Promise<NodeGeneratorResult> {
  // Merge with defaults
  const opts: NodeGeneratorOptions = {
    ...defaultNodeOptions,
    ...options,
  } as NodeGeneratorOptions;

  // Validate options
  const validationErrors = validateNodeOptions(opts);
  if (validationErrors.length > 0) {
    return {
      success: false,
      files: {
        interface: '',
        queries: null,
        constraints: null,
        index: '',
      },
      errors: validationErrors,
    };
  }

  // Normalize the name to PascalCase for Neo4j label
  const nodeLabel = classify(opts.name);
  const variableName = camelize(opts.name);

  // Build properties list with id and timestamps if requested
  const allProperties: NodePropertyDefinition[] = [];

  if (opts.withId) {
    allProperties.push({
      name: 'id',
      type: 'string',
      required: true,
      unique: true,
      indexed: true,
      description: 'Unique identifier (UUID)',
    });
  }

  allProperties.push(...opts.properties);

  if (opts.withTimestamps) {
    allProperties.push(
      {
        name: 'createdAt',
        type: 'Date',
        required: true,
        indexed: true,
        description: 'Creation timestamp',
      },
      {
        name: 'updatedAt',
        type: 'Date',
        required: true,
        indexed: false,
        description: 'Last update timestamp',
      }
    );
  }

  // Get file paths
  const files = getNodeFilePaths(opts.name, opts.directory, opts);

  // Template variables
  const templateVars = {
    name: opts.name,
    label: nodeLabel,
    variableName,
    description: opts.description || `${nodeLabel} node type`,
    properties: allProperties,
    withId: opts.withId,
    withTimestamps: opts.withTimestamps,
    // Helper functions for templates
    classify,
    camelize,
    tsCypherType,
  };

  const errors: string[] = [];
  const fileOptions = { dryRun: opts.dryRun, overwrite: opts.force };

  // Log what we're doing
  if (opts.dryRun) {
    logger.info('Dry run - showing files that would be created:');
  } else {
    logger.info(`Generating node: ${nodeLabel}`);
  }
  logger.newline();

  // Generate interface file
  try {
    const interfaceContent = await renderTemplate(
      path.join(templatesDir, 'interface.ts.ejs'),
      templateVars
    );
    const result = await createFile(files.interface, interfaceContent, fileOptions);
    logFileResult(result.action, files.interface, opts.dryRun);
    if (!result.success && result.error) {
      errors.push(`Interface file: ${result.error}`);
    }
  } catch (error) {
    errors.push(`Interface file: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Generate queries file
  if (files.queries) {
    try {
      const queriesContent = await renderTemplate(
        path.join(templatesDir, 'queries.cypher.ejs'),
        templateVars
      );
      const result = await createFile(files.queries, queriesContent, fileOptions);
      logFileResult(result.action, files.queries, opts.dryRun);
      if (!result.success && result.error) {
        errors.push(`Queries file: ${result.error}`);
      }
    } catch (error) {
      errors.push(`Queries file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Generate constraints file
  if (files.constraints) {
    try {
      const constraintsContent = await renderTemplate(
        path.join(templatesDir, 'constraints.cypher.ejs'),
        templateVars
      );
      const result = await createFile(files.constraints, constraintsContent, fileOptions);
      logFileResult(result.action, files.constraints, opts.dryRun);
      if (!result.success && result.error) {
        errors.push(`Constraints file: ${result.error}`);
      }
    } catch (error) {
      errors.push(`Constraints file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Update nodes index
  if (!opts.skipIndex && !opts.dryRun) {
    try {
      await updateNodesIndex(opts.name, opts.directory);
      logger.file('UPDATE', `${opts.directory}/nodes/index.ts`);
    } catch (error) {
      errors.push(`Index update: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (!opts.skipIndex && opts.dryRun) {
    logger.file('UPDATE', `${opts.directory}/nodes/index.ts (would update)`);
  }

  logger.newline();

  if (errors.length > 0) {
    logger.warn('Generation completed with errors:');
    errors.forEach((e) => logger.listItem(e));
  } else if (opts.dryRun) {
    logger.info('Dry run complete. Run without --dry-run to create files.');
  } else {
    logger.success(`Node ${nodeLabel} generated successfully!`);
  }

  return {
    success: errors.length === 0,
    files,
    errors,
  };
}

/**
 * Prompts for missing node options.
 */
export async function promptNodeOptions(
  provided: Partial<NodeGeneratorOptions>
): Promise<NodeGeneratorOptions> {
  const result = await promptForMissing({
    fields: [
      {
        name: 'name',
        message: 'Node name (PascalCase):',
        type: 'input',
        validate: (value: string) => {
          if (!value || value.trim() === '') return 'Name is required';
          if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
            return 'Name must start with a letter and contain only alphanumeric characters';
          }
          return true;
        },
      },
      {
        name: 'description',
        message: 'Node description:',
        type: 'input',
        default: '',
      },
      {
        name: 'preset',
        message: 'Property preset:',
        type: 'select',
        choices: [
          { value: 'none', label: 'None - Define custom properties' },
          { value: 'basic', label: 'Basic - name, description' },
          { value: 'content', label: 'Content - title, content, contentType' },
          { value: 'entity', label: 'Entity - name, type, metadata' },
        ],
        default: 'none',
      },
    ],
    provided: provided as Record<string, unknown>,
  });

  // Apply preset if selected
  let properties = provided.properties ?? [];
  if (result.preset && result.preset !== 'none') {
    properties = propertyPresets[result.preset as string] ?? [];
  }

  return {
    ...defaultNodeOptions,
    ...provided,
    name: result.name as string,
    description: result.description as string,
    properties,
  } as NodeGeneratorOptions;
}

/**
 * Updates the nodes index file to export the new node type.
 */
async function updateNodesIndex(
  nodeName: string,
  directory: string
): Promise<void> {
  const indexPath = path.join(directory, 'nodes', 'index.ts');
  const fileName = nodeName.toLowerCase();
  const exportLine = `export * from './${fileName}.js';`;

  // Check if index exists
  const exists = await fileExists(indexPath);
  if (!exists) {
    // Create new index
    const content = `/**
 * Neo4j Node Type Definitions
 * Auto-generated exports for graph node types.
 */

${exportLine}
`;
    await createFile(indexPath, content, { overwrite: true });
    return;
  }

  // Read existing content
  const content = await readFile(indexPath);
  if (!content) {
    throw new Error('Could not read nodes index file');
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
export type { NodeGeneratorOptions, GeneratedNodeFiles, NodePropertyDefinition } from './schema.js';
export { defaultNodeOptions, propertyPresets, propertyTypeChoices, validateNodeOptions } from './schema.js';
