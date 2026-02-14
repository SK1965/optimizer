"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("./server");
const init_1 = require("./db/init");
const app = (0, express_1.default)();
const port = 3000;
// Connect to Database
(0, server_1.connectDB)().then(() => {
    (0, init_1.createUsersTable)();
});
app.get('/', (req, res) => {
    res.send('Health check: OK');
});
app.get('/db-health', async (req, res) => {
    try {
        console.log("command running");
        const result = await (0, server_1.query)('SELECT NOW()');
        res.json({ status: 'OK', time: result.rows[0].now });
    }
    catch (error) {
        console.error('Database Check Error:', error);
        res.status(500).json({ status: 'Error', error: error.message || 'Internal Server Error' });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
