# Dynamic Web Service - Node.js API

A complete metadata-driven REST API for dynamic entity management, built with NestJS. This is the Node.js version of your .NET DynamicWebService backend.

## ✨ Features

✅ **Metadata Management** - Create/read/update/delete entity definitions and fields  
✅ **Dynamic CRUD** - Perform CRUD operations on any entity without coding  
✅ **Lookup Data** - Dropdown/reference data for foreign keys  
✅ **Field Validation** - Automatic validation based on field definitions  
✅ **Soft Delete** - Logical deletion of records and entities  
✅ **Comprehensive Logging** - Full operation tracking with Winston  
✅ **Swagger Documentation** - Auto-generated API docs  
✅ **Docker Ready** - Production-ready containerization  
✅ **Type-Safe** - Full TypeScript support  

## 🏗️ Architecture

```
Dynamic-Service-Nodejs-Api/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   ├── core/
│   │   ├── database/
│   │   │   ├── prisma.service.ts   # Prisma client wrapper
│   │   │   └── prisma.module.ts    # Database module
│   │   ├── logger/
│   │   │   └── logger.service.ts   # Winston logging
│   │   └── filters/
│   │       └── http-exception.filter.ts  # Global exception handler
│   ├── common/
│   │   └── dtos/
│   │       ├── metadata.dto.ts     # Entity & field DTOs
│   │       └── dynamic.dto.ts      # Record & lookup DTOs
│   └── modules/
│       ├── metadata/
│       │   ├── metadata.service.ts    # Entity/field management
│       │   ├── metadata.controller.ts # API endpoints
│       │   └── metadata.module.ts     # Module configuration
│       ├── dynamic/
│       │   ├── dynamic.service.ts     # CRUD engine
│       │   ├── dynamic.controller.ts  # Record endpoints
│       │   └── dynamic.module.ts
│       ├── lookup/
│       │   ├── lookup.service.ts      # Dropdown data
│       │   ├── lookup.controller.ts   # Lookup endpoints
│       │   └── lookup.module.ts
│       └── health/
│           ├── health.service.ts      # Health checks
│           ├── health.controller.ts
│           └── health.module.ts
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.ts                      # Seed script (optional)
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MySQL 8.0+
- Docker (optional)

### Local Development

1. **Clone and install**
```bash
cd Dynamic-Service-Nodejs-Api
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Setup database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed data (optional)
npm run db:seed
```

4. **Start development server**
```bash
npm run start:dev
```

Server runs on `http://localhost:3000`  
Swagger docs available at `http://localhost:3000/swagger`

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## 📚 API Endpoints

### Metadata Management

```
GET    /api/metadata/entities              - List all entities
POST   /api/metadata/entities              - Create entity
GET    /api/metadata/entities/:id          - Get entity by ID
PUT    /api/metadata/entities/:id          - Update entity
DELETE /api/metadata/entities/:id          - Delete entity

GET    /api/metadata/entities/:id/fields   - Get entity fields
POST   /api/metadata/fields                - Create field
PUT    /api/metadata/fields/:id            - Update field
DELETE /api/metadata/fields/:id            - Delete field
```

### Dynamic CRUD

```
GET    /api/dynamic/entities                  - List available entities
GET    /api/dynamic/metadata/:entity          - Get entity metadata
GET    /api/dynamic/:entity                   - List records (paginated)
GET    /api/dynamic/:entity/:id               - Get record by ID
POST   /api/dynamic/:entity                   - Create record
PUT    /api/dynamic/:entity/:id               - Update record
DELETE /api/dynamic/:entity/:id               - Delete record
```

### Lookup Data

```
GET    /api/lookup/:entity                  - Get dropdown data for entity
GET    /api/lookup/health                   - Lookup service health
```

### System

```
GET    /api/health                          - System health check
```

## 📝 Example Usage

### Create Entity Definition

```bash
curl -X POST http://localhost:3000/api/metadata/entities \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "Customer",
    "displayName": "Customers",
    "tableName": "Customers",
    "description": "Customer management"
  }'
```

