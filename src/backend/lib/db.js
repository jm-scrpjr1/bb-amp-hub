const { PrismaClient } = require('@prisma/client');

// ALWAYS create a fresh Prisma instance - don't use globalThis caching
// This fixes the issue where globalThis.prisma was undefined
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

console.log('✅ Prisma client initialized:', typeof prisma, prisma ? 'DEFINED' : 'UNDEFINED');

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, testConnection };
