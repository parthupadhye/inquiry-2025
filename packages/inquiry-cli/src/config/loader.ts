import { cosmiconfig } from 'cosmiconfig';
import { getDefaultConfig } from './defaults.js';
import type { InquiryConfig, PartialInquiryConfig, ConfigResult } from './schema.js';

/** Module name for cosmiconfig */
const MODULE_NAME = 'inquiry';

/** Cached configuration */
let cachedConfig: ConfigResult | null = null;

/**
 * Deep merges two objects, with source values overriding target values.
 */
function deepMerge(
  target: InquiryConfig,
  source: PartialInquiryConfig
): InquiryConfig {
  const result = JSON.parse(JSON.stringify(target)) as InquiryConfig;

  // Merge project config
  if (source.project) {
    if (source.project.rootDir !== undefined) {
      result.project.rootDir = source.project.rootDir;
    }
    if (source.project.srcDir !== undefined) {
      result.project.srcDir = source.project.srcDir;
    }
  }

  // Merge generate config
  if (source.generate) {
    if (source.generate.agent) {
      Object.assign(result.generate.agent, source.generate.agent);
    }
    if (source.generate.workflow) {
      Object.assign(result.generate.workflow, source.generate.workflow);
    }
    if (source.generate.node) {
      Object.assign(result.generate.node, source.generate.node);
    }
    if (source.generate.contract) {
      Object.assign(result.generate.contract, source.generate.contract);
    }
  }

  // Merge template variables
  if (source.templateVariables) {
    result.templateVariables = {
      ...result.templateVariables,
      ...source.templateVariables,
    };
  }

  // Copy $schema if provided
  if (source.$schema) {
    result.$schema = source.$schema;
  }

  return result;
}

/**
 * Creates a cosmiconfig explorer for inquiry config files.
 * Searches for:
 * - inquiry.config.ts
 * - inquiry.config.js
 * - inquiry.config.mjs
 * - inquiry.config.cjs
 * - .inquiryrc
 * - .inquiryrc.json
 * - .inquiryrc.yaml
 * - .inquiryrc.yml
 * - package.json "inquiry" field
 */
function createExplorer() {
  return cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      `${MODULE_NAME}.config.ts`,
      `${MODULE_NAME}.config.js`,
      `${MODULE_NAME}.config.mjs`,
      `${MODULE_NAME}.config.cjs`,
      `.${MODULE_NAME}rc`,
      `.${MODULE_NAME}rc.json`,
      `.${MODULE_NAME}rc.yaml`,
      `.${MODULE_NAME}rc.yml`,
      'package.json',
    ],
  });
}

/**
 * Loads the inquiry configuration from the project.
 * Searches for config files starting from the specified directory
 * and walking up the directory tree.
 *
 * @param searchFrom - Directory to start searching from (defaults to cwd)
 * @param useCache - Whether to use cached config (defaults to true)
 * @returns The merged configuration with the file path
 *
 * @example
 * const { config, filepath } = await loadConfig();
 * console.log(config.project.rootDir); // 'inquiry'
 * console.log(filepath); // '/path/to/inquiry.config.ts' or null
 */
export async function loadConfig(
  searchFrom?: string,
  useCache = true
): Promise<ConfigResult> {
  // Return cached config if available
  if (useCache && cachedConfig) {
    return cachedConfig;
  }

  const explorer = createExplorer();
  const result = await explorer.search(searchFrom);

  let config: InquiryConfig;
  let filepath: string | null = null;
  let isEmpty = true;

  if (result && !result.isEmpty) {
    // Merge user config with defaults
    const userConfig = result.config as PartialInquiryConfig;
    config = deepMerge(getDefaultConfig(), userConfig);
    filepath = result.filepath;
    isEmpty = false;
  } else {
    // No config file found, use defaults
    config = getDefaultConfig();
  }

  const configResult: ConfigResult = {
    config,
    filepath,
    isEmpty,
  };

  // Cache the result
  if (useCache) {
    cachedConfig = configResult;
  }

  return configResult;
}

/**
 * Loads configuration from a specific file path.
 *
 * @param filepath - Path to the config file
 * @returns The merged configuration
 */
export async function loadConfigFromFile(filepath: string): Promise<ConfigResult> {
  const explorer = createExplorer();
  const result = await explorer.load(filepath);

  if (!result || result.isEmpty) {
    return {
      config: getDefaultConfig(),
      filepath,
      isEmpty: true,
    };
  }

  const userConfig = result.config as PartialInquiryConfig;
  const config = deepMerge(getDefaultConfig(), userConfig);

  return {
    config,
    filepath: result.filepath,
    isEmpty: false,
  };
}

/**
 * Clears the cached configuration.
 * Useful for testing or when config files may have changed.
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

/**
 * Gets the current cached configuration without loading.
 * Returns null if no config has been loaded yet.
 */
export function getCachedConfig(): ConfigResult | null {
  return cachedConfig;
}

// Re-export types and defaults
export type { InquiryConfig, PartialInquiryConfig, ConfigResult } from './schema.js';
export { defaultConfig, getDefaultConfig } from './defaults.js';