Response:
```json
{
  "id": 1,
  "entityName": "Customer",
  "displayName": "Customers",
  "tableName": "Customers",
  "description": "Customer management",
  "isDeleted": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Add Field to Entity

```bash
curl -X POST http://localhost:3000/api/metadata/fields \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": 1,
    "fieldName": "firstName",
    "displayName": "First Name",
    "fieldType": "string",
    "isRequired": true,
    "maxLength": 100,
    "displayOrder": 1
  }'
```

### Create Record

```bash
curl -X POST http://localhost:3000/api/dynamic/Customer \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'
```

Response:
```json
{
  "id": "clhxyz123abc",
  "entityId": 1,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### Get Lookup Data

```bash
curl http://localhost:3000/api/lookup/Customer
```

Response:
```json
{
  "entityName": "Customer",
  "values": [
    { "id": "clhxyz123abc", "displayText": "John Doe" },
    { "id": "clhxyz456def", "displayText": "Jane Smith" }
  ],
  "count": 2
}
```

### List Records with Pagination

```bash
curl "http://localhost:3000/api/dynamic/Customer?page=1&pageSize=10"
```

Response:
```json
{
  "data": [
    {
      "id": "clhxyz123abc",
      "entityId": 1,
      "data": { "firstName": "John", "lastName": "Doe", ... },
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

## 🔧 Field Types

Supported field types for validation:

| Type | Description | Validation |
|------|-------------|-----------|
| `string` | Text field | maxLength, minLength, pattern (regex) |
| `integer` | Whole number | Must be integer |
| `decimal` | Decimal number | Must be number |
| `datetime` | Date and time | Must be valid ISO date |
| `boolean` | True/False | Must be boolean |
| `enum` | Select from options | Must match defined options |

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:cov
```

## 📊 Database Schema

Key tables:
- **entity_definitions** - Entity metadata (table structures)
- **field_definitions** - Field metadata (column structures)
- **dynamic_records** - Actual data records in JSON
- **audit_logs** - Change audit trail

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/dynamic_webservice

# Server
NODE_ENV=development
PORT=3000

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:4200
```

## 📋 Validation & Error Handling

### Automatic Validation
- Required field checks
- Type validation
- String length validation
- Pattern matching (regex)
- Enum option validation
- Unique field validation (via database constraints)

### Error Responses

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "firstName: should not be empty",
    "email: Field format is invalid"
  ]
}
```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm run start:prod
```

### Docker Production
```bash
# Build image
docker build -t dynamic-webservice-api:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@db:3306/db" \
  --name dynamic-api \
  dynamic-webservice-api:latest
```

## 📖 Swagger Documentation

Access interactive API documentation:
- Development: `http://localhost:3000/swagger`
- Production: `https://your-domain.com/api/swagger`

All endpoints, DTOs, and responses are documented with examples.

## 🔄 Comparison with .NET Backend

| Feature | .NET | Node.js |
|---------|------|---------|
| Framework | ASP.NET Core 9 | NestJS 10 |
| ORM | Entity Framework | Prisma |
| Language | C# | TypeScript |
| API Port | 5001 | 3000 |
| Database | SQL Server | MySQL |
| Endpoints | ✅ Same | ✅ Same |
| Features | ✅ Complete | ✅ Complete |

**All endpoints match the .NET version, making migration seamless!**

## 📝 Logging

Logs are written to:
- **Console** - Development output with colors
- **logs/error.log** - Error logs only
- **logs/combined.log** - All logs combined

Log levels: debug, info, warn, error, verbose

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Open Pull Request

## 📄 License

MIT

## 💬 Support

For issues and questions:
1. Check Swagger documentation at `/swagger`
2. Review logs in `logs/` directory
3. Check health status at `/api/health`

---

**Ready to use!** Start with:
```bash
npm install && npm run prisma:migrate && npm run start:dev
```

Visit `http://localhost:3000/swagger` to see all endpoints.
