import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import request from 'supertest'
import { App } from '@/app'
import { LoginUserDto } from '@dtos/users.dto'
import { CreateOrgDto, UpdateOrgDto } from '@/dtos/organizations.dto'
import organizationModel from '@/models/organizations.model'
import { logger } from '@/utils/logger'
import userModel from '@/models/users.model'

afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
})

beforeAll(async () => {
    const loggerMock = logger
    loggerMock.error = jest.fn().mockReturnValue(null)
})

let token: string
let tokenWithOutPermission: string

const fullTestUser = {
    emailVerifiedAt: null,
    roles: ['61f7f6b2e299444350796a6e'],
    _id: '61f7f6b2e299444350796a6a',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'test@yopmail.com',
    password: '$2b$10$jOzZ0dL6wtGsEGldKfhxR.t/Zjxk0wFJW2LgCprpsM1U.DwvhMobi',
    fullName: 'Super Admin',
    name: 'Super Admin',
    id: '61f7f6b2e299444350796a6a'
}

const roleTest = [
    {
        _id: '61f7f6b2e299444350796a6e',
        name: 'SuperAdmin',
        resources: {
            User: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*']
            },
            RolePermission: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*']
            },
            OrganizationPermission: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*']
            }
        }
    }
]

const roleTest2 = [
    {
        _id: '61f7f6b2e299444350796a6c',
        name: 'user',
        organizationId: {
            _id: '61f7f6c6e299444350796a75',
            name: 'orgTest1',
            description: 'description test'
        },
        resources: {
            User: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*']
            },
            RolePermission: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*']
            }
        }
    }
]

const concatRoles = [...roleTest, ...roleTest2]
const AuthPath = '/'
const OrgPath = '/api/organizations'
const app = new App()

