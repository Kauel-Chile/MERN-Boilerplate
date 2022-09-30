import request from 'supertest'
import { App } from '@/app'
import { disconnect } from 'mongoose'

afterAll(async () => {
    await disconnect()
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
})

describe('Testing Index', () => {
    describe('[GET] /', () => {
        it('response statusCode 200', () => {
            const app = new App()

            return request(app.getServer()).get(`/`).expect(200)
        })
    })
})
