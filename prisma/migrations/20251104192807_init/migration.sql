-- CreateTable
CREATE TABLE `entity_definitions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entityName` VARCHAR(255) NOT NULL,
    `displayName` VARCHAR(255) NOT NULL,
    `tableName` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `entity_definitions_entityName_key`(`entityName`),
    UNIQUE INDEX `entity_definitions_tableName_key`(`tableName`),
    INDEX `entity_definitions_entityName_idx`(`entityName`),
    INDEX `entity_definitions_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `field_definitions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entityId` INTEGER NOT NULL,
    `fieldName` VARCHAR(255) NOT NULL,
    `displayName` VARCHAR(255) NOT NULL,
    `fieldType` VARCHAR(50) NOT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `isUnique` BOOLEAN NOT NULL DEFAULT false,
    `maxLength` INTEGER NULL,
    `minLength` INTEGER NULL,
    `pattern` TEXT NULL,
    `defaultValue` TEXT NULL,
    `options` LONGTEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `field_definitions_entityId_idx`(`entityId`),
    INDEX `field_definitions_isDeleted_idx`(`isDeleted`),
    UNIQUE INDEX `field_definitions_entityId_fieldName_key`(`entityId`, `fieldName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dynamic_records` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` INTEGER NOT NULL,
    `data` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `dynamic_records_entityId_idx`(`entityId`),
    INDEX `dynamic_records_createdAt_idx`(`createdAt`),
    INDEX `dynamic_records_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entityName` VARCHAR(255) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `recordId` TEXT NOT NULL,
    `oldData` LONGTEXT NULL,
    `newData` LONGTEXT NULL,
    `userId` VARCHAR(255) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entityName_idx`(`entityName`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `field_definitions` ADD CONSTRAINT `field_definitions_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `entity_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dynamic_records` ADD CONSTRAINT `dynamic_records_entityId_fkey` FOREIGN KEY (`entityId`) REFERENCES `entity_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
