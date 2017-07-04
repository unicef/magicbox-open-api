import a127 from 'a127-magic'
import SwaggerExpress from 'swagger-express-mw'
import SwaggerUi from 'swagger-tools/middleware/swagger-ui'
import compression from 'compression'
import express from 'express'

const config = {
  appRoot: __dirname,
  port: process.env.PORT || 8000
}

const app = express()

app.use(compression())

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

export default app
