import { sendEmail, sendHTMLEmail } from '@/services/email.service'
import { frontendAsset } from '@/utils/util'

beforeAll(async () => {
    jest.setTimeout(10000)
})

afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
})

describe('Testing email', () => {
    describe('Plain text with no attachments', () => {
        it('should send an email', async () => {
            let res
            try {
                res = await sendEmail('test@yopmail.com', 'Test subject', 'Test text')
            } finally {
                expect(res?.response).toBe('250 Great success')
            }
        })
    })

    describe('Plain text with photo attachment', () => {
        it('should send an email', async () => {
            let res
            try {
                res = await sendEmail('test@yopmail.com', 'Test subject', 'Test text', {
                    attachments: [{ filename: 'logo.png', path: frontendAsset('images/logo.png') }]
                })
            } finally {
                expect(res?.response).toBe('250 Great success')
            }
        })
    })

    describe('HTML with no attachments', () => {
        it('should send an email', async () => {
            let res
            try {
                res = await sendHTMLEmail(
                    'test@yopmail.com',
                    'Test subject',
                    '<h1>Test email</h1><p style="color: red;">Test text</p>'
                )
            } finally {
                expect(res?.response).toBe('250 Great success')
            }
        })
    })

    describe('HTML with photo attachment', () => {
        it('should send an email', async () => {
            let res
            try {
                res = await sendHTMLEmail(
                    'test@yopmail.com',
                    'Test subject',
                    '<h1>Test email</h1><p style="color: red;">Test text</p><img src="cid:logo" />',
                    {
                        attachments: [{ filename: 'logo.png', path: frontendAsset('images/logo.png'), cid: 'logo' }]
                    }
                )
            } finally {
                expect(res?.response).toBe('250 Great success')
            }
        })
    })
})
