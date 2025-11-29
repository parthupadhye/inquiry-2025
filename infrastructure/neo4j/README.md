# Neo4j Local Development Setup

Local Neo4j database for the Inquiry Framework using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2+

## Quick Start

```bash
# Navigate to this directory
cd infrastructure/neo4j

# Start Neo4j
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f neo4j
```

## Access

| Service | URL | Description |
|---------|-----|-------------|
| Neo4j Browser | http://localhost:7474 | Web-based query interface |
| Bolt Protocol | bolt://localhost:7687 | Driver connection endpoint |

### Default Credentials

- **Username:** `neo4j`
- **Password:** `inquiry_dev_2024`

## Environment Variables

Copy `.env.example` to `.env` to customize settings:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NEO4J_USERNAME` | `neo4j` | Database username |
| `NEO4J_PASSWORD` | `inquiry_dev_2024` | Database password |
| `NEO4J_HTTP_PORT` | `7474` | Browser HTTP port |
| `NEO4J_BOLT_PORT` | `7687` | Bolt protocol port |
| `NEO4J_HEAP_INITIAL` | `512m` | Initial heap size |
| `NEO4J_HEAP_MAX` | `1G` | Maximum heap size |
| `NEO4J_PAGECACHE` | `512m` | Page cache size |

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (DELETES ALL DATA)
docker compose down -v

# Restart Neo4j
docker compose restart neo4j

# View real-time logs
docker compose logs -f neo4j

# Execute Cypher query
docker compose exec neo4j cypher-shell -u neo4j -p inquiry_dev_2024 "MATCH (n) RETURN count(n)"

# Open Cypher shell
docker compose exec neo4j cypher-shell -u neo4j -p inquiry_dev_2024
```

## APOC Plugin

The APOC (Awesome Procedures on Cypher) plugin is pre-installed and configured. Verify installation:

```cypher
CALL apoc.help('apoc')
```

Common APOC procedures:

```cypher
// Create UUID
RETURN apoc.create.uuid() AS uuid

// Load JSON from URL
CALL apoc.load.json('https://api.example.com/data') YIELD value

// Export graph to JSON
CALL apoc.export.json.all('export.json', {})

// Batch processing
CALL apoc.periodic.iterate(
  'MATCH (n:OldLabel) RETURN n',
  'SET n:NewLabel',
  {batchSize: 1000}
)
```

## Data Persistence

Data is stored in Docker volumes:

| Volume | Purpose |
|--------|---------|
| `inquiry-neo4j-data` | Database files |
| `inquiry-neo4j-logs` | Query and debug logs |
| `inquiry-neo4j-import` | Import directory for CSV/JSON files |
| `inquiry-neo4j-plugins` | Additional plugins |

### Backup Data

```bash
# Create backup
docker compose exec neo4j neo4j-admin database dump neo4j --to-path=/data/backups

# Copy backup to host
docker cp inquiry-neo4j:/data/backups ./backups
```

### Restore Data

```bash
# Copy backup to container
docker cp ./backups inquiry-neo4j:/data/backups

# Restore (requires database to be stopped)
docker compose exec neo4j neo4j-admin database load neo4j --from-path=/data/backups --overwrite-destination
```

## Importing Data

Place files in the import directory:

```bash
# Copy file to import volume
docker cp ./data.csv inquiry-neo4j:/var/lib/neo4j/import/

# Then in Cypher shell:
LOAD CSV WITH HEADERS FROM 'file:///data.csv' AS row
CREATE (:Node {id: row.id, name: row.name})
```

## Connecting from Application

### Environment Variables

Set these in your application's `.env`:

```bash
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=inquiry_dev_2024
NEO4J_DATABASE=neo4j
```

### TypeScript Example

```typescript
import { getNeo4jClient } from 'inquiry/graph';

const client = getNeo4jClient();
await client.connectFromEnv();

const result = await client.query('MATCH (n) RETURN count(n) as count');
console.log('Node count:', result.single()?.count);

await client.close();
```

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker compose logs neo4j

# Verify ports aren't in use
netstat -an | grep 7474
netstat -an | grep 7687
```

### Out of memory

Increase heap size in `.env`:

```bash
NEO4J_HEAP_MAX=2G
NEO4J_PAGECACHE=1G
```

Then restart:

```bash
docker compose down && docker compose up -d
```

### Reset everything

```bash
# Remove containers and volumes
docker compose down -v

# Remove images
docker rmi neo4j:5.15.0-community

# Start fresh
docker compose up -d
```

### Permission issues on Linux

```bash
# Fix volume permissions
sudo chown -R 7474:7474 /var/lib/docker/volumes/inquiry-neo4j-*
```

## Health Check

The container includes a health check. Verify status:

```bash
docker compose ps
# Should show "healthy" in STATUS column

# Or check directly
docker inspect inquiry-neo4j --format='{{.State.Health.Status}}'
```

## Production Considerations

This setup is for **local development only**. For production:

- Use Neo4j Enterprise Edition or Aura
- Configure proper authentication and SSL/TLS
- Set up clustering for high availability
- Use external volume storage
- Configure proper backup strategies
- Monitor with Neo4j Ops Manager
