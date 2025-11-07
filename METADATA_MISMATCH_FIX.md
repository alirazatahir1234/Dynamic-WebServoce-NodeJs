# Metadata Mismatch Fix Guide

## Problem Analysis

Your Dynamic WebService validates incoming records against `FieldDefinition` metadata. When you POST data with fields that don't exist in metadata, the validation fails.

**Example:**
```json
// Your payload
{
  "firstName": "Bob",
  "lastName": "Johnson",
  "email": "bob.johnson@example.com",
  "phone": "+1-555-0102",
  "status": "inactive"
}

// But FieldDefinition only has:
// - firstName
// - email
```

## Root Cause

The `validateRecordData()` method in `dynamic.service.ts`:
- ✅ Validates ONLY defined fields
- ❌ Silently ignores unknown fields or throws error
- ❌ Doesn't provide feedback about missing metadata

## Solutions

### Solution 1: Add Missing Fields to Metadata (Recommended)

**SQL Approach:**
```sql
-- Add missing fields to Customer entity
INSERT INTO FieldDefinitions (entityId, fieldName, displayName, fieldType, isRequired, maxLength, displayOrder)
VALUES 
(1, 'lastName', 'Last Name', 'string', 1, 100, 2),
(1, 'phone', 'Phone', 'string', 0, 20, 4),
(1, 'status', 'Status', 'enum', 1, NULL, 5);
```

**Via API:**
```bash
POST /api/metadata/fields
{
  "entityId": 1,
  "fieldName": "lastName",
  "displayName": "Last Name",
  "fieldType": "string",
  "isRequired": true,
  "maxLength": 100,
  "displayOrder": 2
}
```

**Via Database UI:**
1. Open phpMyAdmin: http://localhost:8001
2. Navigate to `FieldDefinitions` table
3. Insert new rows with missing fields

### Solution 2: Enhanced Validation (Backend Fix)

Add this to `dynamic.service.ts` to detect unknown fields:

```typescript
/**
 * Enhanced validation that checks for unknown fields
 */
private async validateRecordData(
  context: DynamicEntityContext,
  data: Record<string, any>,
): Promise<void> {
  const fields = context.fields;
  const definedFieldNames = fields.map(f => f.fieldName);

  // Check for unknown fields
  const unknownFields = Object.keys(data).filter(
    key => !definedFieldNames.includes(key)
  );

  if (unknownFields.length > 0) {
    throw new BadRequestException({
      statusCode: 400,
      message: `Unknown fields in payload`,
      unknownFields: unknownFields,
      definedFields: definedFieldNames,
      suggestion: `Add these fields to FieldDefinition: ${unknownFields.join(', ')}`
    });
  }

  // ... rest of existing validation
}
```

### Solution 3: Auto-Extend Metadata (Advanced)

Add this helper method to automatically register new fields:

```typescript
/**
 * Auto-register unknown fields in metadata
 */
private async autoExtendMetadata(
  entityId: number,
  data: Record<string, any>,
  definedFields: FieldDefinitionDto[]
): Promise<void> {
  const definedFieldNames = definedFields.map(f => f.fieldName);
  const unknownFields = Object.keys(data).filter(
    key => !definedFieldNames.includes(key)
  );

  if (unknownFields.length === 0) {
    return;
  }

  this.logger.info(
    `Auto-registering unknown fields: ${unknownFields.join(', ')}`,
    'DynamicService'
  );

  // Add fields to metadata
  for (const fieldName of unknownFields) {
    const value = data[fieldName];
    const fieldType = Array.isArray(value) ? 'array' : typeof value;

    await this.metadataService.createField({
      entityId,
      fieldName,
      displayName: this.toDisplayName(fieldName),
      fieldType: fieldType === 'object' ? 'json' : 'string',
      isRequired: false,
      displayOrder: definedFields.length + 1,
    });
  }

  this.logger.info(`✓ Metadata auto-extended successfully`, 'DynamicService');
}

private toDisplayName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
```

### Solution 4: Bulk Import Missing Fields via Seed

Create a migration to add all expected fields:

