import { locale } from '@configs/env'
import { CreateUserDto } from '@dtos/users.dto'
import { RequestWithUser } from '@interfaces/auth.interface'
import { User } from '@interfaces/users.interface'
import AuthService from '@services/auth.service'
import { NextFunction, Request, Response } from 'express'

class AuthController {
    public authService = new AuthService()

    public signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserDto = req.body
            const userLocale = req.cookies.Language || locale
            const { cookie, createdUser } = await this.authService.signup(userData, userLocale)

            res.setHeader('Set-Cookie', [cookie])
            res.status(201).json({ data: createdUser, message: 'signup' })
        } catch (error) {
            next(error)
        }
    }

    public logIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserDto = req.body
            const userLocale = req.cookies.Language || locale
            const { cookie, findUser } = await this.authService.login(userData, userLocale)

            res.setHeader('Set-Cookie', [cookie])
            res.status(200).json({ data: findUser, message: 'login' })
        } catch (error) {
            next(error)
        }
    }

    public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userData: User = req.user
            const userLocale = req.cookies.Language || locale
            const logOutUserData: User = await this.authService.logout(userData, userLocale)

            res.setHeader('Set-Cookie', ['Authorization=; Max-age=0'])
            res.status(200).json({ data: logOutUserData, message: 'logout' })
        } catch (error) {
            next(error)
        }
    }

    public verifyUserEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token: string = req.body?.token.toString()
            const userId: string = this.authService.verifyToken(token, true)._id
            const userLocale: string = req.cookies.Language || locale
            const verifyUserData: User = await this.authService.verifyUserEmail(userId, userLocale)

            res.status(200).json({ data: verifyUserData, message: 'verified' })
        } catch (error) {
            next(error)
        }
    }

    public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email: string = req.body?.email?.toString()
            const userLocale: string = req.cookies.Language || locale
            const resetUserPassword: User = await this.authService.forgotPassword(email, userLocale)

            res.status(200).json({ data: resetUserPassword, message: 'email sent' })
        } catch (error) {
            next(error)
        }
    }

    public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token: string = req.body?.token.toString()
            const password: string = req.body?.password?.toString()
            const userLocale: string = req.cookies.Language || locale
            const resetUserPassword: User = await this.authService.resetPassword(token, password, userLocale)

            res.status(200).json({ data: resetUserPassword, message: 'password reset' })
        } catch (error) {
            next(error)
        }
    }
}

export default AuthController
