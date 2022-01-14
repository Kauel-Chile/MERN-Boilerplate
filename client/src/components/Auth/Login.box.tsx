import axios from 'axios'
import { useState, ChangeEvent, FormEvent } from 'react'
import { Button, Form } from 'react-bootstrap'
import './Auth.scss'

export default function LoginBox() {
    const [inputs, setInputs] = useState({})
    const [error, setError] = useState<boolean>(false)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setInputs(values => ({ ...values, [name]: value }))
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        axios
            .post('/api/auth/login', inputs)
            .then(res => {
                console.log(res)
            })
            .catch(err => {
                console.log(err)
                setError(true)
            })
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    autoComplete="username"
                    isInvalid={error}
                    onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">Wrong credentials.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    name="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    onChange={handleChange}
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
            <p className="forgot-password text-right">
                <a href="/forgot-password">Forgot password?</a>
            </p>
        </Form>
    )
}
