const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'money_tracker_db',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT || 3306),
});

module.exports = pool.promise();
