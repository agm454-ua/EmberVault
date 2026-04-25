import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import * as usersService from '../src/services/users.service.js'
import * as authUtils from '@agm454-ua/auth-utils'
import * as mailUtils from '../src/utils/mail.js'
import * as totpUtils from '../src/utils/totp.js'

// Mock the services
vi.mock('../src/services/users.service.js')
vi.mock('@agm454-ua/auth-utils', async () => {
    const actual = await vi.importActual('@agm454-ua/auth-utils')
    return {
        ...actual,
        validatePassword: vi.fn(),
        hashPassword: vi.fn(),
        validateToken: vi.fn(),
    }
})
vi.mock('../src/utils/mail.js')
vi.mock('../src/utils/totp.js')

describe('Password Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/change-password', () => {
        const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            username: 'testuser',
            system_role: 'user',
            password: 'hashed-old-password',
        }

        const mockPayload = {
            userId: 'user-1',
            systemRole: 'user',
        }

        beforeEach(() => {
            // Mock validateToken to return the payload synchronously
            vi.mocked(authUtils.validateToken).mockImplementation(
                () => mockPayload,
            )
            vi.mocked(usersService.getUserById).mockResolvedValue(mockUser)
        })

        it('should change password successfully', async () => {
            vi.mocked(authUtils.validatePassword).mockResolvedValue(true)
            vi.mocked(authUtils.hashPassword).mockResolvedValue(
                'hashed-new-password',
            )
            vi.mocked(usersService.updatePassword).mockResolvedValue(
                'hashed-new-password',
            )

            const response = await request(app)
                .post('/api/change-password')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    oldPassword: 'oldPassword123!',
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!',
                })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
        })

        it('should return 400 when fields are missing', async () => {
            // Set up mocks for authentication
            const mockPayload = {
                userId: 'user-1',
                systemRole: 'user',
            }
            vi.mocked(authUtils.validateToken).mockImplementation(
                () => mockPayload,
            )
            vi.mocked(usersService.getUserById).mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                system_role: 'user',
                password: 'hashed-old-password',
            })

            const response = await request(app)
                .post('/api/change-password')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    oldPassword: 'oldPassword123!',
                })

            expect(response.status).toBe(400)
        })

        it('should return 400 when new passwords do not match', async () => {
            // Set up mocks for authentication
            const mockPayload = {
                userId: 'user-1',
                systemRole: 'user',
            }
            vi.mocked(authUtils.validateToken).mockImplementation(
                () => mockPayload,
            )
            vi.mocked(usersService.getUserById).mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                system_role: 'user',
                password: 'hashed-old-password',
            })

            const response = await request(app)
                .post('/api/change-password')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    oldPassword: 'oldPassword123!',
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'DifferentPassword123!',
                })

            expect(response.status).toBe(400)
        })

        it('should return 400 when old password is incorrect', async () => {
            vi.mocked(authUtils.validatePassword).mockResolvedValue(false)

            const response = await request(app)
                .post('/api/change-password')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    oldPassword: 'wrongPassword123!',
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!',
                })

            expect(response.status).toBe(400)
        })

        it('should return 401 when token is missing', async () => {
            const response = await request(app)
                .post('/api/change-password')
                .send({
                    oldPassword: 'oldPassword123!',
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!',
                })

            expect(response.status).toBe(401)
        })
    })

    describe('POST /api/forgot-password', () => {
        it('should send password reset email successfully', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                system_role: 'user',
                password: 'hashed',
            }

            vi.mocked(usersService.getUser).mockResolvedValue(mockUser)
            vi.mocked(totpUtils.generateTOTP).mockReturnValue('123456')
            vi.mocked(mailUtils.loadMailHTML).mockResolvedValue(
                '<html>Reset code: 123456</html>',
            )
            vi.mocked(mailUtils.sendEmail).mockResolvedValue(undefined)

            const response = await request(app)
                .post('/api/forgot-password')
                .send({
                    email: 'test@example.com',
                })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(mailUtils.sendEmail).toHaveBeenCalled()
        })

        it('should return 400 when email is missing', async () => {
            const response = await request(app)
                .post('/api/forgot-password')
                .send({})

            expect(response.status).toBe(400)
        })

        it('should return 400 when email format is invalid', async () => {
            const response = await request(app)
                .post('/api/forgot-password')
                .send({
                    email: 'invalid-email',
                })

            expect(response.status).toBe(400)
        })

        it('should return 400 when user is not found', async () => {
            vi.mocked(usersService.getUser).mockResolvedValue(null)

            const response = await request(app)
                .post('/api/forgot-password')
                .send({
                    email: 'notfound@example.com',
                })

            expect(response.status).toBe(400)
        })
    })

    describe('POST /api/reset-password', () => {
        it('should reset password successfully', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                system_role: 'user',
                password: 'hashed',
            }

            vi.mocked(usersService.getUserById).mockResolvedValue(mockUser)
            vi.mocked(totpUtils.validateTOTP).mockReturnValue(true)
            vi.mocked(authUtils.hashPassword).mockResolvedValue(
                'hashed-new-password',
            )
            vi.mocked(usersService.updatePassword).mockResolvedValue(
                'hashed-new-password',
            )

            const response = await request(app)
                .post('/api/reset-password')
                .send({
                    id: 'user-1',
                    code: '123456',
                    password: 'NewPassword123!',
                })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
        })

        it('should return 400 when fields are missing', async () => {
            const response = await request(app)
                .post('/api/reset-password')
                .send({
                    id: 'user-1',
                    code: '123456',
                })

            expect(response.status).toBe(400)
        })

        it('should return 400 when user is not found', async () => {
            vi.mocked(usersService.getUserById).mockResolvedValue(null)

            const response = await request(app)
                .post('/api/reset-password')
                .send({
                    id: 'invalid-user',
                    code: '123456',
                    password: 'NewPassword123!',
                })

            expect(response.status).toBe(400)
        })

        it('should return 400 when TOTP code is invalid', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                system_role: 'user',
                password: 'hashed',
            }

            vi.mocked(usersService.getUserById).mockResolvedValue(mockUser)
            vi.mocked(totpUtils.validateTOTP).mockReturnValue(false)

            const response = await request(app)
                .post('/api/reset-password')
                .send({
                    id: 'user-1',
                    code: 'wrong-code',
                    password: 'NewPassword123!',
                })

            expect(response.status).toBe(400)
        })

        it('should return 400 when password format is invalid', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                system_role: 'user',
                password: 'hashed',
            }

            vi.mocked(usersService.getUserById).mockResolvedValue(mockUser)
            vi.mocked(totpUtils.validateTOTP).mockReturnValue(true)

            const response = await request(app)
                .post('/api/reset-password')
                .send({
                    id: 'user-1',
                    code: '123456',
                    password: 'weak',
                })

            expect(response.status).toBe(400)
        })
    })
})
