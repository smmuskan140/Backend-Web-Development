const { PrismaClient } = require('@prisma/client');

// One Prisma client per application process.
const prisma = new PrismaClient();

module.exports = prisma;
