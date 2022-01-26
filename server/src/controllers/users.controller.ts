import { locale } from '@configs/env'
import { CreateUserDto } from '@dtos/users.dto'
import { User } from '@interfaces/users.interface'
import userService from '@services/users.service'
import { NextFunction, Request, Response } from 'express'

class UsersController {
    public userService = new userService()

    public getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllUsersData: User[] = await this.userService.findAllUser()

            res.status(200).json({ data: findAllUsersData, message: 'findAll' })
        } catch (error) {
            next(error)
        }
    }

    public getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id
            const userLocale = req.cookies.Language || locale
            const findOneUserData: User = await this.userService.findUserById(userId, userLocale)

            res.status(200).json({ data: findOneUserData, message: 'findOne' })
        } catch (error) {
            next(error)
        }
    }

    public createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserDto = req.body
            const userLocale = req.cookies.Language || locale
            const createUserData: User = await this.userService.createUser(userData, userLocale)

            res.status(201).json({ data: createUserData, message: 'created' })
        } catch (error) {
            next(error)
        }
    }

    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id
            const userData: CreateUserDto = req.body
            const userLocale = req.cookies.Language || locale
            const updateUserData: User = await this.userService.updateUser(userId, userData, userLocale)

            res.status(200).json({ data: updateUserData, message: 'updated' })
        } catch (error) {
            next(error)
        }
    }

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id
            const userLocale = req.cookies.Language || locale
            const deleteUserData: User = await this.userService.deleteUser(userId, userLocale)

            res.status(200).json({ data: deleteUserData, message: 'deleted' })
        } catch (error) {
            next(error)
        }
    }
}

export default UsersController
