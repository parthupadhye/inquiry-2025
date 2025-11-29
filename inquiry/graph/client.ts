/**
 * Neo4j Client for the Inquiry Framework.
 * Provides connection pooling, query execution, and transaction support.
 */

import neo4j, {
  Driver,
  Session,
  Result,
  Transaction,
  ManagedTransaction,
  QueryResult,
  RecordShape,
  Integer,
} from 'neo4j-driver';

/**
 * Neo4j connection configuration.
 */
export interface Neo4jConfig {
  /** Neo4j URI (e.g., 'neo4j://localhost:7687') */
  uri: string;
  /** Username for authentication */
  username: string;
  /** Password for authentication */
  password: string;
  /** Database name (default: 'neo4j') */
  database?: string;
  /** Maximum connection pool size */
  maxConnectionPoolSize?: number;
  /** Connection acquisition timeout in milliseconds */
  connectionAcquisitionTimeout?: number;
  /** Maximum transaction retry time in milliseconds */
  maxTransactionRetryTime?: number;
  /** Enable encrypted connection */
  encrypted?: boolean;
  /** Trust strategy for certificates */
  trust?: 'TRUST_ALL_CERTIFICATES' | 'TRUST_SYSTEM_CA_SIGNED_CERTIFICATES';
}

/**
 * Query options for execution.
 */
export interface QueryOptions {
  /** Database to execute query against */
  database?: string;
  /** Query timeout in milliseconds */
  timeout?: number;
  /** Transaction metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Transaction callback function type.
 */
export type TransactionCallback<T> = (tx: ManagedTransaction) => Promise<T>;

/**
 * Result of a query execution with convenience methods.
 */
export interface Neo4jQueryResult<T extends RecordShape = RecordShape> {
  /** Raw query result */
  result: QueryResult<T>;
  /** Records as plain objects */
  records: T[];
  /** Summary information */
  summary: {
    query: string;
    parameters: Record<string, unknown>;
    counters: {
      nodesCreated: number;
      nodesDeleted: number;
      relationshipsCreated: number;
      relationshipsDeleted: number;
      propertiesSet: number;
      labelsAdded: number;
      labelsRemoved: number;
    };
    resultAvailableAfter: number;
    resultConsumedAfter: number;
  };
  /** Get single record or null */
  single(): T | null;
  /** Get first record or throw */
  first(): T;
  /** Check if result is empty */
  isEmpty(): boolean;
}

/**
 * Connection health status.
 */
export interface ConnectionHealth {
  connected: boolean;
  serverVersion: string | null;
  serverAddress: string | null;
  lastCheckedAt: number;
  error: string | null;
}

/**
 * Neo4j client singleton for managing database connections.
 */
export class Neo4jClient {
  private static instance: Neo4jClient | null = null;

  private driver: Driver | null = null;
  private config: Neo4jConfig | null = null;
  private defaultDatabase: string = 'neo4j';

  /**
   * Private constructor for singleton pattern.
   */
  private constructor() {}

  /**
   * Gets the singleton client instance.
   */
  public static getInstance(): Neo4jClient {
    if (!Neo4jClient.instance) {
      Neo4jClient.instance = new Neo4jClient();
    }
    return Neo4jClient.instance;
  }

  /**
   * Resets the singleton instance (for testing).
   */
  public static async resetInstance(): Promise<void> {
    if (Neo4jClient.instance) {
      await Neo4jClient.instance.close();
      Neo4jClient.instance = null;
    }
  }

  /**
   * Initializes the client with configuration.
   * Can be called multiple times - subsequent calls update the config.
   */
  public async connect(config: Neo4jConfig): Promise<void> {
    // Close existing connection if any
    if (this.driver) {
      await this.close();
    }

    this.config = config;
    this.defaultDatabase = config.database ?? 'neo4j';

    // Create driver with configuration
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password),
      {
        maxConnectionPoolSize: config.maxConnectionPoolSize ?? 100,
        connectionAcquisitionTimeout: config.connectionAcquisitionTimeout ?? 60000,
        maxTransactionRetryTime: config.maxTransactionRetryTime ?? 30000,
        encrypted: config.encrypted,
        trust: config.trust,
      }
    );