```typescript
// prisma/seed.ts or migrations
async function addMissingFieldsToCustomer() {
  const customerEntity = await prisma.entityDefinition.findUnique({
    where: { entityName: 'Customer' }
  });

  const fieldsToAdd = [
    { fieldName: 'lastName', displayName: 'Last Name', fieldType: 'string' },
    { fieldName: 'phone', displayName: 'Phone', fieldType: 'string' },
    { fieldName: 'status', displayName: 'Status', fieldType: 'enum' },
  ];

  for (const field of fieldsToAdd) {
    await prisma.fieldDefinition.upsert({
      where: {
        entityId_fieldName: {
          entityId: customerEntity.id,
          fieldName: field.fieldName
        }
      },
      update: {},
      create: {
        entityId: customerEntity.id,
        ...field,
        isRequired: false,
        displayOrder: 10,
      }
    });
  }
}
```

## Implementation Steps

### Step 1: Verify Current Metadata
```bash
# Open phpMyAdmin
http://localhost:8001

# Username: root
# Password: rootpassword

# Check FieldDefinitions for Customer entity
SELECT * FROM FieldDefinitions WHERE entityId = 1;
```

### Step 2: Add Missing Fields

**Option A - Via phpMyAdmin UI:**
1. Go to FieldDefinitions table
2. Insert new rows:
   - lastName, phone, status

**Option B - Via API (Postman):**
```bash
POST http://localhost:8000/api/metadata/fields
Content-Type: application/json

{
  "entityId": 1,
  "fieldName": "lastName",
  "displayName": "Last Name",
  "fieldType": "string",
  "isRequired": true,
  "maxLength": 100,
  "displayOrder": 2
}
```

**Option C - Via Database:**
```bash
# Connect to MySQL
mysql -h localhost -u root -prootpassword dynamic_webservice

# Add fields
INSERT INTO FieldDefinitions (entityId, fieldName, displayName, fieldType, isRequired, maxLength, displayOrder)
VALUES 
(1, 'lastName', 'Last Name', 'string', 1, 100, 2),
(1, 'phone', 'Phone', 'string', 0, 20, 4),
(1, 'status', 'Status', 'enum', 1, NULL, 5);
```

### Step 3: Clear Cache (if applicable)
```bash
# Restart API to clear any cached metadata
Ctrl+C  # Stop running server
npm run start:dev  # Restart
```

### Step 4: Re-test

```bash
POST http://localhost:8000/api/dynamic/Customer
Content-Type: application/json

{
  "firstName": "Bob",
  "lastName": "Johnson",
  "email": "bob.johnson@example.com",
  "phone": "+1-555-0102",
  "status": "inactive"
}

# Expected Response:
{
  "success": true,
  "data": {
    "id": "...",
    "entityId": 1,
    "data": {
      "firstName": "Bob",
      "lastName": "Johnson",
      "email": "bob.johnson@example.com",
      "phone": "+1-555-0102",
      "status": "inactive"
    },
    "createdAt": "2025-11-07T...",
    "isDeleted": false
  }
}
```

## Database Interfaces

### phpMyAdmin (MySQL)
- **URL:** http://localhost:8001
- **Username:** root
- **Password:** rootpassword
- **Database:** dynamic_webservice

### MongoDB Express (MongoDB)
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** admin123
- **Database:** dynamic_db

## Troubleshooting

### "Unknown fields" Error
```
Error: Unknown fields in payload: lastName, phone, status
```
→ Add these fields to FieldDefinitions (see Step 2 above)

### "Field is required" Error
```
Error: Field 'lastName' is required
```
→ Set `isRequired = 1` in FieldDefinitions for that field

### Metadata Not Updating
```
1. Clear browser cache
2. Restart API server: Ctrl+C then npm run start:dev
3. Re-test request
```

### phpMyAdmin Connection Issue
```bash
# Verify container is running
docker ps | grep phpmyadmin

# Restart if needed
docker-compose restart phpmyadmin
```

## Quick Reference

| Issue | Solution | Command |
|-------|----------|---------|
| Unknown fields error | Add to FieldDefinitions | See Step 2 Option C |
| Can't access phpMyAdmin | Start containers | `docker-compose up -d` |
| Metadata cached | Restart API | `npm run start:dev` |
| Check current fields | Query FieldDefinitions | `SELECT * FROM FieldDefinitions WHERE entityId = 1;` |

---

**Recommended Approach:** Use **Solution 1** (Add Missing Fields to Metadata) + **Solution 2** (Enhanced Validation) for a robust system.

This ensures:
✅ Clear error messages about what fields are expected
✅ Metadata stays up-to-date
✅ Frontend developers know what fields are available
✅ No silent failures
