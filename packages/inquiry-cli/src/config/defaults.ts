import type { InquiryConfig } from './schema.js';

/**
 * Default configuration for Inquiry Framework projects.
 * These values are used when no config file is found or
 * when specific options are not specified.
 */
export const defaultConfig: InquiryConfig = {
  project: {
    rootDir: 'inquiry',
    srcDir: 'src',
  },
  generate: {
    agent: {
      directory: 'agents',
      defaultType: 'custom',
    },
    workflow: {
      directory: 'workflows',
    },
    node: {
      directory: 'nodes',
    },
    contract: {
      directory: 'contracts',
    },
  },
};

/**
 * Creates a fresh copy of the default configuration.
 * Use this when you need to modify the defaults without affecting the original.
 */
export function getDefaultConfig(): InquiryConfig {
  return JSON.parse(JSON.stringify(defaultConfig));
}
