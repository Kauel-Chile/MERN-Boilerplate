import env from './env'
import keys from './keys'
import dbConfig from './dbConfig'
import cors from './cors'
import log from './log'
import smtp from './smtp'

const config = {
    env,
    dbConfig,
    keys,
    log,
    cors,
    smtp
}

export { env, dbConfig, keys, log, cors, smtp }
export default config
