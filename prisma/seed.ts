import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create or get Customer entity
    let customerEntity = await prisma.entityDefinition.findUnique({
      where: { entityName: 'Customer' },
    });

    if (!customerEntity) {
      customerEntity = await prisma.entityDefinition.create({
        data: {
          entityName: 'Customer',
          displayName: 'Customers',
          tableName: 'Customers',
          description: 'Customer management records',
        },
      });
      console.log(`✓ Created entity: ${customerEntity.entityName}`);
    } else {
      console.log(`✓ Entity already exists: ${customerEntity.entityName}`);
    }

    // Add fields to Customer
    const existingFields = await prisma.fieldDefinition.count({
      where: { entityId: customerEntity.id },
    });

    if (existingFields === 0) {
      const fields = [
        {
          entityId: customerEntity.id,
          fieldName: 'FullName',
          displayName: 'Full Name',
          fieldType: 'string',
          isRequired: true,
          maxLength: 255,
          displayOrder: 1,
        },
        {
          entityId: customerEntity.id,
          fieldName: 'email',
          displayName: 'Email',
          fieldType: 'string',
          isRequired: true,
          isUnique: true,
          displayOrder: 2,
        },
      ];

      for (const field of fields) {
        await prisma.fieldDefinition.create({
          data: field,
        });
      }

      console.log(`✓ Added ${fields.length} fields to Customer entity`);
    } else {
      console.log(`✓ Customer entity already has ${existingFields} fields`);
    }

    // Create or get Product entity
    let productEntity = await prisma.entityDefinition.findUnique({
      where: { entityName: 'Product' },
    });

    if (!productEntity) {
      productEntity = await prisma.entityDefinition.create({
        data: {
          entityName: 'Product',
          displayName: 'Products',
          tableName: 'Products',
          description: 'Product catalog',
        },
      });
      console.log(`✓ Created entity: ${productEntity.entityName}`);
    } else {
      console.log(`✓ Entity already exists: ${productEntity.entityName}`);
    }

    // Add fields to Product
    const existingProductFields = await prisma.fieldDefinition.count({
      where: { entityId: productEntity.id },
    });

    if (existingProductFields === 0) {
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
    } else {
      console.log(`✓ Product entity already has ${existingProductFields} fields`);
    }

    // Create sample Customer records
    const existingCustomers = await prisma.dynamicRecord.count({
      where: { entityId: customerEntity.id },
    });

    if (existingCustomers === 0) {
      const customers = [
        {
          FullName: 'John Doe',
          email: 'john.doe@example.com',
        },
        {
          FullName: 'Jane Smith',
          email: 'jane.smith@example.com',
        },
        {
          FullName: 'Bob Johnson',
          email: 'bob.johnson@example.com',
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
    } else {
      console.log(`✓ Customer records already exist (${existingCustomers} records)`);
    }

    // Create sample Product records
    const existingProducts = await prisma.dynamicRecord.count({
      where: { entityId: productEntity.id },
    });

    if (existingProducts === 0) {
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
    } else {
      console.log(`✓ Product records already exist (${existingProducts} records)`);
    }

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
