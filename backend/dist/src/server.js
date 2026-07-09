"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./core/database/prisma");
const env_1 = require("./core/config/env");
const PORT = env_1.env.PORT;
const NODE_ENV = env_1.env.NODE_ENV;
const server = http_1.default.createServer(app_1.default);
async function startServer() {
    try {
        // Connect to Database
        await prisma_1.prisma.$connect();
        console.log('Database is connected successfully');
        console.log('Starting server...');
        server.listen(PORT, () => {
            console.log(`🚀 Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);
        });
        // Graceful Shutdown Handler
        const shutdown = (signal) => {
            console.log(`Received ${signal}. Closing server...`);
            server.close(async () => {
                console.log('HTTP server closed.');
                try {
                    await prisma_1.prisma.$disconnect();
                    console.log('Database disconnected cleanly.');
                    process.exit(0);
                }
                catch (error) {
                    console.error('Error during database disconnect:', error);
                    process.exit(1);
                }
            });
            // Force exit after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown due to timeout.');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
