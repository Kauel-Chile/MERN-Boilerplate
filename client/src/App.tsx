import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navbar } from './components'
import { Auth, Miscelaneous } from './pages'

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Miscelaneous.HomePage />} />
                    <Route path="/about" element={<Miscelaneous.AboutPage />} />
                    <Route path="/contact" element={<Miscelaneous.ContactPage />} />
                    <Route path="/login" element={<Auth.LoginPage />} />
                    <Route path="/register" element={<Auth.RegisterPage />} />
                    <Route path="/forgot-password" element={<Auth.ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<Auth.ResetPasswordPage />} />
                    <Route path="/verify" element={<Auth.VerifyEmailPage />} />
                    <Route path="*" element={<Miscelaneous.NotFoundPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}