    // Verify connectivity
    await this.driver.verifyConnectivity();
  }

  /**
   * Connects using environment variables.
   * Expects: NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE (optional)
   */
  public async connectFromEnv(): Promise<void> {
    const config = getConfigFromEnv();
    await this.connect(config);
  }

  /**
   * Closes the driver connection.
   */
  public async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
    }
  }

  /**
   * Checks if the client is connected.
   */
  public isConnected(): boolean {
    return this.driver !== null;
  }

  /**
   * Gets the underlying Neo4j driver.
   * @throws Error if not connected
   */
  public getDriver(): Driver {
    if (!this.driver) {
      throw new Error('Neo4j client is not connected. Call connect() first.');
    }
    return this.driver;
  }

  /**
   * Creates a new session.
   * Remember to close the session when done.
   */
  public session(database?: string): Session {
    return this.getDriver().session({
      database: database ?? this.defaultDatabase,
    });
  }

  /**
   * Executes a read query.
   */
  public async query<T extends RecordShape = RecordShape>(
    cypher: string,
    parameters: Record<string, unknown> = {},
    options: QueryOptions = {}
  ): Promise<Neo4jQueryResult<T>> {
    const session = this.session(options.database);

    try {
      const result = await session.run<T>(cypher, parameters, {
        timeout: options.timeout ? neo4j.int(options.timeout) : undefined,
        metadata: options.metadata,
      });

      return this.wrapResult<T>(result, cypher, parameters);
    } finally {
      await session.close();
    }
  }

  /**
   * Executes a write query.
   */
  public async write<T extends RecordShape = RecordShape>(
    cypher: string,
    parameters: Record<string, unknown> = {},
    options: QueryOptions = {}
  ): Promise<Neo4jQueryResult<T>> {
    const session = this.session(options.database);

    try {
      const result = await session.executeWrite((tx) =>
        tx.run<T>(cypher, parameters)
      );
      return this.wrapResult<T>(result, cypher, parameters);
    } finally {
      await session.close();
    }
  }

  /**
   * Executes a read transaction with automatic retry.
   */
  public async executeRead<T>(
    callback: TransactionCallback<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const session = this.session(options.database);

    try {
      return await session.executeRead(callback);
    } finally {
      await session.close();
    }
  }

  /**
   * Executes a write transaction with automatic retry.
   */
  public async executeWrite<T>(
    callback: TransactionCallback<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const session = this.session(options.database);

    try {
      return await session.executeWrite(callback);
    } finally {
      await session.close();
    }
  }

  /**
   * Executes multiple queries in a single transaction.
   */
  public async transaction<T>(
    callback: (tx: ManagedTransaction) => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    return this.executeWrite(callback, options);
  }

  /**
   * Executes a batch of queries in parallel (each in its own session).
   */
  public async batch<T extends RecordShape = RecordShape>(
    queries: Array<{ cypher: string; parameters?: Record<string, unknown> }>,
    options: QueryOptions = {}
  ): Promise<Neo4jQueryResult<T>[]> {
    const promises = queries.map(({ cypher, parameters }) =>
      this.query<T>(cypher, parameters ?? {}, options)
    );
    return Promise.all(promises);
  }

  /**
   * Checks connection health.
   */
  public async checkHealth(): Promise<ConnectionHealth> {
    const health: ConnectionHealth = {
      connected: false,
      serverVersion: null,
      serverAddress: null,
      lastCheckedAt: Date.now(),
      error: null,
    };

    if (!this.driver) {
      health.error = 'Client is not connected';
      return health;
    }

    try {
      const serverInfo = await this.driver.getServerInfo();
      health.connected = true;
      health.serverVersion = serverInfo.protocolVersion?.toString() ?? null;
      health.serverAddress = serverInfo.address ?? null;
    } catch (error) {
      health.error = error instanceof Error ? error.message : String(error);
    }

    return health;
  }

  /**
   * Verifies connectivity to the database.
   */
  public async verifyConnectivity(): Promise<boolean> {
    if (!this.driver) {
      return false;
    }

    try {
      await this.driver.verifyConnectivity();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets database statistics.
   */
  public async getStats(database?: string): Promise<{
    nodeCount: number;
    relationshipCount: number;
    labels: string[];
    relationshipTypes: string[];
  }> {
    const nodeCountResult = await this.query<{ count: Integer }>(
      'MATCH (n) RETURN count(n) as count',
      {},
      { database }
    );

    const relCountResult = await this.query<{ count: Integer }>(
      'MATCH ()-[r]->() RETURN count(r) as count',
      {},
      { database }
    );

    const labelsResult = await this.query<{ label: string }>(
      'CALL db.labels() YIELD label RETURN label',
      {},
      { database }
    );

    const relTypesResult = await this.query<{ type: string }>(
      'CALL db.relationshipTypes() YIELD relationshipType as type RETURN type',
      {},
      { database }
    );

    return {
      nodeCount: toNumber(nodeCountResult.single()?.count ?? 0),
      relationshipCount: toNumber(relCountResult.single()?.count ?? 0),
      labels: labelsResult.records.map((r) => r.label),
      relationshipTypes: relTypesResult.records.map((r) => r.type),
    };
  }

  /**
   * Wraps a query result with convenience methods.
   */
  private wrapResult<T extends RecordShape>(
    result: QueryResult<T>,
    query: string,
    parameters: Record<string, unknown>
  ): Neo4jQueryResult<T> {
    const records = result.records.map((record) => {
      const obj: Record<string, unknown> = {};
      record.keys.forEach((key) => {
        obj[key as string] = convertNeo4jValue(record.get(key));
      });
      return obj as T;
    });

    const counters = result.summary.counters.updates();

    return {
      result,
      records,
      summary: {
        query,
        parameters,
        counters: {
          nodesCreated: counters.nodesCreated,
          nodesDeleted: counters.nodesDeleted,
          relationshipsCreated: counters.relationshipsCreated,
          relationshipsDeleted: counters.relationshipsDeleted,
          propertiesSet: counters.propertiesSet,
          labelsAdded: counters.labelsAdded,
          labelsRemoved: counters.labelsRemoved,
        },
        resultAvailableAfter: toNumber(result.summary.resultAvailableAfter),
        resultConsumedAfter: toNumber(result.summary.resultConsumedAfter),
      },
      single(): T | null {
        return records.length > 0 ? records[0] : null;
      },
      first(): T {
        if (records.length === 0) {
          throw new Error('No records found');
        }
        return records[0];
      },
      isEmpty(): boolean {
        return records.length === 0;
      },
    };
  }
}

/**
 * Gets Neo4j configuration from environment variables.
 */
export function getConfigFromEnv(): Neo4jConfig {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri) {
    throw new Error('NEO4J_URI environment variable is required');
  }
  if (!username) {
    throw new Error('NEO4J_USERNAME environment variable is required');
  }
  if (!password) {
    throw new Error('NEO4J_PASSWORD environment variable is required');
  }

  return {
    uri,
    username,
    password,
    database: process.env.NEO4J_DATABASE ?? 'neo4j',
    maxConnectionPoolSize: process.env.NEO4J_MAX_POOL_SIZE
      ? parseInt(process.env.NEO4J_MAX_POOL_SIZE, 10)
      : undefined,
    encrypted: process.env.NEO4J_ENCRYPTED === 'true',
  };
}

