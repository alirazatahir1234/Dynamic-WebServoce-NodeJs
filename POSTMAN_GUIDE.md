# Postman Collection Guide

## Overview
This is a complete Postman collection for the **Dynamic Web Service API** with all 18 endpoints organized by functionality.

## Quick Start

### 1. Import the Collection
- Open Postman
- Click **File** → **Import**
- Select `postman_collection.json`
- The collection will be imported with all requests

### 2. Configure Environment Variables
The collection uses a `base_url` variable set to `http://localhost:8000`

**To modify:**
1. Go to **Collections** → **Dynamic Web Service API**
2. Click **Variables** tab
3. Update `base_url` if running on a different host/port

### 3. Available Endpoints (18 Total)

#### Health & System (2)
- ✅ **GET** `/api/health` - Health check
- ✅ **GET** `/api/lookup/health` - Lookup service health

#### Metadata - Entities (5)
- ✅ **GET** `/api/metadata/entities` - Get all entities
- ✅ **GET** `/api/metadata/entities/:id` - Get entity by ID
- ✅ **POST** `/api/metadata/entities` - Create entity
- ✅ **PUT** `/api/metadata/entities/:id` - Update entity
- ✅ **DELETE** `/api/metadata/entities/:id` - Delete entity

#### Metadata - Fields (4)
- ✅ **GET** `/api/metadata/entities/:id/fields` - Get entity fields
- ✅ **POST** `/api/metadata/fields` - Create field
- ✅ **PUT** `/api/metadata/fields/:id` - Update field
- ✅ **DELETE** `/api/metadata/fields/:id` - Delete field

#### Dynamic Data - CRUD (7)
- ✅ **GET** `/api/dynamic/entities` - List all entities
- ✅ **GET** `/api/dynamic/metadata/:entity` - Get entity metadata
- ✅ **GET** `/api/dynamic/:entity` - Get all records (paginated)
- ✅ **GET** `/api/dynamic/:entity/:id` - Get single record
- ✅ **POST** `/api/dynamic/:entity` - Create record
- ✅ **PUT** `/api/dynamic/:entity/:id` - Update record
- ✅ **DELETE** `/api/dynamic/:entity/:id` - Delete record

#### Lookup Data (2)
- ✅ **GET** `/api/lookup/:entity` - Get lookup data
- ✅ **GET** `/api/lookup/Product` - Get Product lookup data

## Sample Requests

### Example 1: Get All Customers
```
GET {{base_url}}/api/dynamic/Customer?page=1&pageSize=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "cmhl2gmgi0001tqmhbccbo06j",
      "entityId": 1,
      "data": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0100",
        "status": "active"
      },
      "createdAt": "2025-11-04T21:13:54.354Z",
      "updatedAt": "2025-11-04T21:13:54.354Z",
      "isDeleted": false
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

### Example 2: Create a New Customer
```
POST {{base_url}}/api/dynamic/Customer
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Williams",
  "email": "alice.williams@example.com",
  "phone": "+1-555-0103",
  "status": "active"
}
```

### Example 3: Update a Customer
```
PUT {{base_url}}/api/dynamic/Customer/cmhl2gmgi0001tqmhbccbo06j
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe Updated",
  "email": "john.doe.updated@example.com",
  "status": "inactive"
}
```

### Example 4: Create Entity Definition
```
POST {{base_url}}/api/metadata/entities
Content-Type: application/json

{
  "entityName": "Order",
  "displayName": "Orders",
  "tableName": "Orders",
  "description": "Customer orders management"
}
```

### Example 5: Create Field Definition
```
POST {{base_url}}/api/metadata/fields
Content-Type: application/json

{
  "entityId": 1,
  "fieldName": "orderDate",
  "displayName": "Order Date",
  "fieldType": "datetime",
  "isRequired": true,
  "displayOrder": 1
}
```

## Supported Field Types
- `string` - Text field
- `integer` - Whole numbers
- `decimal` - Decimal numbers
- `boolean` - True/False
- `datetime` - Date and time
- `date` - Date only
- `enum` - Multiple choice with options

## Pagination
Most GET endpoints support pagination:
- `page` - Page number (default: 1)
- `pageSize` - Records per page (default: 10)

Example: `GET /api/dynamic/Customer?page=2&pageSize=20`

## Error Handling
The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

Error response format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "firstName: must be a string",
    "email: must be an email"
  ]
}
```

## Testing Tips

### 1. Run Requests in Sequence
Use Postman's Collection Runner to execute requests in order and chain data between requests

### 2. Use Tests for Validation
Add tests in the **Tests** tab to validate responses:
```javascript
pm.test("Status is 200", function() {
  pm.response.to.have.status(200);
});

pm.test("Response contains data", function() {
  pm.expect(pm.response.json()).to.have.property('data');
});
```

### 3. Save Response Data
Use Postman scripts to extract and save IDs for use in subsequent requests:
```javascript
var jsonData = pm.response.json();
pm.globals.set("customer_id", jsonData.data[0].id);
```

## Environment Setup
Set up environment variables for different environments:

**Development:**
- `base_url`: `http://localhost:8000`

**Staging:**
- `base_url`: `https://staging-api.example.com`

**Production:**
- `base_url`: `https://api.example.com`

## Additional Resources
- API Documentation: `http://localhost:8000/swagger`
- GitHub Repo: `https://github.com/alirazatahir1234`

---

**Version:** 1.0.0  
**Last Updated:** November 2025
