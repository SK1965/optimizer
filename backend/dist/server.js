"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.connectDB = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.SUPABASE_URL,
});
const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const query = (text, params) => pool.query(text, params);
exports.query = query;
