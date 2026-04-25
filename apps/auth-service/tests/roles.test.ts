import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import * as usersService from '../src/services/users.service.js'
import * as systemRolesService from '../src/services/system_roles.service.js'
import * as resourceRolesService from '../src/services/resource_roles.service.js'
import * as authUtils from '@agm454-ua/auth-utils'

// Mock the services
vi.mock('../src/services/users.service.js')
vi.mock('../src/services/system_roles.service.js')
vi.mock('../src/services/resource_roles.service.js')
vi.mock('@agm454-ua/auth-utils', async () => {
    const actual = await vi.importActual('@agm454-ua/auth-utils')
    return {
        ...actual,
        validateToken: vi.fn(),
    }
})

const ADMIN_ROLE_ID = 'role-admin-id'
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

describe('Roles Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /api/users/roles', () => {
        it('should list system roles for admin', async () => {
            const mockPayload = {
                userId: 'admin-1',
                systemRole: ADMIN_ROLE_ID,
            }

            const mockRoles = [
                { id: 'role-1', name: 'admin', description: '' },
                { id: 'role-2', name: 'user', description: '' },
            ]

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('admin-1', ADMIN_ROLE_ID, 'admin'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(systemRolesService.listSystemRoles).mockResolvedValue(
                mockRoles,
            )

            const response = await request(app)
                .get('/api/users/roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toEqual(mockRoles)
        })

        it('should return 401 when user is not admin', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })

            const response = await request(app)
                .get('/api/users/roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(401)
        })

        it('should return 401 when token is missing', async () => {
            const response = await request(app).get('/api/users/roles')

            expect(response.status).toBe(401)
        })
    })

    describe('GET /api/users/:userId/roles', () => {
        it('should get user system role for same user', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.getUserRole).mockResolvedValue(USER_ROLE_ID)

            const response = await request(app)
                .get('/api/users/user-1/roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toBe(USER_ROLE_ID)
        })

        it('should get user system role for admin', async () => {
            const mockPayload = {
                userId: 'admin-1',
                systemRole: ADMIN_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('admin-1', ADMIN_ROLE_ID, 'admin'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.getUserRole).mockResolvedValue(USER_ROLE_ID)

            const response = await request(app)
                .get('/api/users/user-1/roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
        })

        it('should return 401 when user is not admin or self', async () => {
            const mockPayload = {
                userId: 'user-2',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-2', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.getUserRole).mockResolvedValue(USER_ROLE_ID)

            const response = await request(app)
                .get('/api/users/user-1/roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(401)
        })

        it('should return 400 when userId is missing', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))

            const response = await request(app)
                .get('/api/users//roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(404)
        })
    })

    describe('POST /api/users/:userId/roles/:role', () => {
        it('should set user system role for admin', async () => {
            const mockPayload = {
                userId: 'admin-1',
                systemRole: ADMIN_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('admin-1', ADMIN_ROLE_ID, 'admin'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.updateUserSystemRole).mockResolvedValue(
                'moderator',
            )

            const response = await request(app)
                .post('/api/users/user-1/roles/moderator')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
        })

        it('should return 401 when user is not admin', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })

            const response = await request(app)
                .post('/api/users/user-1/roles/moderator')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(401)
        })
    })

    describe('GET /api/resource/:resourceId/roles', () => {
        it('should list resource permissions for owner', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            const mockPermissions = [
                {
                    resourceRoleId: 'rr-1',
                    roleName: 'owner',
                    userId: 'user-1',
                    username: 'user1',
                    email: 'user1@example.com',
                    resourceName: 'my-resource',
                },
                {
                    resourceRoleId: 'rr-2',
                    roleName: 'viewer',
                    userId: 'user-2',
                    username: 'user2',
                    email: 'user2@example.com',
                    resourceName: 'my-resource',
                },
            ]

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                true,
            )
            vi.mocked(
                resourceRolesService.listResourcePermissions,
            ).mockResolvedValue(mockPermissions)

            const response = await request(app)
                .get('/api/resource/resource-1/roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toEqual(mockPermissions)
        })

        it('should return 401 when user is not owner', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                false,
            )

            const response = await request(app)
                .get('/api/resource/resource-1/roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(401)
        })

        it('should return 400 when resourceId is missing', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))

            const response = await request(app)
                .get('/api/resource//roles')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(404)
        })
    })

    describe('GET /api/resource/:resourceId/roles/:userId', () => {
        it('should get user resource role for owner', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            const mockRole = {
                userId: 'user-2',
                role: 'viewer',
                resourceRoleId: 'rrid-1',
                roleName: 'rr-name-1',
                username: 'username-1',
                email: 'email-1@example.com',
                resourceName: 'resource-name-test-1',
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.getUserRole).mockResolvedValue(USER_ROLE_ID)
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                true,
            )
            vi.mocked(
                resourceRolesService.getUserResourceRole,
            ).mockResolvedValue(mockRole)

            const response = await request(app)
                .get('/api/resource/resource-1/roles/user-2')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(
                resourceRolesService.getUserResourceRole,
            ).toHaveBeenCalledWith(
                'resource-1',
                'user-2', // Should be called with targetUser, not the requesting user
            )
        })

        it('should get user resource role for self', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            const mockRole = {
                userId: 'user-1',
                role: 'viewer',
                resourceRoleId: 'rrid-1',
                roleName: 'rr-name-1',
                username: 'username-1',
                email: 'email-1@example.com',
                resourceName: 'resource-name-test-1',
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.getUserRole).mockResolvedValue(USER_ROLE_ID)
            vi.mocked(
                resourceRolesService.getUserResourceRole,
            ).mockResolvedValue(mockRole)

            const response = await request(app)
                .get('/api/resource/resource-1/roles/user-1')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(
                resourceRolesService.getUserResourceRole,
            ).toHaveBeenCalledWith('resource-1', 'user-1')
        })

        it('should return 401 when user lacks permission', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.getUserRole).mockResolvedValue(USER_ROLE_ID)
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                false,
            )

            const response = await request(app)
                .get('/api/resource/resource-1/roles/user-2')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(401)
        })
    })

    describe('POST /api/resource/:resourceId/roles/:userId', () => {
        it('should assign role to resource for owner', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.getUserRole).mockResolvedValue(USER_ROLE_ID)
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                true,
            )
            vi.mocked(
                resourceRolesService.assignUserRoleToResource,
            ).mockResolvedValue({
                userId: 'user-2',
                resourceRoleId: 'role-1',
                resourceId: 'resource-1',
            })

            const response = await request(app)
                .post('/api/resource/resource-1/roles/user-2')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    role: 'viewer',
                })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
        })

        it('should return 400 when role is missing', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                true,
            )

            const response = await request(app)
                .post('/api/resource/resource-1/roles/user-2')
                .set('Authorization', 'Bearer mock-token')
                .send({})

            expect(response.status).toBe(400)
        })

        it('should return 401 when user is not owner', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                false,
            )

            const response = await request(app)
                .post('/api/resource/resource-1/roles/user-2')
                .set('Authorization', 'Bearer mock-token')
                .send({
                    role: 'viewer',
                })

            expect(response.status).toBe(401)
        })
    })

    describe('DELETE /api/resource/:resourceId/roles/:userId', () => {
        it('should remove user role from resource for owner', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(systemRolesService.getAdminRole).mockResolvedValue({ id: ADMIN_ROLE_ID, name: 'admin' })
            vi.mocked(usersService.getUserRole).mockResolvedValue(USER_ROLE_ID)
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                true,
            )
            vi.mocked(
                resourceRolesService.deleteUserRoleFromResource,
            ).mockResolvedValue({
                userId: 'user-2',
                resourceRoleId: 'role-1',
                resourceId: 'resource-1',
            })

            const response = await request(app)
                .delete('/api/resource/resource-1/roles/user-2')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
        })

        it('should return 400 when fields are missing', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                true,
            )

            const response = await request(app)
                .delete('/api/resource//roles/user-2')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(404)
        })

        it('should return 401 when user is not owner', async () => {
            const mockPayload = {
                userId: 'user-1',
                systemRole: USER_ROLE_ID,
            }

            vi.mocked(authUtils.validateToken).mockReturnValue(mockPayload)
            vi.mocked(usersService.getUserById).mockResolvedValue(buildUserData('user-1', USER_ROLE_ID, 'user'))
            vi.mocked(resourceRolesService.isOwnerOfResource).mockResolvedValue(
                false,
            )

            const response = await request(app)
                .delete('/api/resource/resource-1/roles/user-2')
                .set('Authorization', 'Bearer mock-token')

            expect(response.status).toBe(401)
        })
    })
})


