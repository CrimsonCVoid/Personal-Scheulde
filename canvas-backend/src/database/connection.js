const knex = require('knex');
const logger = require('../utils/logger');

const config = {
  client: 'sqlite3',
  connection: {
    filename: process.env.DATABASE_URL?.replace('sqlite:', '') || './data/canvas_integration.db'
  },
  useNullAsDefault: true,
  pool: {
    min: parseInt(process.env.DATABASE_POOL_MIN) || 2,
    max: parseInt(process.env.DATABASE_POOL_MAX) || 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

const database = knex(config);

// Test connection
database.raw('SELECT 1')
  .then(() => {
    logger.info('Database connection established successfully');
  })
  .catch((error) => {
    logger.error('Database connection failed:', error);
    process.exit(1);
  });

module.exports = database;