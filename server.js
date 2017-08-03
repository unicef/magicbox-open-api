import SwaggerExpress from 'swagger-express-mw'
import SwaggerUi from 'swagger-tools/middleware/swagger-ui'
import SwaggerSecurity from 'swagger-tools/middleware/swagger-security'
import volosCache from 'volos-cache-memory'
import compression from 'compression'
import express from 'express'
import * as auth from './api/helpers/auth'


const VOLOS_RESOURCE = 'x-volos-resources'
import requestIp from 'request-ip'
import * as logger from './api/helpers/logger'

const config = {
  appRoot: __dirname,
  port: process.env.PORT || 8000,
  swaggerSecurityHandlers: { Bearer: auth.verifyToken }
}

const app = express()

app.use(compression())

app.use(requestIp.mw())

app.use(logger.logRequest)

SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) {
    throw err
  }

  let cacheOptions = swaggerExpress.runner.swagger[VOLOS_RESOURCE].cache.options
  let cacheName = swaggerExpress.runner.swagger[VOLOS_RESOURCE].cache.name
  let cache = volosCache.create(cacheName, cacheOptions)
  cacheOptions.key = getCacheKey
  app.use(cache.expressMiddleware().cache(cacheOptions))


  // eliminate path that has x-hide property
    let paths = swaggerExpress.runner.swagger.paths
    let new_paths = Object.keys(paths).reduce((obj, path) => {
      if (!paths[path]['x-hide']) {
        obj[path] = paths[path]
      }
      return obj
    }, {})

    swaggerExpress.runner.swagger.paths = new_paths

  app.use(SwaggerUi(swaggerExpress.runner.swagger))

  // Serve the Swagger documents and Swagger UI
  // app.use(swaggerExpress.runner.swaggerTools.swaggerUi());
  // install middleware

  swaggerExpress.register(app)

  app.listen(config.port, () => {
    console.log(`Open maps API is up on http://localhost:${config.port}`)
  })
})


const getCacheKey = (req) => {
  let cacheKey
  let url = req.originalUrl
  if (url.substring(url.length - 1) === '/') {
    url = url.substring(0, url.length - 1)
  }
  let urlParts = url.split('/')
  cacheKey = urlParts[3]

  urlParts.slice(4, urlParts.length).forEach(part => {
    cacheKey += '_' + part
  })

  return cacheKey
}


export default app
