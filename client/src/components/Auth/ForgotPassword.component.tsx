import { useState, ChangeEvent, FormEvent } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import axios from 'axios'

export default function ForgotPasswordComponent() {
    const [email, setEmail] = useState<string>('')
    const [emailError, setEmailError] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [sent, setSent] = useState<boolean>(false)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        if (name === 'email') setEmail(value)
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        setIsLoading(true)
        event.preventDefault()
        axios
            .post('/api/auth/forgot-password', { email })
            .then(res => {
                if (res.status === 200) setSent(true)
            })
            .catch(err => {
                const error_ = err.response.data
                if (/email/i.test(error_.message)) setEmailError(error_.message)
            })
            .finally(() => setIsLoading(false))
    }

    if (sent) {
        return <Alert variant="success">Email sent!</Alert>
    } else {
        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        required
                        name="email"
                        type="email"
                        placeholder="john.doe@email.com"
                        autoComplete="username"
                        isInvalid={emailError !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Submit'}
                </Button>
            </Form>
        )
    }
}
