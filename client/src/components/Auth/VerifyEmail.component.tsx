import { useLocation } from 'react-router-dom'
import { ReactElement, useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'

export default function VerifyEmailComponent() {
    const search = useLocation().search
    const token: string | null = new URLSearchParams(search).get('token')
    const [text, setText] = useState<ReactElement>(<h2>Verifying...</h2>)

    useEffect(() => {
        if (token) {
            axios
                .post('/api/auth/verify', { token })
                .then(res => {
                    if (res.status === 200) setText(<h2>Verified</h2>)
                    else setText(<h2>Invalid token</h2>)
                })
                .catch((err: AxiosError) => {
                    setText(
                        <div>
                            <h2>Error</h2>
                            <p>{err.response?.data?.message || err.message}</p>
                        </div>
                    )
                })
        } else {
            setText(<h2>Token must be provided</h2>)
        }
    }, [token])

    return text
}
