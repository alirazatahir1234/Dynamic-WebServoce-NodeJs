# Phase 2: Hybrid Database Implementation

## Overview

The Dynamic Web Service now supports a **hybrid database approach** combining **MySQL** (structured metadata) and **MongoDB** (flexible record storage).

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DynamicService                          │
├─────────────────────────────────────────────────────────┤
│                  DatabaseService                         │
│  (Routes requests based on entity configuration)        │
├──────────────────────────┬──────────────────────────────┤
│   MySQLAdapter           │   MongoDBAdapter             │
│  (Prisma ORM)            │  (MongoDB Driver)            │
├──────────────────────────┼──────────────────────────────┤
│   MySQL (Primary)        │   MongoDB (Flexible)         │
│  • Metadata              │  • Dynamic Records           │
│  • Entity Definitions    │  • Flexible Schema           │
│  • Field Definitions     │  • Audit Logs (Optional)     │
└──────────────────────────┴──────────────────────────────┘
```

## Configuration

### Environment Variables

```bash
# Default database type (mysql | mongodb)
DATABASE_TYPE=mysql

# MySQL Configuration
DATABASE_URL=mysql://root:password@localhost:3306/dynamic_db

# MongoDB Configuration
MONGODB_URL=mongodb://admin:password@localhost:27017
MONGODB_DATABASE=dynamic_db

# Entity-Specific Routing (Optional)
# Route specific entities to MongoDB instead of MySQL
ROUTING_CUSTOMER=mongodb
ROUTING_ORDER=mongodb
ROUTING_PRODUCT=mongodb
```

### Docker Compose

Both MySQL and MongoDB are included in `docker-compose.yml`:

```yaml
services:
  mysql:
    image: mysql:8.0
    ports: ["3306:3306"]
    # ...

  mongodb:
    image: mongo:7.0
    ports: ["27017:27017"]
    # ...
```

## Usage

### Default Behavior (All Entities → MySQL)

By default, all entity records are stored in MySQL:

```typescript
// Records stored in MySQL
POST /api/dynamic/Customer
GET /api/dynamic/Customer
```

### Entity-Specific Routing (Selected Entities → MongoDB)

Configure specific entities to use MongoDB:

```bash
# Set environment variables
ROUTING_CUSTOMER=mongodb
ROUTING_ORDER=mongodb
```

Now these entities use MongoDB:

```typescript
// Customer records stored in MongoDB
POST /api/dynamic/Customer
GET /api/dynamic/Customer

// Order records stored in MongoDB  
POST /api/dynamic/Order
GET /api/dynamic/Order

