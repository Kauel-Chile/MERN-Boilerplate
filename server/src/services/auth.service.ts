import { env, keys } from '@configs/index'
import { CreateUserDto } from '@dtos/users.dto'
import { HttpException } from '@exceptions/HttpException'
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface'
import { User } from '@interfaces/users.interface'
import userModel from '@models/users.model'
import { asset, frontendAsset, isEmpty } from '@utils/util'
import bcrypt from 'bcrypt'
import { __ } from 'i18n'
import jwt from 'jsonwebtoken'
import { sendHTMLEmail } from './email.service'
import { logger } from '@/utils/logger'
import { generateHTML } from '@/utils/html'
import path from 'path'

class AuthService {
    public users = userModel

    public async signup(
        userData: CreateUserDto,
        locale: string = env.locale
    ): Promise<{ cookie: string; createdUser: User }> {
        if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

        const findUser: User = await this.users.findOne({ email: userData.email })
        if (findUser)
            throw new HttpException(
                409,
                __({ phrase: 'Email {{email}} already exists', locale }, { email: userData.email })
            )

        const hashedPassword = await bcrypt.hash(userData.password, 10)
        const createUserData: User = await this.users.create({ ...userData, password: hashedPassword })

        const loginToken = this.createToken(createUserData)
        const cookie = this.createCookie(loginToken)

        const verificationToken = this.createToken(createUserData, 0)
        const args = {
            fullName: createUserData.fullName,
            email: createUserData.email,
            verifyLink: asset(`/verify?token=${verificationToken.token}`),
            platformURL: env.url,
            platformName: env.platformName
        }
        sendHTMLEmail(
            createUserData.email,
            __({ phrase: 'Verify your email', locale }),
            generateHTML(path.join(__dirname + `/../email.templates/verify.email.template/${locale}.html`), args),
            { attachments: [{ filename: 'logo.png', path: frontendAsset('images/logo.png'), cid: 'logo' }] }
        ).catch(err => logger.error(__({ phrase: err.message, locale })))

        return { cookie, createdUser: createUserData }
    }

    public async login(
        userData: CreateUserDto,
        locale: string = env.locale
    ): Promise<{ cookie: string; findUser: User }> {
        if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

        const findUser: User = await this.users.findOne({ email: userData.email })
        if (!findUser)
            throw new HttpException(409, __({ phrase: 'Email {{email}} not found', locale }, { email: userData.email }))

        const isPasswordMatching: boolean = await bcrypt.compare(userData.password, findUser.password)
        if (!isPasswordMatching) throw new HttpException(409, __({ phrase: 'Wrong password', locale }))

        const tokenData = this.createToken(findUser)
        const cookie = this.createCookie(tokenData)

        return { cookie, findUser }
    }

    public async logout(userData: User, locale: string = env.locale): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

        const findUser: User = await this.users.findOne({ email: userData.email, password: userData.password })
        if (!findUser)
            throw new HttpException(409, __({ phrase: 'Email {{email}} not found', locale }, { email: userData.email }))

        return findUser
    }

    public async verifyUserEmail(userId: string, locale: string = env.locale): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))

        let findUser = await this.users.findOne({ _id: userId })
        if (!findUser) throw new HttpException(409, __({ phrase: 'User not found', locale }))

        findUser.emailVerifiedAt = new Date()
        findUser = await findUser.save()
        if (!findUser) throw new HttpException(409, __({ phrase: 'Unable to update user', locale }))

        return findUser
    }

    /**
     * Initiates reset password process for a given email
     * @param {*} email Email for which to initiate the reset password process
     * @returns Object, data to generate email to send (reset token, fullname, email)
     */
    public async forgotPassword(email: string, locale: string = env.locale): Promise<User> {
        const findUser: User = await this.users.findOneAndUpdate(
            { email },
            { updatedAt: new Date() },
            { new: true, timestamps: false }
        )
        if (isEmpty(findUser))
            throw new HttpException(409, __({ phrase: 'Email {{email}} not found', locale }, { email }))
        const resetToken = this.createToken(findUser)
        const args = {
            fullName: findUser.fullName,
            resetLink: asset(`/reset-password?token=${resetToken.token}`)
        }
        await sendHTMLEmail(
            findUser.email,
            __({ phrase: 'Reset your password', locale }),
            generateHTML(path.join(__dirname + `/../email.templates/reset.password.template/${locale}.html`), args),
            { attachments: [{ filename: 'logo.png', path: frontendAsset('images/logo.png'), cid: 'logo' }] }
        ).catch(err => logger.error(__({ phrase: err.message, locale })))

        return findUser
    }

    /**
     * Resets password for a given token
     * @param {string} token Token to reset password
     * @param {string} password New password
     * @returns {User} data of the updated user
     */
    public async resetPassword(token: string, password: string, locale: string = env.locale): Promise<User> {
        if (isEmpty(token)) throw new HttpException(400, __({ phrase: 'Token is required', locale }))
        if (isEmpty(password)) throw new HttpException(400, __({ phrase: 'Password is required', locale }))

        const tokenData: DataStoredInToken = this.verifyToken(token)
        if (!tokenData) throw new HttpException(409, __({ phrase: 'Invalid token', locale }))

        const hashedPassword = await bcrypt.hash(password, 10)

        const findUser: User = await this.users.findOneAndUpdate(
            { _id: tokenData._id },
            { password: hashedPassword },
            { new: true }
        )
        if (!findUser) throw new HttpException(409, __({ phrase: 'User not found', locale }))
        return findUser
    }

    public createToken(user: User, expiresIn: number = 3600): TokenData {
        const dataStoredInToken: DataStoredInToken = { _id: user._id }
        const secretKey: string = keys.secretKey

        return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) }
    }

    public verifyToken(token: string, ignoreExpiration: boolean = false): DataStoredInToken {
        const secretKey: string = keys.secretKey

        return jwt.verify(token, secretKey, { ignoreExpiration }) as DataStoredInToken
    }

    public createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`
    }
}

export default AuthService
