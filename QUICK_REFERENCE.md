# Dynamic Web Service - Node.js Quick Reference

## 🚀 One-Command Startup

### Local Development
```bash
npm install && npm run prisma:migrate && npm run start:dev
```

### Docker (All-in-One)
```bash
docker-compose up -d
```

---

## 📍 Key URLs

| Resource | URL |
|----------|-----|
| **API Base** | `http://localhost:3000/api` |
| **Swagger Docs** | `http://localhost:3000/swagger` |
| **Health Check** | `http://localhost:3000/api/health` |
| **Prisma Studio** | `http://localhost:5555` (after `npm run prisma:studio`) |

---

## 📚 Essential Endpoints

### Metadata
```
GET    /metadata/entities              # List entities
POST   /metadata/entities              # Create entity
GET    /metadata/entities/:id          # Get entity
PUT    /metadata/entities/:id          # Update entity
DELETE /metadata/entities/:id          # Delete entity
```

### Records
```
GET    /dynamic/:entity                # List records
POST   /dynamic/:entity                # Create record
GET    /dynamic/:entity/:id            # Get record
PUT    /dynamic/:entity/:id            # Update record
DELETE /dynamic/:entity/:id            # Delete record
```

### Lookup
```
GET    /lookup/:entity                 # Get dropdown data
```

---

## 🔧 Most Used Commands

```bash
# Start development server (with auto-reload)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# View database with GUI
npm run prisma:studio

# Seed sample data
npm run db:seed

# Reset entire database
npm run db:reset

# Run tests
npm run test

# Format code
npm run format

# Lint code
npm run lint
```

---

## 📋 Quick Setup Checklist

- [ ] `npm install` - Install dependencies
- [ ] `cp .env.example .env` - Create environment file
- [ ] Edit `.env` - Add MySQL credentials
- [ ] `npm run prisma:migrate` - Create database tables
- [ ] `npm run db:seed` - Add sample data (optional)
- [ ] `npm run start:dev` - Start development server
- [ ] Visit `http://localhost:3000/swagger` - Test API

---

## 🗄️ Database Info

| Table | Purpose |
|-------|---------|
| `entity_definitions` | Entity metadata (what tables exist) |
| `field_definitions` | Field metadata (what columns exist) |
| `dynamic_records` | Actual records (data storage) |
| `audit_logs` | Change history |

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Rebuild image
docker-compose build --no-cache

# Access MySQL in container
docker exec -it dynamic-webservice-mysql mysql -u appuser -p

# View running containers
docker ps
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/main.ts` | Application entry point |
| `package.json` | Dependencies & scripts |
| `.env` | Environment variables |
| `prisma/schema.prisma` | Database schema |
| `API_TESTS.http` | API test examples |
| `README.md` | Full documentation |
| `SETUP_GUIDE.md` | Setup instructions |

---

## 🔐 Environment Variables

```env
DATABASE_URL=mysql://user:pass@localhost:3306/dynamic_webservice
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3001,http://localhost:4200
```

---

## 🎯 Common Tasks

### Create a New Entity Type
```bash
# 1. Use Swagger at http://localhost:3000/swagger
# 2. POST /metadata/entities with your entity details
# 3. POST /metadata/fields to add fields to entity
# 4. Now use POST /dynamic/{entity} to create records
```

### Test an API Endpoint
```bash
# Option 1: Use Swagger UI (http://localhost:3000/swagger)
# Option 2: Use REST Client in VS Code (API_TESTS.http)
# Option 3: Use curl
curl http://localhost:3000/api/metadata/entities
```

### Debug Database Issues
```bash
# View data with Prisma Studio
npm run prisma:studio

# Or access MySQL directly
mysql -u appuser -p dynamic_webservice
```

### Add Sample Data
```bash
npm run db:seed
```

### Reset Everything
```bash
npm run db:reset
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Change `PORT` in `.env` |
| MySQL connection fails | Check MySQL is running: `mysql -u root -p` |
| Tables don't exist | Run `npm run prisma:migrate` |
| CORS errors | Update `CORS_ORIGIN` in `.env` |
| Missing dependencies | Run `npm install` again |
| Type errors in IDE | Run `npm run prisma:generate` |

---

## 🧪 Test Examples

### Create Entity
```bash
curl -X POST http://localhost:3000/api/metadata/entities \
  -H "Content-Type: application/json" \
  -d '{"entityName":"Test","displayName":"Test"}'
```

### Create Record
```bash
curl -X POST http://localhost:3000/api/dynamic/Test \
  -H "Content-Type: application/json" \
  -d '{"field1":"value1"}'
```

### Get Records
```bash
curl http://localhost:3000/api/dynamic/Test
```

### Get Dropdown Data
```bash
curl http://localhost:3000/api/lookup/Test
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

---

## 📊 Field Types

- `string` - Text (with maxLength, minLength, pattern validation)
- `integer` - Whole numbers
- `decimal` - Decimal numbers
- `datetime` - Dates and times (ISO format)
- `boolean` - True/False
- `enum` - Select from predefined options

---

## 🔄 Frontend Integration Example

```javascript
// React example
import { useEffect, useState } from 'react';

export function FormBuilder() {
  const [entities, setEntities] = useState([]);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    // Load available entities
    fetch('http://localhost:3000/api/metadata/entities')
      .then(r => r.json())
      .then(setEntities);
  }, []);

  const handleEntitySelect = (entityId) => {
    // Load entity fields
    fetch(`http://localhost:3000/api/metadata/entities/${entityId}/fields`)
      .then(r => r.json())
      .then(setFields);
  };

  return (
    <div>
      <select onChange={e => handleEntitySelect(e.target.value)}>
        {entities.map(e => <option value={e.id}>{e.displayName}</option>)}
      </select>
      {/* Render form fields */}
    </div>
  );
}
```

---

## 📞 Getting Help

1. **Check Status** - `curl http://localhost:3000/api/health`
2. **Read Docs** - `http://localhost:3000/swagger`
3. **View Logs** - `tail -f logs/combined.log`
4. **Check DB** - `npm run prisma:studio`
5. **Read Files** - `README.md`, `SETUP_GUIDE.md`

---

## ✅ You're All Set!

Everything is ready to go:
- ✅ 100% compatible with .NET backend
- ✅ All endpoints implemented
- ✅ Database schema ready
- ✅ Swagger documentation active
- ✅ Docker setup included
- ✅ Sample data included

### Start developing:
```bash
npm run start:dev
```

Visit: `http://localhost:3000/swagger`

---

**Questions? See README.md or SETUP_GUIDE.md for detailed information.**
