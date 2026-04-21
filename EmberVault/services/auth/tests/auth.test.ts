import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import * as usersService from '../src/services/users.service.js'
import * as authUtils from '@agm454-ua/auth-utils'
import { sendRefreshTokenCookie } from '../src/utils/cookieHandler.js'
import type { Response } from 'express'

// Mock the services
vi.mock('../src/services/users.service.js')
vi.mock('@agm454-ua/auth-utils', async () => {
    const actual = await vi.importActual('@agm454-ua/auth-utils')
    return {
        ...actual,
        hashPassword: vi.fn(),
        validatePassword: vi.fn(),
        generateToken: vi.fn(),
        validateToken: vi.fn(),
    }
})
vi.mock('../src/utils/cookieHandler.js')

const USER_ROLE_ID = 'role-user-id'

const buildUserData = (
    id: string,
    roleId: string = USER_ROLE_ID,
    roleName: string = 'user',
) => ({
    id,
    email: `${id}@example.com`,
    username: id,
    system_role: {
        id: roleId,
        name: roleName,
    },
    password: 'hashed-password',
    root_folder: null,
})

describe('Auth Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/login', () => {
        it('should login successfully with email', async () => {
            const mockUser = buildUserData('user-1')

            vi.mocked(usersService.getUser).mockResolvedValue(mockUser)
            vi.mocked(authUtils.validatePassword).mockResolvedValue(true)
            vi.mocked(authUtils.generateToken).mockReturnValue('mock-jwt-token')
            vi.mocked(sendRefreshTokenCookie).mockReturnValue({} as Response)

            const response = await request(app).post('/api/login').send({
                email: 'test@example.com',
                password: 'password123',
            })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveProperty('user')
            expect(response.body.data).toHaveProperty('token')
            expect(response.body.data.user.email).toBe('user-1@example.com')
        })

        it('should login successfully with username', async () => {
            const mockUser = buildUserData('user-1')

            vi.mocked(usersService.getUser).mockResolvedValue(mockUser)
            vi.mocked(authUtils.validatePassword).mockResolvedValue(true)
            vi.mocked(authUtils.generateToken).mockReturnValue('mock-jwt-token')
            vi.mocked(sendRefreshTokenCookie).mockReturnValue({} as Response)

            const response = await request(app).post('/api/login').send({
                username: 'testuser',
                password: 'password123',
            })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
        })

        it('should return 400 when email or username is missing', async () => {
            const response = await request(app).post('/api/login').send({
                password: 'password123',
            })

            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it('should return 400 when password is missing', async () => {
            const response = await request(app).post('/api/login').send({
                email: 'test@example.com',
            })

            expect(response.status).toBe(400)
        })

        it('should return 400 when password is too short', async () => {
            const response = await request(app).post('/api/login').send({
                email: 'test@example.com',
                password: 'short',
            })

            expect(response.status).toBe(400)
        })

        it('should return 400 when email format is invalid', async () => {
            const response = await request(app).post('/api/login').send({
                email: 'invalid-email',
                password: 'password123',
            })

            expect(response.status).toBe(400)
        })

        it('should return 401 when user is not found', async () => {
            vi.mocked(usersService.getUser).mockResolvedValue(null)

            const response = await request(app).post('/api/login').send({
                email: 'notfound@example.com',
                password: 'password123',
            })

            expect(response.status).toBe(401)
            expect(response.body.success).toBe(false)
        })

        it('should return 401 when password is incorrect', async () => {
            const mockUser = buildUserData('user-1')

            vi.mocked(usersService.getUser).mockResolvedValue(mockUser)
            vi.mocked(authUtils.validatePassword).mockResolvedValue(false)

            const response = await request(app).post('/api/login').send({
                email: 'test@example.com',
                password: 'wrongpassword',
            })

            expect(response.status).toBe(401)
            expect(response.body.success).toBe(false)
        })
    })

    describe('POST /api/register', () => {
        it('should register a new user successfully', async () => {
            const mockNewUser = {
                id: 'user-1',
                email: 'newuser@example.com',
                username: 'newuser',
                system_role: {
                    id: USER_ROLE_ID,
                    name: 'user',
                },
                root_folder: null,
            }

            vi.mocked(authUtils.hashPassword).mockResolvedValue('hashed-password')
            vi.mocked(usersService.createUser).mockResolvedValue(mockNewUser)
            vi.mocked(authUtils.generateToken).mockReturnValue('mock-jwt-token')
            vi.mocked(sendRefreshTokenCookie).mockReturnValue({} as Response)

            const response = await request(app).post('/api/register').send({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                birthDate: '2000-01-01',
            })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveProperty('user')
            expect(response.body.data).toHaveProperty('token')
        })

        it('should return 400 when username is missing', async () => {
            const response = await request(app).post('/api/register').send({
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                birthDate: '2000-01-01',
            })

            expect(response.status).toBe(400)
        })

        it('should return 400 when email is missing', async () => {
            const response = await request(app).post('/api/register').send({
                username: 'newuser',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                birthDate: '2000-01-01',
            })

            expect(response.status).toBe(400)
        })

        it('should return 400 when passwords do not match', async () => {
            const response = await request(app).post('/api/register').send({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'DifferentPassword123!',
                birthDate: '2000-01-01',
            })

            expect(response.status).toBe(400)
        })

        it('should return 400 when username is too short', async () => {
            const response = await request(app).post('/api/register').send({
                username: 'ab',
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                birthDate: '2000-01-01',
            })

            expect(response.status).toBe(400)
        })

        it('should return 400 when birth date is invalid', async () => {
            const response = await request(app).post('/api/register').send({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                birthDate: 'invalid-date',
            })

            expect(response.status).toBe(400)
        })

        it('should return 400 when user is too young', async () => {
            const futureDate = new Date()
            futureDate.setFullYear(futureDate.getFullYear() - 10)

            const response = await request(app).post('/api/register').send({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                birthDate: futureDate.toISOString(),
            })

            expect(response.status).toBe(400)
        })
    })

    describe('POST /api/logout', () => {
        it('should logout successfully with valid token', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(
                buildUserData('user-1'),
            )

            const response = await request(app)
                .post('/api/logout')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
        })

        it('should return 401 when token is missing', async () => {
            const response = await request(app).post('/api/logout')

            expect(response.status).toBe(401)
        })

        it('should return 401 when token is invalid', async () => {
            vi.mocked(authUtils.validateToken).mockReturnValue(null)

            const response = await request(app)
                .post('/api/logout')
                .set('Authorization', 'Bearer invalid-token')

            expect(response.status).toBe(401)
        })
    })

    describe('POST /api/refresh', () => {
        it('should refresh token successfully', async () => {
            const mockUser = buildUserData('user-1')

            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockResolvedValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(mockUser)
            vi.mocked(authUtils.generateToken).mockReturnValue(
                'new-mock-jwt-token',
            )

            const response = await request(app)
                .post('/api/refresh')
                .set('Cookie', 'refreshToken=mock-refresh-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveProperty('token')
        })

        it('should return 401 when refresh token is missing', async () => {
            const response = await request(app).post('/api/refresh')

            expect(response.status).toBe(401)
        })

        it('should return 401 when refresh token is invalid', async () => {
            vi.mocked(authUtils.validateToken).mockResolvedValue(null)

            const response = await request(app)
                .post('/api/refresh')
                .set('Cookie', 'refreshToken=invalid-token')

            expect(response.status).toBe(401)
        })

        it('should return 401 when user does not exist', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockResolvedValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(null)

            const response = await request(app)
                .post('/api/refresh')
                .set('Cookie', 'refreshToken=mock-refresh-token')

            expect(response.status).toBe(401)
        })
    })

    describe('GET /api/me', () => {
        it('should return current user info', async () => {
            const mockUser = buildUserData('user-1')

            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(mockUser)

            const response = await request(app)
                .get('/api/me')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveProperty('id')
            expect(response.body.data).toHaveProperty('username')
            expect(response.body.data).toHaveProperty('email')
            expect(response.body.data.id).toBe('user-1')
        })

        it('should return 401 when token is missing', async () => {
            const response = await request(app).get('/api/me')

            expect(response.status).toBe(401)
        })

        it('should return 401 when user is not found', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(null)

            const response = await request(app)
                .get('/api/me')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(401)
        })
    })
})
