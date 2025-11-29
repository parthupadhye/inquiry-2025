/**
 * Graph Module - Neo4j database connectivity for the Inquiry Framework.
 *
 * Provides connection pooling, query execution, and transaction support
 * for interacting with Neo4j graph databases.
 */

// Main client exports
export {
  Neo4jClient,
  getNeo4jClient,
  getConfigFromEnv,
} from './client.js';

// Type exports
export type {
  Neo4jConfig,
  QueryOptions,
  TransactionCallback,
  Neo4jQueryResult,
  ConnectionHealth,
} from './client.js';

// Utility exports
export {
  toNumber,
  toInteger,
  convertNeo4jValue,
  cypher,
} from './client.js';

// Schema exports
export * from './schema/index.js';
