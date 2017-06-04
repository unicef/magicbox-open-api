'use strict';
var a127 = require('a127-magic');
var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var compression = require('compression')
var app = require('express')();
app.use(compression());
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

a127.init(function(config) {
  app.use(a127.middleware(config));

});


SwaggerExpress.create(config, function(err, swaggerExpress) {

  if (err) { throw err; }
  app.use(SwaggerUi(swaggerExpress.runner.swagger));
  // Serve the Swagger documents and Swagger UI
  // app.use(swaggerExpress.runner.swaggerTools.swaggerUi());
  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8000; // first change
  app.listen(port);

  // if (swaggerExpress.runner.swagger.paths['/hello']) {
  //   console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  // }
});
