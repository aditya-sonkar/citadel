"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.findById = exports.findByEmail = void 0;
const prisma_1 = require("../../core/database/prisma");
const findByEmail = async (email) => {
    return prisma_1.prisma.user.findUnique({
        where: {
            email,
        },
    });
};
exports.findByEmail = findByEmail;
const findById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: {
            id,
        },
    });
};
exports.findById = findById;
const createUser = async (data) => {
    return prisma_1.prisma.user.create({
        data,
    });
};
exports.createUser = createUser;
