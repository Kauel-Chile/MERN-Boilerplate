export interface User {
    _id: string
    firstName: string
    lastName: string
    fullName: string
    name: string
    email: string
    password: string
    emailVerifiedAt: Date | null
    createdAt: Date
    updatedAt: Date
}
