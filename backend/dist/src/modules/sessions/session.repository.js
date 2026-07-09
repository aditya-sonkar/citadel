"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllUserSessions = exports.deleteSessionByHash = exports.updateSession = exports.findSessionsByUserId = exports.findSessionById = exports.findSessionByHash = exports.createSession = void 0;
const prisma_1 = require("../../core/database/prisma");
const createSession = async (data) => {
    return prisma_1.prisma.session.create({
        data,
    });
};
exports.createSession = createSession;
const findSessionByHash = async (refreshTokenHash) => {
    return prisma_1.prisma.session.findUnique({
        where: {
            refreshTokenHash,
        },
    });
};
exports.findSessionByHash = findSessionByHash;
const findSessionById = async (id) => {
    return prisma_1.prisma.session.findUnique({
        where: {
            id,
        },
    });
};
exports.findSessionById = findSessionById;
const findSessionsByUserId = async (userId) => {
    return prisma_1.prisma.session.findMany({
        where: {
            userId,
        },
    });
};
exports.findSessionsByUserId = findSessionsByUserId;
const updateSession = async (id, data) => {
    return prisma_1.prisma.session.update({
        where: {
            id,
        },
        data,
    });
};
exports.updateSession = updateSession;
const deleteSessionByHash = async (refreshTokenHash) => {
    const session = await prisma_1.prisma.session.findUnique({
        where: {
            refreshTokenHash,
        },
    });
    if (!session)
        return null;
    await prisma_1.prisma.session.delete({
        where: {
            refreshTokenHash,
        },
    });
    return session;
};
exports.deleteSessionByHash = deleteSessionByHash;
const deleteAllUserSessions = async (userId) => {
    await prisma_1.prisma.session.deleteMany({
        where: {
            userId,
        },
    });
};
exports.deleteAllUserSessions = deleteAllUserSessions;
