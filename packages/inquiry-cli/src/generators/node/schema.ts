/**
 * Schema definitions for the node generator.
 */

import path from 'path';

/**
 * Property definition for a Neo4j node.
 */
export interface NodePropertyDefinition {
  /** Property name */
  name: string;
  /** TypeScript type */
  type: 'string' | 'number' | 'boolean' | 'Date' | 'string[]' | 'number[]';
  /** Whether the property is required */
  required: boolean;
  /** Whether to create an index on this property */
  indexed?: boolean;
  /** Whether this property should be unique */
  unique?: boolean;
  /** Default value (as string representation) */
  defaultValue?: string;
  /** Property description */
  description?: string;
}

/**
 * Options for the node generator.
 */
export interface NodeGeneratorOptions {
  /** Node name (will be PascalCase label) */
  name: string;
  /** Node description */
  description: string;
  /** Output directory for generated files */
  directory: string;
  /** Properties to include */
  properties: NodePropertyDefinition[];
  /** Whether to include timestamps (createdAt, updatedAt) */
  withTimestamps: boolean;
  /** Whether to include a UUID id property */
  withId: boolean;
  /** Whether to generate query templates */
  withQueries: boolean;
  /** Whether to generate constraints */
  withConstraints: boolean;
  /** Dry run mode */
  dryRun: boolean;
  /** Force overwrite existing files */
  force: boolean;
  /** Skip updating the schema index */
  skipIndex: boolean;
}

/**
 * Generated file paths.
 */
export interface GeneratedNodeFiles {
  interface: string;
  queries: string | null;
  constraints: string | null;
  index: string;
}

/**
 * Default options for node generation.
 */
export const defaultNodeOptions: Partial<NodeGeneratorOptions> = {
  directory: 'inquiry/graph/schema',
  properties: [],
  withTimestamps: true,
  withId: true,
  withQueries: true,
  withConstraints: true,
  dryRun: false,
  force: false,
  skipIndex: false,
};

/**
 * Common property presets.
 */
export const propertyPresets: Record<string, NodePropertyDefinition[]> = {
  basic: [
    { name: 'name', type: 'string', required: true, indexed: true },
    { name: 'description', type: 'string', required: false },
  ],
  content: [
    { name: 'title', type: 'string', required: true, indexed: true },
    { name: 'content', type: 'string', required: true },
    { name: 'contentType', type: 'string', required: false },
  ],
  entity: [
    { name: 'name', type: 'string', required: true, indexed: true },
    { name: 'type', type: 'string', required: true, indexed: true },
    { name: 'metadata', type: 'string', required: false },
  ],
};

/**
 * Type choices for property prompts.
 */
export const propertyTypeChoices = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'Date', label: 'Date' },
  { value: 'string[]', label: 'String Array' },
  { value: 'number[]', label: 'Number Array' },
];

/**
 * Gets file paths for generated node files.
 */
export function getNodeFilePaths(
  name: string,
  directory: string,
  options: Partial<NodeGeneratorOptions>
): GeneratedNodeFiles {
  const basePath = path.join(directory, 'nodes');
  const fileName = name.toLowerCase();

  return {
    interface: path.join(basePath, `${fileName}.ts`),
    queries: options.withQueries !== false
      ? path.join(basePath, `${fileName}.queries.cypher`)
      : null,
    constraints: options.withConstraints !== false
      ? path.join(basePath, `${fileName}.constraints.cypher`)
      : null,
    index: path.join(basePath, 'index.ts'),
  };
}

/**
 * Validates node generator options.
 */
export function validateNodeOptions(options: NodeGeneratorOptions): string[] {
  const errors: string[] = [];

  if (!options.name || options.name.trim() === '') {
    errors.push('Node name is required');
  } else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
    errors.push('Node name must start with a letter and contain only alphanumeric characters');
  }

  if (options.properties) {
    for (const prop of options.properties) {
      if (!prop.name || prop.name.trim() === '') {
        errors.push('Property name is required');
      } else if (!/^[a-z][a-zA-Z0-9]*$/.test(prop.name)) {
        errors.push(`Property "${prop.name}" must be camelCase`);
      }
    }
  }

  return errors;
}

/**
 * Maps TypeScript type to Cypher type hint.
 */
export function tsCypherType(tsType: string): string {
  const typeMap: Record<string, string> = {
    'string': 'STRING',
    'number': 'INTEGER',
    'boolean': 'BOOLEAN',
    'Date': 'DATETIME',
    'string[]': 'LIST<STRING>',
    'number[]': 'LIST<INTEGER>',
  };
  return typeMap[tsType] ?? 'ANY';
}
