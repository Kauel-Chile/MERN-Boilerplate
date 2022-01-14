const environment: string = process.env.NODE_ENV || 'development'
const port: number = parseInt(process.env.PORT) || 5000
const locale: string = process.env.DEFAULT_LANGUAGE || 'es'
const url = process.env.URL || `http://localhost:${port}`
const platformName = process.env.PLATFORM_NAME || 'MERN Boilerplate'

const env = { environment, port, locale, url, platformName }

export { environment, port, locale, url, platformName }
export default env