/**
 * Gets the global Neo4j client instance.
 */
export function getNeo4jClient(): Neo4jClient {
  return Neo4jClient.getInstance();
}

/**
 * Converts a Neo4j Integer to a JavaScript number.
 */
export function toNumber(value: Integer | number | bigint | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (neo4j.isInt(value)) {
    return (value as Integer).toNumber();
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return value as number;
}

/**
 * Converts JavaScript number to Neo4j Integer for large values.
 */
export function toInteger(value: number): Integer {
  return neo4j.int(value);
}

/**
 * Converts Neo4j values to JavaScript values recursively.
 */
export function convertNeo4jValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle Neo4j Integer
  if (neo4j.isInt(value)) {
    return (value as Integer).toNumber();
  }

  // Handle Date
  if (neo4j.isDate(value) || neo4j.isDateTime(value) || neo4j.isLocalDateTime(value)) {
    return (value as { toStandardDate(): Date }).toStandardDate();
  }

  // Handle Duration
  if (neo4j.isDuration(value)) {
    return value.toString();
  }

  // Handle Point
  if (neo4j.isPoint(value)) {
    const point = value as { x: number; y: number; z?: number; srid: Integer };
    return {
      x: point.x,
      y: point.y,
      z: point.z,
      srid: toNumber(point.srid),
    };
  }

  // Handle Node
  if (isNeo4jNode(value)) {
    const node = value as {
      identity: Integer;
      labels: string[];
      properties: Record<string, unknown>;
    };
    return {
      id: toNumber(node.identity),
      labels: node.labels,
      properties: convertNeo4jValue(node.properties),
    };
  }

  // Handle Relationship
  if (isNeo4jRelationship(value)) {
    const rel = value as {
      identity: Integer;
      type: string;
      start: Integer;
      end: Integer;
      properties: Record<string, unknown>;
    };
    return {
      id: toNumber(rel.identity),
      type: rel.type,
      startNodeId: toNumber(rel.start),
      endNodeId: toNumber(rel.end),
      properties: convertNeo4jValue(rel.properties),
    };
  }

  // Handle Array
  if (Array.isArray(value)) {
    return value.map(convertNeo4jValue);
  }

  // Handle Object
  if (typeof value === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      converted[key] = convertNeo4jValue(val);
    }
    return converted;
  }

  return value;
}

/**
 * Type guard for Neo4j Node.
 */
function isNeo4jNode(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'identity' in value &&
    'labels' in value &&
    'properties' in value
  );
}

/**
 * Type guard for Neo4j Relationship.
 */
function isNeo4jRelationship(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'identity' in value &&
    'type' in value &&
    'start' in value &&
    'end' in value &&
    'properties' in value
  );
}

/**
 * Creates a parameterized query builder for safe query construction.
 */
export function cypher(
  strings: TemplateStringsArray,
  ...values: unknown[]
): { query: string; parameters: Record<string, unknown> } {
  const parameters: Record<string, unknown> = {};
  let query = strings[0];

  values.forEach((value, i) => {
    const paramName = `p${i}`;
    parameters[paramName] = value;
    query += `$${paramName}${strings[i + 1]}`;
  });

  return { query, parameters };
}
