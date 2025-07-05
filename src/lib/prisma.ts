// Temporarily disable Prisma to get app running
// import { PrismaClient } from '@prisma/client'

// Mock prisma client to avoid database connection issues
export const prisma = {
  user: {
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({ id: 'mock', email: 'test@example.com' }),
  },
  session: {
    create: () => Promise.resolve({ id: 'mock' }),
    findUnique: () => Promise.resolve(null),
    delete: () => Promise.resolve({ id: 'mock' }),
  },
  shift: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({ id: 'mock' }),
    update: () => Promise.resolve({ id: 'mock' }),
    delete: () => Promise.resolve({ id: 'mock' }),
  },
  paycheck: {
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({ id: 'mock' }),
    update: () => Promise.resolve({ id: 'mock' }),
    delete: () => Promise.resolve({ id: 'mock' }),
  },
}