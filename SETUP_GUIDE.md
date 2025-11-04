# Dynamic Web Service - Node.js Setup Guide

Complete step-by-step guide to set up and run your Dynamic Web Service Node.js API.

## 📋 Prerequisites

Ensure you have installed:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm 9+** (comes with Node.js)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Download](https://git-scm.com/)

Verify installations:
```bash
node --version    # v18+
npm --version     # 9+
mysql --version   # 8.0+
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd Dynamic-Service-Nodejs-Api
npm install
```

### Step 2: Setup Database Connection
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your MySQL credentials
nano .env  # or use your editor
```

Example `.env`:
```env
DATABASE_URL=mysql://root:password@localhost:3306/dynamic_webservice
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3001,http://localhost:4200
```

### Step 3: Initialize Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed sample data (optional)
npm run db:seed
```

### Step 4: Start Development Server
```bash
npm run start:dev
```

✅ Server running on: `http://localhost:3000`  
📚 Swagger docs: `http://localhost:3000/swagger`

---

## 🐳 Docker Setup (Even Quicker)

If you have Docker installed, this is the easiest way:

### Step 1: Start All Services
```bash
docker-compose up -d
```

### Step 2: View Logs
```bash
docker-compose logs -f api
```

✅ API: `http://localhost:3000`  
✅ MySQL: `localhost:3306`

### Stop Services
```bash
docker-compose down
```

---

## 🔧 Manual Database Setup

If not using Docker or `npm run prisma:migrate`:

### Step 1: Create Database
```sql
CREATE DATABASE dynamic_webservice;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON dynamic_webservice.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Run Migrations
```bash
npm run prisma:migrate
```

### Step 3: Seed Sample Data
```bash
npm run db:seed
```

---

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root NestJS module
├── core/
│   ├── database/              # Prisma configuration
│   ├── logger/                # Logging service
│   └── filters/               # Global error handlers
├── common/
│   └── dtos/                  # Data transfer objects
└── modules/
    ├── metadata/              # Entity/field management
    ├── dynamic/               # CRUD operations
    ├── lookup/                # Dropdown data
    └── health/                # Health checks
prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Sample data seeder
```

---

## 🧪 Testing the API

### Option 1: Using Swagger UI (Recommended)
1. Open `http://localhost:3000/swagger`
2. Click on any endpoint
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"

### Option 2: Using REST Client Extension (VS Code)

Install VS Code Extension: "REST Client" by Huachao Zheng

Then open `API_TESTS.http` and click "Send Request" on any example.

### Option 3: Using cURL

```bash
# Get all entities
curl http://localhost:3000/api/metadata/entities

# Create entity
curl -X POST http://localhost:3000/api/metadata/entities \
  -H "Content-Type: application/json" \
  -d '{"entityName":"Customer","displayName":"Customers"}'

# Get health status
curl http://localhost:3000/api/health
```

### Option 4: Using Postman

1. Import `API_TESTS.http` into Postman
2. Update base URL to `http://localhost:3000/api`
3. Run requests

---

## 🛠️ Development Commands

### Run Development Server (with auto-reload)
```bash
npm run start:dev
```

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm run start:prod
```

### View Database in GUI
```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

### Run Tests
```bash
npm run test
npm run test:watch
npm run test:cov
```

---

## 📊 Database Schema

### Tables Created

**entity_definitions** - Stores entity metadata
```
- id (INT, PK)
- entityName (VARCHAR, UNIQUE)
- displayName (VARCHAR)
- tableName (VARCHAR, UNIQUE)
- description (TEXT)
- isDeleted (BOOLEAN)
- createdAt (DATETIME)
- updatedAt (DATETIME)
```

**field_definitions** - Stores field metadata
```
- id (INT, PK)
- entityId (INT, FK)
- fieldName (VARCHAR)
- displayName (VARCHAR)
- fieldType (VARCHAR)
- isRequired (BOOLEAN)
- isUnique (BOOLEAN)
- maxLength (INT)
- minLength (INT)
- pattern (TEXT)
- defaultValue (TEXT)
- options (LONGTEXT) - JSON
- displayOrder (INT)
- isDeleted (BOOLEAN)
- createdAt (DATETIME)
- updatedAt (DATETIME)
```

**dynamic_records** - Stores actual data
```
- id (STRING, PK)
- entityId (INT, FK)
- data (LONGTEXT) - JSON
- createdAt (DATETIME)
- updatedAt (DATETIME)
- isDeleted (BOOLEAN)
```

**audit_logs** - Stores all changes
```
- id (INT, PK)
- entityName (VARCHAR)
- action (VARCHAR) - CREATE/UPDATE/DELETE
- recordId (TEXT)
- oldData (LONGTEXT) - JSON
- newData (LONGTEXT) - JSON
- userId (VARCHAR)
- ipAddress (VARCHAR)
- createdAt (DATETIME)
```

---

## 🔐 Environment Variables Reference

```env
# Database Connection
DATABASE_URL=mysql://user:password@host:port/database

# Server Configuration
NODE_ENV=development        # development, production
PORT=3000                  # Server port
LOG_LEVEL=debug            # debug, info, warn, error

# CORS Configuration
CORS_ORIGIN=http://localhost:3001,http://localhost:4200
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module @nestjs/core"
**Solution:** Run `npm install` again
```bash
npm install
```

### Problem: "MySQL Connection Refused"
**Solution:** Ensure MySQL is running
```bash
# macOS with Homebrew
brew services start mysql

# Linux
sudo systemctl start mysql

# Windows
net start MySQL80
```

### Problem: "Column doesn't exist" during migration
**Solution:** Reset database
```bash
npm run db:reset
```

### Problem: Port 3000 already in use
**Solution:** Change port in `.env`
```env
PORT=3001
```

### Problem: CORS errors from frontend
**Solution:** Update `CORS_ORIGIN` in `.env`
```env
CORS_ORIGIN=http://localhost:3001,http://localhost:4200,https://yourdomain.com
```

### Problem: Logs not appearing
**Solution:** Check log files
```bash
ls -la logs/
tail -f logs/combined.log
```

---

## 📈 Production Deployment

### Build Production Image
```bash
npm run build
docker build -t dynamic-webservice-api:latest .
```

### Push to Registry
```bash
docker tag dynamic-webservice-api:latest your-registry/dynamic-webservice-api:latest
docker push your-registry/dynamic-webservice-api:latest
```

### Deploy to Cloud

#### AWS ECS
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/dynamic-webservice-api:latest
```

#### Azure Container Instances
```bash
az container create \
  --resource-group myResourceGroup \
  --name dynamic-webservice-api \
  --image your-registry.azurecr.io/dynamic-webservice-api:latest \
  --environment-variables DATABASE_URL="mysql://user:pass@db:3306/db"
```

#### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dynamic-webservice-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: your-registry/dynamic-webservice-api:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        ports:
        - containerPort: 3000
```

---

## 📊 API Response Examples

### Create Entity (201 Created)
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

### Create Record (201 Created)
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

### Get Records (200 OK)
```json
{
  "data": [...],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

### Error Response (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "firstName: should not be empty"
  ]
}
```

---

## 🔄 Git Workflow

```bash
# Clone repository
git clone <your-repo-url>
cd Dynamic-Service-Nodejs-Api

