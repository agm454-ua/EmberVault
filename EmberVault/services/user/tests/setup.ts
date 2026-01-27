import { vi } from 'vitest'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing'
process.env.FRONTEND_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Mock Prisma Client
const mockPrisma = {
    users: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
    },
    system_roles: {
        findFirst: vi.fn(),
    },
    $disconnect: vi.fn(),
}

vi.mock('@utils/prisma', () => ({
    prisma: mockPrisma,
}))

// Export mock prisma for use in tests
export { mockPrisma }
