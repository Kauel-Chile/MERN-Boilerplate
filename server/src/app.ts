import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './configs'
import express, { Request, Response } /* { Router } */ from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import { connect, set } from 'mongoose'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { dbConnection } from '@databases'
import errorMiddleware from '@middlewares/error.middleware'
import { logger, stream } from '@utils/logger'
import i18n from 'i18n'
import AccessControlServices from '@services/accessControl.service'
import path from 'path'
import router from './routes/index.route'

process.env.SUPPRESS_NO_CONFIG_WARNING = 'true'

const app: express.Application = express()
const port = config.env.port
const env = config.env.environment
const locale = config.env.locale

const connectToDatabase = () => {
    if (env !== 'production') {
        set('debug', true)
    }
    connect(dbConnection.url, dbConnection.options, async () => {
        console.log('#######Conectado a: ', dbConnection.url)
        const user = await AccessControlServices.createSuperAdmin()
        await AccessControlServices.initAccessControl()
        console.log(user)
    })
}

const initializeMiddlewares = () => {
    if (env === 'development') {
        app.use(morgan(config.log.format, { stream }))
    }
    app.use(cors({ origin: config.cors.origin, credentials: config.cors.credentials }))
    app.use(hpp())
    app.use(compression())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser())
    configureI18n()
    app.use(i18n.init)
    initializeRoutes()
    app.use(express.static(path.resolve(__dirname, "../../client/build")));
    app.get('/*', (req: Request, res: Response) => {
        console.log(path.resolve(__dirname, "../../client/build", "index.html"))
        res.sendFile(path.resolve(__dirname, "../../client/build", "index.html"))
    })
    app.use(helmet())
}

const initializeRoutes = () => {
    app.use('/', router)
}

const configureI18n = () => {
    i18n.configure({
        // eslint-disable-next-line node/no-path-concat
        directory: __dirname + '/locales',
        defaultLocale: locale,
        queryParameter: 'language',
        cookie: 'language',
        register: global
    })
}

const initializeSwagger = () => {
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
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}

const initializeErrorHandling = () => {
    app.use(errorMiddleware)
}

const App = () => {
    connectToDatabase()
    initializeMiddlewares()
    initializeSwagger()
    initializeErrorHandling()
    app.listen(port, () => {
        logger.info(`=================================`)
        logger.info(`======= ENV: ${env} =======`)
        logger.info(`🚀 App listening on the port ${port}`)
        logger.info(`=================================`)
    })
}

export default App