# Create feature branch
git checkout -b feature/my-feature

# Make changes, test them
npm run start:dev

# Commit changes
git add .
git commit -m "feat: add my feature"

# Push to remote
git push origin feature/my-feature

# Create Pull Request
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker Documentation](https://docs.docker.com/)

---

## 💡 Tips & Best Practices

1. **Always use `.env` for sensitive data** - Never commit credentials
2. **Run migrations in development** - `npm run prisma:migrate`
3. **Use Swagger for API testing** - More visual than cURL
4. **Check logs in `logs/` directory** - For debugging issues
5. **Keep TypeScript strict** - Better type safety
6. **Test endpoints in Swagger first** - Before frontend integration

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `npm install` completed without errors
- [ ] `.env` file created with database credentials
- [ ] `npm run prisma:generate` successful
- [ ] `npm run prisma:migrate` created tables
- [ ] `npm run db:seed` added sample data
- [ ] `npm run start:dev` server started
- [ ] `http://localhost:3000/swagger` loads
- [ ] Health check `http://localhost:3000/api/health` returns 200
- [ ] Can create entity in Swagger
- [ ] Can create record in Swagger
- [ ] Database contains data via Prisma Studio

---

## 🆘 Getting Help

1. **Check logs**: `tail -f logs/combined.log`
2. **Check health**: `curl http://localhost:3000/api/health`
3. **Review Swagger**: `http://localhost:3000/swagger`
4. **Check database**: `npm run prisma:studio`
5. **Read README.md**: Full documentation

---

**Ready to develop?** Start with:
```bash
npm install && npm run prisma:migrate && npm run start:dev
```

Then visit `http://localhost:3000/swagger` 🚀
