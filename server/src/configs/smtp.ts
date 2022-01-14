const host: string | undefined = process.env.SMTP_HOST
const port: number | undefined = parseInt(process.env.SMTP_PORT)
const user: string | undefined = process.env.SMTP_USER
const pass: string | undefined = process.env.SMTP_PASS
const from_name = process.env.SMTP_FROM_NAME
const from_email = process.env.SMTP_FROM_EMAIL
const smtpConfig = { host, port, user, pass, from_name, from_email }

export { host, port, user, pass, from_name, from_email }
export default smtpConfig