// Product records still use MySQL (default)
POST /api/dynamic/Product
GET /api/dynamic/Product
```

## Code Structure

### Database Adapters

#### `database.adapter.ts`
Interface defining all database operations:
```typescript
interface IDatabaseAdapter {
  create(entityId: number, payload: any): Promise<DynamicRecordDto>;
  findMany(...): Promise<{ records: DynamicRecordDto[], total: number }>;
  findOne(...): Promise<DynamicRecordDto | null>;
  count(...): Promise<number>;
  update(...): Promise<DynamicRecordDto>;
  softDelete(...): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

#### `mysql.adapter.ts`
MySQL implementation using Prisma ORM

#### `mongodb.adapter.ts`
MongoDB implementation using MongoDB driver

#### `database.service.ts`
Orchestrates between adapters and routes based on configuration

### Core Services

#### `MongoDBService` (`src/core/database/mongodb.service.ts`)
- Manages MongoDB connection
- Provides collection access
- Handles connection lifecycle

### Modules

#### `DynamicModule`
Providers:
- `DatabaseService` - Main routing service
- `MySQLAdapter` - MySQL operations
- `MongoDBAdapter` - MongoDB operations

#### `CoreModule`
Includes:
- `PrismaModule` - MySQL/Prisma setup
- `MongoDBModule` - MongoDB setup
- `LoggerModule` - Logging

## Implementation Details

### MySQL Adapter (Prisma)

Stores records using Prisma with automatic JSON serialization:

```typescript
// In MySQL:
{
  id: "clh...",
  entityId: 1,
  data: "{\"firstName\":\"John\",\"email\":\"john@example.com\"}",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  isDeleted: false
}
```

### MongoDB Adapter

Stores records with native BSON document structure:

```typescript
// In MongoDB:
{
  _id: ObjectId("..."),
  entityId: 1,
  data: {
    firstName: "John",
    email: "john@example.com"
  },
  createdAt: ISODate("2024-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:30:00.000Z"),
  isDeleted: false
}
```

### Unified API Response

Both adapters return identical API responses:

```json
{
  "id": "clh...",
  "entityId": 1,
  "data": {
    "firstName": "John",
    "email": "john@example.com"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Health Checks

The API health endpoint now checks both databases:

```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "databases": {
    "mysql": true,
    "mongodb": true
  },
  "adapters": ["mysql", "mongodb"]
}
```

## Migration Guide

### Migrate Existing MySQL Data to MongoDB

Create a migration script:

```typescript
// scripts/migrate-to-mongodb.ts
async migrateRecords(entityName: string) {
  // 1. Fetch all records from MySQL
  const records = await this.databaseService.findMany(
    entityName,
    entityId,
    { pageSize: 1000 }
  );

  // 2. Update routing to MongoDB
  process.env.ROUTING_[ENTITYNAME] = 'mongodb';

  // 3. Insert into MongoDB
  for (const record of records.records) {
    await mongodbAdapter.create(record.entityId, record.data);
  }
}
```

### Rollback from MongoDB to MySQL

Simply remove or change the routing configuration:

```bash
# Remove or comment out
# ROUTING_CUSTOMER=mongodb

# All new records go to MySQL
```

## Best Practices

### When to Use MySQL
- ✅ Structured metadata entities
- ✅ Small, well-defined schemas
- ✅ ACID transaction requirements
- ✅ Complex joins and relationships

### When to Use MongoDB
- ✅ Flexible schema entities
- ✅ Large document storage
- ✅ Nested/hierarchical data
- ✅ High write throughput
- ✅ Horizontal scaling requirements

### Recommended Routing Strategy

```bash
# Metadata always in MySQL (unchanging)
# Use MySQL for: EntityDefinition, FieldDefinition, AuditLog

# Use MongoDB for: Customer, Order, Product, Invoice
ROUTING_CUSTOMER=mongodb
ROUTING_ORDER=mongodb
ROUTING_PRODUCT=mongodb
ROUTING_INVOICE=mongodb
```

## Performance Considerations

### MySQL Benefits
- Zero serialization overhead
- Relational integrity
- Complex queries
- **~10-50ms** average response

### MongoDB Benefits
- Native document storage
- Horizontal scaling
- High concurrency
- **~5-30ms** average response

### Recommended Benchmarks
- MySQL: 1000-5000 ops/sec per instance
- MongoDB: 2000-10000 ops/sec per instance

## Troubleshooting

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Ensure MongoDB is running: `docker-compose up mongodb`
2. Check `MONGODB_URL` environment variable
3. Verify MongoDB credentials

### Prisma Client Not Generated

```
Error: PrismaClient not found
```

**Solution:**
```bash
npm run prisma:generate
npm run build
```

### Mixed Database Responses

If responses show mixed adapters for same entity:

**Solution:**
1. Clear all data from both databases
2. Verify `ROUTING_*` environment variables
3. Rebuild and restart: `npm run build && docker-compose restart api`

## Future Enhancements

- [ ] PostgreSQL adapter
- [ ] Real-time sync between MySQL and MongoDB
- [ ] Automatic failover
- [ ] Read replicas
- [ ] Sharding support
- [ ] Data replication service
