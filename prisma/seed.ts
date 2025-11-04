import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create Customer entity
    const customerEntity = await prisma.entityDefinition.create({
      data: {
        entityName: 'Customer',
        displayName: 'Customers',
        tableName: 'Customers',
        description: 'Customer management records',
      },
    });

    console.log(`✓ Created entity: ${customerEntity.entityName}`);

    // Add fields to Customer
    const fields = [
      {
        entityId: customerEntity.id,
        fieldName: 'firstName',
        displayName: 'First Name',
        fieldType: 'string',
        isRequired: true,
        maxLength: 100,
        displayOrder: 1,
      },
      {
        entityId: customerEntity.id,
        fieldName: 'lastName',
        displayName: 'Last Name',
        fieldType: 'string',
        isRequired: true,
        maxLength: 100,
        displayOrder: 2,
      },
      {
        entityId: customerEntity.id,
        fieldName: 'email',
        displayName: 'Email',
        fieldType: 'string',
        isRequired: true,
        isUnique: true,
        displayOrder: 3,
      },
      {
        entityId: customerEntity.id,
        fieldName: 'phone',
        displayName: 'Phone',
        fieldType: 'string',
        isRequired: false,
        maxLength: 20,
        displayOrder: 4,
      },
      {
        entityId: customerEntity.id,
        fieldName: 'status',
        displayName: 'Status',
        fieldType: 'enum',
        isRequired: true,
        options: JSON.stringify([
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'suspended', label: 'Suspended' },
        ]),
        displayOrder: 5,
      },
    ];

    for (const field of fields) {
      await prisma.fieldDefinition.create({
        data: field,
      });
    }

    console.log(`✓ Added ${fields.length} fields to Customer entity`);

    // Create Product entity
    const productEntity = await prisma.entityDefinition.create({
      data: {
        entityName: 'Product',
        displayName: 'Products',
        tableName: 'Products',
        description: 'Product catalog',
      },
    });

    console.log(`✓ Created entity: ${productEntity.entityName}`);

    // Add fields to Product
    const productFields = [
      {
        entityId: productEntity.id,
        fieldName: 'productName',
        displayName: 'Product Name',
        fieldType: 'string',
        isRequired: true,
        maxLength: 255,
        displayOrder: 1,
      },
      {
        entityId: productEntity.id,
        fieldName: 'price',
        displayName: 'Price',
        fieldType: 'decimal',
        isRequired: true,
        displayOrder: 2,
      },
      {
        entityId: productEntity.id,
        fieldName: 'quantity',
        displayName: 'Quantity in Stock',
        fieldType: 'integer',
        isRequired: true,
        displayOrder: 3,
      },
    ];

    for (const field of productFields) {
      await prisma.fieldDefinition.create({
        data: field,
      });
    }

    console.log(`✓ Added ${productFields.length} fields to Product entity`);

    // Create sample Customer records
    const customers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0100',
        status: 'active',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0101',
        status: 'active',
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1-555-0102',
        status: 'inactive',
      },
    ];

    for (const customer of customers) {
      await prisma.dynamicRecord.create({
        data: {
          entityId: customerEntity.id,
          data: JSON.stringify(customer),
        },
      });
    }

    console.log(`✓ Created ${customers.length} sample customer records`);

    // Create sample Product records
    const products = [
      {
        productName: 'Laptop',
        price: 999.99,
        quantity: 50,
      },
      {
        productName: 'Mouse',
        price: 29.99,
        quantity: 200,
      },
      {
        productName: 'Keyboard',
        price: 79.99,
        quantity: 150,
      },
    ];

    for (const product of products) {
      await prisma.dynamicRecord.create({
        data: {
          entityId: productEntity.id,
          data: JSON.stringify(product),
        },
      });
    }

    console.log(`✓ Created ${products.length} sample product records`);

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
