import a127 from 'a127-magic'
import SwaggerExpress from 'swagger-express-mw'
import SwaggerUi from 'swagger-tools/middleware/swagger-ui'
import compression from 'compression'
import express from 'express'
import requestIp from 'request-ip'
import * as logger from './api/helpers/logger'

const config = {
  appRoot: __dirname,
  port: process.env.PORT || 8000
}

const app = express()

app.use(compression())

app.use(requestIp.mw())

app.use(logger.logRequest)

a127.init(config => app.use(a127.middleware(config)))

SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) {
    throw err
  }

  app.use(SwaggerUi(swaggerExpress.runner.swagger))

  // Serve the Swagger documents and Swagger UI
  // app.use(swaggerExpress.runner.swaggerTools.swaggerUi());
  // install middleware

  swaggerExpress.register(app)

  app.listen(config.port, () => {
    console.log(`Open maps API is up on http://localhost:${config.port}`)
  })
})

// app.use((req, resp, next) => {
//   console.log(resp)
//   next()
// })

export default app
