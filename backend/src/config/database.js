/**
 * Database configuration and Prisma client setup
 * Ensures singleton pattern for Prisma client
 */

const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma client
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use global to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;

