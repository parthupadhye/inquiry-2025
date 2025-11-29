/**
 * Configuration schema for Inquiry Framework projects.
 */

/**
 * Agent generation configuration.
 */
export interface AgentConfig {
  /** Default directory for generated agents */
  directory: string;
  /** Default agent type */
  defaultType: 'extraction' | 'validation' | 'transformation' | 'analysis' | 'custom';
  /** Template overrides directory */
  templatesDir?: string;
}

/**
 * Workflow generation configuration.
 */
export interface WorkflowConfig {
  /** Default directory for generated workflows */
  directory: string;
  /** Template overrides directory */
  templatesDir?: string;
}

/**
 * Node (Neo4j) generation configuration.
 */
export interface NodeConfig {
  /** Default directory for generated node types */
  directory: string;
  /** Template overrides directory */
  templatesDir?: string;
}

/**
 * Contract generation configuration.
 */
export interface ContractConfig {
  /** Default directory for generated contracts */
  directory: string;
  /** Template overrides directory */
  templatesDir?: string;
}

/**
 * Generation settings for all schematics.
 */
export interface GenerateConfig {
  /** Agent generation settings */
  agent: AgentConfig;
  /** Workflow generation settings */
  workflow: WorkflowConfig;
  /** Node generation settings */
  node: NodeConfig;
  /** Contract generation settings */
  contract: ContractConfig;
}

/**
 * Project structure configuration.
 */
export interface ProjectConfig {
  /** Root directory for inquiry files (relative to project root) */
  rootDir: string;
  /** Source directory within rootDir */
  srcDir: string;
}

/**
 * Main Inquiry configuration schema.
 */
export interface InquiryConfig {
  /** Schema version for future compatibility */
  $schema?: string;
  /** Project structure settings */
  project: ProjectConfig;
  /** Generation settings for schematics */
  generate: GenerateConfig;
  /** Custom template variables available in all templates */
  templateVariables?: Record<string, unknown>;
}

/**
 * Partial configuration for user overrides.
 * All fields are optional and will be merged with defaults.
 */
export type PartialInquiryConfig = DeepPartial<InquiryConfig>;

/**
 * Deep partial utility type.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Configuration result from the loader.
 */
export interface ConfigResult {
  /** The merged configuration */
  config: InquiryConfig;
  /** Path to the config file (if found) */
  filepath: string | null;
  /** Whether a config file was found */
  isEmpty: boolean;
}
