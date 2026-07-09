"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const env_1 = require("../config/env");
const pool = new pg_1.Pool({ connectionString: env_1.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({ adapter });
};
exports.prisma = globalThis.prisma ?? prismaClientSingleton();
if (env_1.env.NODE_ENV !== 'production')
    globalThis.prisma = exports.prisma;
