process.env['SUPPRESS_NO_CONFIG_WARNING'] = 'true'

import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './configs'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import { connect, set } from 'mongoose'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { dbConnection } from '@databases'
import { Routes } from '@interfaces/routes.interface'
import errorMiddleware from '@middlewares/error.middleware'
import { logger, stream } from '@utils/logger'
import i18n from 'i18n'

class App {
    public app: express.Application
    public port: string | number
    public env: string
    public locale: string

    constructor(routes: Routes[]) {
        this.app = express()
        this.port = config.env.port
        this.env = config.env.environment
        this.locale = config.env.locale

        this.connectToDatabase()
        this.initializeMiddlewares()
        this.initializeRoutes(routes)
        this.initializeSwagger()
        this.initializeErrorHandling()
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`=================================`)
            logger.info(`======= ENV: ${this.env} =======`)
            logger.info(`🚀 App listening on the port ${this.port}`)
            logger.info(`=================================`)
        })
    }

    public getServer() {
        return this.app
    }

    private connectToDatabase() {
        if (this.env !== 'production') {
            set('debug', true)
        }

        connect(dbConnection.url, dbConnection.options)
    }

    private initializeMiddlewares() {
        if (this.env === 'dev') {
            this.app.use(morgan(config.log.format, { stream }))
        }
        this.app.use(cors({ origin: config.cors.origin, credentials: config.cors.credentials }))
        this.app.use(hpp())
        this.app.use(helmet())
        this.app.use(compression())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(cookieParser())

        this.configureI18n()
        this.app.use(i18n.init)
    }

    private initializeRoutes(routes: Routes[]) {
        routes.forEach(route => {
            this.app.use('/', route.router)
        })
    }

    private initializeSwagger() {
        const options = {
            swaggerDefinition: {
                info: {
                    title: 'REST API',
                    version: '1.0.0',
                    description: 'Example docs'
                }
            },
            apis: ['swagger.yaml']
        }

        const specs = swaggerJSDoc(options)
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware)
    }

    public configureI18n() {
        i18n.configure({
            directory: __dirname + '/locales',
            defaultLocale: this.locale,
            queryParameter: 'Language',
            cookie: 'Language',
            register: global
        })
    }
}

export default App
