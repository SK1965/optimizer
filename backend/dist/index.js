"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express_1 = __importDefault(require("express"));
const server_1 = require("./server");
const app = (0, express_1.default)();
const port = 3000;
// Connect to Database
(0, server_1.connectDB)().then(() => {
    console.log('Database connected successfully');
});
app.get('/', async (req, res) => {
    try {
        res.send('Server is running and database is connected');
    }
    catch (error) {
        res.status(500).send('Server is running but database connection failed');
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
