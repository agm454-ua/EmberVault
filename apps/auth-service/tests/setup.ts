import { vi } from 'vitest'

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.REFRESH_SECRET = 'test-refresh-secret'
process.env.JWT_EXPIRATION_MINUTES = '15'
process.env.REFRESH_TOKEN_EXPIRATION_MINUTES = '1440'
process.env.RESET_PASSWORD_SECRET = 'test-reset-password-secret'
process.env.RESET_PASSWORD_EXPIRATION_MINUTES = '30'
process.env.MAIL_DIR = './public'
process.env.MAIL_PASSWORD = 'test-mail-password'
process.env.FRONTEND_URL = 'http://localhost:3000'

// Mock Prisma
export const mockPrisma = {
    users: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
    system_roles: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
    },
    resource_roles: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
}

vi.mock('@utils/prisma.js', () => ({
    prisma: mockPrisma,
}))

// Mock services
vi.mock('@services/users.service.js', () => ({
    getUser: vi.fn(),
    getUserById: vi.fn(),
    getUserRole: vi.fn(),
    createUser: vi.fn(),
    updatePassword: vi.fn(),
    updateUserSystemRole: vi.fn(),
}))

vi.mock('@services/system_roles.service.js', () => ({
    listSystemRoles: vi.fn(),
    getAdminRole: vi.fn(),
}))

vi.mock('@services/resource_roles.service.js', () => ({
    listResourcePermissions: vi.fn(),
    getUserResourceRole: vi.fn(),
    assignUserRoleToResource: vi.fn(),
    deleteUserRoleFromResource: vi.fn(),
    isOwnerOfResource: vi.fn(),
}))

// Mock utilities
vi.mock('@utils/mail.js', () => ({
    loadMailHTML: vi.fn(),
    sendEmail: vi.fn(),
}))

vi.mock('@utils/totp.js', () => ({
    generateTOTP: vi.fn(),
    validateTOTP: vi.fn(),
}))

vi.mock('@utils/cookieHandler.js', () => ({
    sendRefreshTokenCookie: vi.fn((res) => res),
    clearRefreshTokenCookie: vi.fn((res) => res),
}))

vi.mock('@utils/logger.js', () => ({
    default: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}))

// Helper function to create a mock request with user
export const createMockRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    userId: undefined,
    ...overrides,
})

// Helper function to create a mock response
export const createMockResponse = () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
        clearCookie: vi.fn().mockReturnThis(),
    }
    return res
}

// Helper function to generate a mock JWT token
export const generateMockToken = (payload = {}) => {
    return `mock-token-${JSON.stringify(payload)}`
}
