'use strict';

/*
 * Node.js entry point for Swagger Docs
*/

var path = require('path');
var serveStatic = require('serve-static');

module.exports = {

  /*
   * A connect middle-ware for using Swagger Docs with Express
   * @param {object} spec - The Swagger spec document
   * @param {objecg} options - Swagger middleware options
   * @param {object} config - The SwaggerDocs configuration object
  */
  middleWare: function swaggerDocs(spec, options, config) {

    // Swagger Docs static files path
    var docsPath = path.join(__dirname, '..', 'dist');

    // Defaulting config argument
    if (config === undefined) {
      config = {loadSwaggerFrom: './swagger.json'};
    }


    // Defaulting options argument
    options = options || {};
    options.path = typeof options.path === 'string' ? options.path : '/docs';

    // Generate the static middleware
    var staticMiddleWare = serveStatic(docsPath, {'index': 'index.html'});

    return function swaggerDocsMiddleWare(req, res, next) {

      // if request path is stating with options.path serve static content
      if (req.url.indexOf(options.path) === 0) {
        req.url = req.url.replace(new RegExp('^' + options.path), '') || '/';

        // Serve config.json from provided config object
        if (req.url === '/config.json') {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(config));
        }

        // Serve swagger.json from provided swagger spec
        if (req.url === '/swagger.json') {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(spec));
        }

        staticMiddleWare(req, res, next);

      // otherwise ignore this request and call next()
      } else {
        next();
      }
    };
  }
};
