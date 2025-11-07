-- Fix Metadata Mismatch for Customer Entity
-- This script adds missing fields to the Customer entity in field_definitions

-- 1. First, let's see what fields already exist
SELECT id, entityId, fieldName, displayName, fieldType, isRequired, maxLength, displayOrder 
FROM field_definitions 
WHERE entityId = 1 
ORDER BY displayOrder;

-- 2. Add missing fields for Customer entity

-- Add FullName field
INSERT INTO field_definitions (entityId, fieldName, displayName, fieldType, isRequired, maxLength, displayOrder)
SELECT 1, 'FullName', 'Full Name', 'string', 1, 255, 2
WHERE NOT EXISTS (SELECT 1 FROM field_definitions WHERE entityId = 1 AND fieldName = 'FullName');

-- 3. Verify all fields are now present
SELECT id, fieldName, displayName, fieldType, isRequired, displayOrder 
FROM field_definitions 
WHERE entityId = 1 
ORDER BY displayOrder;

-- Output should show:
-- 1. email
-- 2. FullName (NEW)

-- 4. Also add fields for Product entity if needed
SELECT id, entityId, fieldName, displayName, fieldType, isRequired, displayOrder 
FROM field_definitions 
WHERE entityId = 3 
ORDER BY displayOrder;

-- All done! Now your metadata matches your payload structure
-- You can now POST to /api/dynamic/Customer with all fields
