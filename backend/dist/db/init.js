"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsersTable = void 0;
const server_1 = require("../server");
const createUsersTable = async () => {
    const text = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    try {
        await (0, server_1.query)(text);
        console.log('Users table created successfully');
    }
    catch (error) {
        console.error('Error creating users table:', error);
    }
};
exports.createUsersTable = createUsersTable;
