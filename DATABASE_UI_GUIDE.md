# Database Management UI Guide

## Overview
This guide explains how to access MySQL and MongoDB through browser-based management interfaces.

## 🌐 Browser Interfaces

### phpMyAdmin - MySQL Management
**URL:** [http://localhost:8001](http://localhost:8001)

**Login Credentials:**
- **Username:** `root`
- **Password:** `rootpassword`
- **Server:** `mysql`

**Features:**
- View/edit MySQL databases
- Run SQL queries
- Manage tables, columns, indexes
- Export/import data
- Create backups
- Visual table editor

**Common Tasks:**
1. Click database name to view tables
2. Click table to view/edit data
3. Use SQL tab to run custom queries
4. Export data: Right-click table → Export

---

### MongoDB Express - MongoDB Management
**URL:** [http://localhost:8081](http://localhost:8081)

**Login Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

**Features:**
- View MongoDB databases and collections
- Browse/edit documents
- Run MongoDB queries
- View collection statistics
- Delete/create collections
- JSON editor for documents

**Common Tasks:**
1. Left sidebar shows databases
2. Click database to expand collections
3. Click collection to view documents
4. Click document to edit
5. "New Document" button to add records

---

## 🚀 Startup Instructions

### 1. Start All Services (including UI tools)
```bash
docker-compose up -d
```

This will start:
- ✅ MySQL (port 3306)
- ✅ MongoDB (port 27017)
- ✅ Node.js API (port 3000 or 8000)
- ✅ phpMyAdmin (port 8001)
- ✅ MongoDB Express (port 8081)

### 2. Start Only Databases with UI
```bash
docker-compose up -d mysql mongodb phpmyadmin mongo-express
```

### 3. Verify Services are Running
```bash
docker-compose ps
```

Expected output:
```
NAME                              STATUS          PORTS
dynamic-webservice-mysql          Up (healthy)    0.0.0.0:3306->3306/tcp
dynamic-webservice-mongodb        Up (healthy)    0.0.0.0:27017->27017/tcp
dynamic-webservice-phpmyadmin     Up              0.0.0.0:8001->80/tcp
dynamic-webservice-mongo-express  Up              0.0.0.0:8081->8081/tcp
dynamic-webservice-api            Up              0.0.0.0:3000->3000/tcp
```

---

## 📊 Using phpMyAdmin (MySQL)

### Access MySQL Data
1. Open [http://localhost:8001](http://localhost:8001)
2. Login with `root` / `rootpassword`
3. Select `dynamic_webservice` database
4. Browse tables: `entity_definitions`, `field_definitions`, `dynamic_records`

### View Table Data
1. Click on any table name
2. You'll see all records
3. Click on a row to edit
4. Click pencil icon to modify

### Run SQL Queries
1. Click **SQL** tab at top
2. Enter your SQL query
3. Click **Go** to execute

**Example Queries:**
```sql
-- View all customers
SELECT * FROM dynamic_records WHERE entity_id = 1;

-- Count total records
SELECT COUNT(*) FROM dynamic_records;

-- View entity definitions
SELECT * FROM entity_definitions;

-- View field definitions
SELECT * FROM field_definitions;
```

### Export Data
1. Right-click on table name
2. Select **Export**
3. Choose format (SQL, CSV, JSON, etc.)
4. Click **Go**

### Import Data
1. Click on database name
2. Click **Import** tab
3. Select file to import
4. Choose format
5. Click **Go**

---

## 📈 Using MongoDB Express (MongoDB)

### Access MongoDB Data
1. Open [http://localhost:8081](http://localhost:8081)
2. Login with `admin` / `admin123`
3. Expand `dynamic_db` in left sidebar
4. Click any collection to view documents

### View Collections
Available collections:
- `customers` - Customer records
- `products` - Product records
- `orders` - Order records (if created)

### Browse Documents
1. Click collection name
2. See all documents in JSON format
3. Click **View** on any document to see full details

### Edit Document
1. Click document in collection
2. JSON appears in editor
3. Modify as needed
4. Click **Save**

### Create New Document
1. Click collection name
2. Click **New Document** button
3. Enter JSON data
4. Click **Save**

**Example JSON:**
```json
{
  "firstName": "Charlie",
  "lastName": "Brown",
  "email": "charlie.brown@example.com",
  "phone": "+1-555-0104",
  "status": "active"
}
```

### Delete Document
1. Click on document
2. Click **Delete** button
3. Confirm deletion

### View Statistics
- Click collection name
- See document count and size
- View index information

---

## 🔄 API Data in Databases

### MySQL Tables

**entity_definitions**
```
id | entityName | displayName | tableName | description
```

**field_definitions**
```
id | entityId | fieldName | displayName | fieldType | isRequired | options
```

**dynamic_records**
```
id | entityId | data (JSON) | createdAt | updatedAt | isDeleted
```

### MongoDB Collections

**dynamic_db.customers**
```json
{
  "_id": "...",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-0100",
  "status": "active"
}
```

**dynamic_db.products**
```json
{
  "_id": "...",
  "productName": "Laptop",
  "price": 999.99,
  "quantity": 50
}
```

---

## 🛠️ Common Tasks

### Task 1: Add a New Customer via UI

**Using API (Recommended):**
```bash
curl -X POST http://localhost:8000/api/dynamic/Customer \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "David",
    "lastName": "Smith",
    "email": "david@example.com",
    "phone": "+1-555-0105",
    "status": "active"
  }'
```

**Using MongoDB Express:**
1. Go to [http://localhost:8081](http://localhost:8081)
2. Navigate to `dynamic_db` → `customers`
3. Click **New Document**
4. Paste the JSON above
5. Click **Save**

### Task 2: Query Customers with Status = Active

**MySQL (phpMyAdmin):**
```sql
SELECT * FROM dynamic_records 
WHERE entity_id = 1 
AND JSON_EXTRACT(data, '$.status') = 'active';
```

**MongoDB (Express or CLI):**
```bash
# In MongoDB Express: Use the filter field
db.customers.find({status: "active"})
```

### Task 3: Update Customer Email

**Using MongoDB Express:**
1. Click on customer document
2. Change email value
3. Click **Save**

**Using API:**
```bash
curl -X PUT http://localhost:8000/api/dynamic/Customer/{id} \
  -H "Content-Type: application/json" \
  -d '{"email": "newemail@example.com"}'
```

### Task 4: Delete a Product

**Using MongoDB Express:**
1. Navigate to `dynamic_db` → `products`
2. Click on product document
3. Click **Delete**
4. Confirm

**Using API:**
```bash
curl -X DELETE http://localhost:8000/api/dynamic/Product/{id}
```

---

## 🐛 Troubleshooting

### Can't Access phpMyAdmin
```bash
# Check if service is running
docker ps | grep phpmyadmin

# Restart service
docker-compose restart phpmyadmin

# View logs
docker-compose logs phpmyadmin
```

### Can't Access MongoDB Express
```bash
# Check if service is running
docker ps | grep mongo-express

# Restart service
docker-compose restart mongo-express

# View logs
docker-compose logs mongo-express
```

### Connection Refused
```bash
# Make sure all services are started
docker-compose up -d mysql mongodb phpmyadmin mongo-express

# Wait a few seconds for services to be ready
# Try accessing after 10 seconds
```

### Login Failed
- **phpMyAdmin:** Use `root` / `rootpassword`
- **MongoDB Express:** Use `admin` / `admin123`
- Check environment variables in `docker-compose.yml`

### Port Already in Use
```bash
# Kill process on port 8001 (phpMyAdmin)
sudo lsof -i :8001
sudo kill -9 <PID>

# Kill process on port 8081 (MongoDB Express)
sudo lsof -i :8081
sudo kill -9 <PID>
```

---

## 📱 Mobile/Remote Access

### Access from Another Machine on Network
Replace `localhost` with your machine IP:

**phpMyAdmin:**
```
http://<YOUR_IP>:8001
```

**MongoDB Express:**
```
http://<YOUR_IP>:8081
```

**Find your IP:**
```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig
```

---

## 🔐 Security Notes

### Development Only
These interfaces are suitable for **development only**. For production:
- Use strong passwords
- Enable HTTPS
- Restrict access with firewall
- Use VPN for remote access

### Change Default Passwords
Edit `docker-compose.yml`:
```yaml
phpmyadmin:
  environment:
    PMA_PASSWORD: your_new_password

mongo-express:
  environment:
    ME_CONFIG_BASICAUTH_PASSWORD: your_new_password
```

Then restart services:
```bash
docker-compose down
docker-compose up -d
```

---

## 🔗 Quick Links

| Tool | URL | Username | Password |
|------|-----|----------|----------|
| phpMyAdmin (MySQL) | http://localhost:8001 | root | rootpassword |
| MongoDB Express | http://localhost:8081 | admin | admin123 |
| API | http://localhost:8000 | - | - |
| Swagger Docs | http://localhost:8000/swagger | - | - |

---

## 📚 Additional Resources

- [phpMyAdmin Documentation](https://www.phpmyadmin.net/)
- [MongoDB Express GitHub](https://github.com/mongo-express/mongo-express)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**Last Updated:** November 2025
