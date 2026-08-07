require('dotenv').config();

const baseConfig = {
    client: process.env.DB_CLIENT || 'mysql2',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'money_tracker_db',
        port: Number(process.env.DB_PORT || 3306),
    },
    migrations: {
        directory: './db/migrations',
    },
    seeds: {
        directory: './db/seeds',
    },
};

module.exports = {
    ...baseConfig,
    development: baseConfig,
};
