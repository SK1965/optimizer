"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.connectDB = void 0;
const pg_1 = require("pg");
let pool;
const connectDB = async () => {
    try {
        // Hardcode these temporarily if the .env keeps failing to verify the logic
        const config = {
            user: 'postgres.aicbuzxxriquujwoirgu', // Ensure the .aicbuzxxriquujwoirgu is present
            password: 'optimizer123456789000',
            host: 'aws-0-ap-south-1.pooler.supabase.com',
            port: 6543,
            database: 'postgres',
            ssl: {
                rejectUnauthorized: false,
            },
        };
        console.log(`Attempting to connect to tenant: ${config.user}`);
        pool = new pg_1.Pool(config);
        // Test the connection
        const res = await pool.query('SELECT NOW()');
        console.log('🚀 Database connected successfully at:', res.rows[0].now);
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const query = (text, params) => {
    if (!pool) {
        throw new Error('Database pool has not been initialized. Call connectDB() first.');
    }
    return pool.query(text, params);
};
exports.query = query;