describe('Testing Users with Login (SuperAdmin)', () => {
    beforeAll(async () => {
        const userData: LoginUserDto = {
            email: 'test@yopmail.com',
            password: 'Yourpassword1'
        }
        const users = userModel
        // find user and populate
        users.findById = jest
            .fn()
            .mockReturnValue({
                _id: '61f7f6b2e299444350796a6a',
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10),
                roles: ['61f7f6b2e299444350796a6e']
            })
            .mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue({ ...fullTestUser, roles: concatRoles })
            }))
        ;(mongoose as any).connect = jest.fn()
        users.findOne = jest.fn().mockReturnValue({
            _id: '61f7f6b2e299444350796a6a',
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10),
            roles: ['61f7f6b2e299444350796a6e']
        })
        ;(mongoose as any).connect = jest.fn()

        // login plus save token
        return request(app.getServer())
            .post(`${AuthPath}login`)
            .send(userData)
            .expect('Set-Cookie', /^Authorization=.+/)
            .then(response => {
                token = response.body.token // save the token!
            })
    })

    describe('[Post] /organizations/createOrg', () => {
        it('response create organization', async () => {
            const orgData: CreateOrgDto = {
                name: 'OrganizationTest',
                description: 'Description Test'
            }

            organizationModel.findOne = jest.fn().mockReturnValue(null)
            organizationModel.create = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: orgData.name,
                description: orgData.description
            })
            ;(mongoose as any).connect = jest.fn()
            return request(app.getServer())
                .post(`${OrgPath}/createOrg`)
                .send(orgData)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
        })
    })

    describe('[PUT] /organizations/update/organization/:organizationId', () => {
        it('response Update Organization', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const orgData: UpdateOrgDto = {
                name: 'OrganizationTest',
                description: 'Description Test'
            }

            organizationModel.findByIdAndUpdate = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: orgData.name,
                description: orgData.description
            })
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .put(`${OrgPath}/update/organization/${organizationId}`)
                .send(orgData)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /organizations/getOrganizations', () => {
        it('response findAll Organizations', async () => {
            organizationModel.find = jest.fn().mockReturnValue([
                {
                    name: 'OrganizationTest',
                    description: 'Description Test'
                },
                {
                    name: 'OrganizationTest2',
                    description: 'Description Test'
                }
            ])
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .get(`${OrgPath}/getOrganizations`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /organizations/getMyOrganizations', () => {
        it('response find organizations by header', async () => {
            return request(app.getServer())
                .get(`${OrgPath}/getMyOrganizations`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[DELETE] /organizations/delete/organization/:organizationId', () => {
        it('response deleted organization', async () => {
            const organizationId = '61f7f6c6e299444350796a75'

            organizationModel.findByIdAndDelete = jest.fn().mockReturnValue({
                _id: organizationId,
                name: 'OrganizationTest',
                description: 'Description Test'
            })
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .delete(`${OrgPath}/delete/organization/${organizationId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })
})

describe('Testing Users without Login', () => {
    describe('[Post] /organizations/createOrg', () => {
        it('response Wrong authentication token', async () => {
            const orgData: CreateOrgDto = {
                name: 'OrganizationTest',
                description: 'Description Test'
            }

            return request(app.getServer()).post(`${OrgPath}/createOrg`).send(orgData).expect(401)
        })
    })

    describe('[PUT] /organizations/update/organization/:organizationId', () => {
        it('response Wrong authentication token', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const orgData: UpdateOrgDto = {
                name: 'OrganizationTest',
                description: 'Description Test'
            }
            return request(app.getServer())
                .put(`${OrgPath}/update/organization/${organizationId}`)
                .send(orgData)
                .expect(401)
        })
    })

    describe('[GET] /organizations/getOrganizations', () => {
        it('response Wrong authentication token', async () => {
            return request(app.getServer()).get(`${OrgPath}/getOrganizations`).expect(401)
        })
    })

    describe('[GET] /organizations/getMyOrganizations', () => {
        it('response Wrong authentication token', async () => {
            return request(app.getServer()).get(`${OrgPath}/getMyOrganizations`).expect(401)
        })
    })

    describe('[DELETE] /organizations/delete/organization/:organizationId', () => {
        it('response Wrong authentication token', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            return request(app.getServer()).delete(`${OrgPath}/delete/organization/${organizationId}`).expect(401)
        })
    })
})

describe('Testing Users with Login without permission', () => {
    beforeAll(async () => {
        const userData: LoginUserDto = {
            email: 'test@yopmail.com',
            password: 'Yourpassword1'
        }
        const users = userModel
        // find user and populate
        users.findById = jest
            .fn()
            .mockReturnValue({
                _id: '61f7f6b2e299444350796a6a',
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10),
                roles: ['']
            })
            .mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue({ ...fullTestUser, roles: [''] })
            }))
        ;(mongoose as any).connect = jest.fn()
        users.findOne = jest.fn().mockReturnValue({
            _id: '61f7f6b2e299444350796a6a',
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10),
            roles: ['']
        })
        ;(mongoose as any).connect = jest.fn()
        // login plus save token
        return request(app.getServer())
            .post(`${AuthPath}login`)
            .send(userData)
            .expect('Set-Cookie', /^Authorization=.+/)
            .then(response => {
                tokenWithOutPermission = response.body.token // save the token!
            })
    })

    describe('[Post] /organizations/createOrg', () => {
        it('response ', async () => {
            const orgData: CreateOrgDto = {
                name: 'OrganizationTest',
                description: 'Description Test'
            }

            return request(app.getServer())
                .post(`${OrgPath}/createOrg`)
                .send(orgData)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[PUT] /organizations/update/organization/:organizationId', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const orgData: UpdateOrgDto = {
                name: 'OrganizationTest',
                description: 'Description Test'
            }
            return request(app.getServer())
                .put(`${OrgPath}/update/organization/${organizationId}`)
                .send(orgData)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /organizations/getOrganizations', () => {
        it('response You do not have enough permission to perform this action', async () => {
            return request(app.getServer())
                .get(`${OrgPath}/getOrganizations`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /organizations/getMyOrganizations', () => {
        it('response find organizations by header', async () => {
            return request(app.getServer())
                .get(`${OrgPath}/getMyOrganizations`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(200)
        })
    })

    describe('[DELETE] /organizations/delete/organization/:organizationId', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            return request(app.getServer())
                .delete(`${OrgPath}/delete/organization/${organizationId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })
})
