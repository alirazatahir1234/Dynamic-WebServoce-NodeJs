/**
 * Database Configuration
 * Supports hybrid database approach: MySQL (primary) + MongoDB (flexible schema)
 */

export enum DatabaseType {
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
}

export interface DatabaseConfig {
  type: DatabaseType;
  mysql?: {
    url: string;
  };
  mongodb?: {
    url: string;
    database: string;
  };
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const dbType = (process.env.DATABASE_TYPE || 'mysql') as DatabaseType;

  const config: DatabaseConfig = {
    type: dbType,
    mysql: {
      url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/dynamic_db',
    },
    mongodb: {
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
      database: process.env.MONGODB_DATABASE || 'dynamic_db',
    },
  };

  return config;
};

/**
 * Database routing configuration
 * Determine which database to use for specific entity types
 */
export interface EntityDatabaseRouting {
  [entityName: string]: DatabaseType;
}

export const getEntityDatabaseRouting = (): EntityDatabaseRouting => {
  // Parse from environment or return default
  // Default: entities go to MySQL, can override via env
  // Example: ROUTING_CUSTOMER=mongodb,ROUTING_ORDER=mongodb
  const routing: EntityDatabaseRouting = {};

  // Check environment for specific entity routing
  Object.entries(process.env).forEach(([key, value]) => {
    if (key.startsWith('ROUTING_')) {
      const entityName = key.replace('ROUTING_', '').toLowerCase();
      routing[entityName] = value as DatabaseType;
    }
  });

  return routing;
};

/**
 * Get database type for a specific entity
 */
export const getDatabaseForEntity = (
  entityName: string,
  routing: EntityDatabaseRouting,
): DatabaseType => {
  return routing[entityName.toLowerCase()] || DatabaseType.MYSQL;
};
