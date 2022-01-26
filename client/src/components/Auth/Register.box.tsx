import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import axios from 'axios'
import { Alert, Button, Form } from 'react-bootstrap'

interface IRegisterErrors {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
}

interface IRegisterInputs {
    firstName: string
    lastName?: string | undefined
    email: string
    password: string
    confirmPassword: string
}

export default function RegisterBox() {
    const [inputs, setInputs] = useState<IRegisterInputs>({
        firstName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | undefined>(undefined)
    const [error, setError] = useState<IRegisterErrors>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [registered, setRegistered] = useState<boolean>(false)
    const [remainingTime, setRemainingTime] = useState<number>(0)

    useEffect(() => {
        setPasswordsMatch(inputs.password !== '' ? inputs.password === inputs.confirmPassword : undefined)
    }, [inputs.password, inputs.confirmPassword])

    useEffect(() => {
        if (passwordsMatch === true) setError({ ...error, confirmPassword: undefined })
        else if (passwordsMatch === false) setError({ ...error, confirmPassword: 'Passwords do not match' })
    }, [passwordsMatch])

    useEffect(() => {
        if (remainingTime > 0) setTimeout(() => setRemainingTime(remainingTime - 1), 1000)
        else if (registered) window.location.href = '/'
    }, [remainingTime])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        if (name === 'lastName') setInputs(values => ({ ...values, lastName: value !== '' ? value : undefined }))
        else setInputs(values => ({ ...values, [name]: value }))
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        setIsLoading(true)
        const { confirmPassword, ...values } = inputs
        event.preventDefault()
        axios
            .post('/api/auth/signup', values)
            .then(res => {
                if (res.status === 201) {
                    setRegistered(true)
                    setRemainingTime(5)
                }
            })
            .catch(err => {
                const error_ = err.response.data
                if (/firstName/i.test(error_.message)) setError({ ...error, firstName: error_.message })
                if (/lastName/i.test(error_.message)) setError({ ...error, lastName: error_.message })
                if (/email/i.test(error_.message)) setError({ ...error, email: error_.message })
                if (/password/i.test(error_.message)) setError({ ...error, password: error_.message })
            })
            .finally(() => setIsLoading(false))
    }
    if (registered) {
        return (
            <Alert variant="success">
                Registered!. In {remainingTime} seconds you will be redirected to the login page.
            </Alert>
        )
    } else {
        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicFirstName">
                    <Form.Label>First name</Form.Label>
                    <Form.Control
                        required
                        name="firstName"
                        type="text"
                        placeholder="John"
                        minLength={2}
                        maxLength={20}
                        autoComplete="given-name"
                        isInvalid={error.firstName !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{error.firstName}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicLastName">
                    <Form.Label>Last name</Form.Label>
                    <Form.Control
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        minLength={2}
                        maxLength={20}
                        isInvalid={error.lastName !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        required
                        name="email"
                        type="email"
                        placeholder="john.doe@email.com"
                        autoComplete="username"
                        isInvalid={error.email !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{error.email}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        required
                        name="password"
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                        isInvalid={error.password !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{error.password}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPasswordConfirmation">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        required
                        name="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
                        isInvalid={error.confirmPassword !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{error.confirmPassword}</Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!passwordsMatch || isLoading}>
                    {isLoading ? 'Loading...' : 'Submit'}
                </Button>
            </Form>
        )
    }
}
