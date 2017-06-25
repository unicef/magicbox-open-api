/****************************************************************************
 The MIT License (MIT)

 Copyright (c) 2014 Apigee Corporation

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
'use strict';

var CORS = require('cors');
var debug = require('debug')('a127');
var _ = require('lodash');
var YAML = require('js-yaml');

// default filter just drops all the x- labels
var DROP_SWAGGER_EXTENSIONS = /^(?!x-.*)/;

module.exports = middleware;

function middleware(config) {

  if (!config) { throw new Error('Config required. See https://github.com/apigee-127/magic/issues/3 for information.'); }

  var startConfig = config._a127_start_config || {};
  if (startConfig.debug && !process.env.DEBUG) {
    process.env.DEBUG = startConfig.debug;
  }

  var magic = config['a127.magic'];

  var controllers = [];
  var mainControllers = startConfig.mock ? magic.controllers.mocks : magic.controllers.controllers;
  if (mainControllers) {
    if (Array.isArray(mainControllers)) {
      controllers = controllers.concat(mainControllers);
    } else {
      controllers.push(mainControllers);
    }
  }
  controllers.push(magic.volosAuth.controllers);

  var routerConfig = {
    useStubs: startConfig.mock || magic.controllers.useStubs,
    controllers: controllers
  };

  var validatorConfig = {
    validateResponse: !!config.validateResponse
  };

  var swaggerTools = magic.swaggerTools;

  var getConfig = function(key) { return config[key]; };
  var a127Funcs = { resource: magic.resource, config: getConfig };

  var middlewares = [
    swaggerTools.swaggerMetadata(magic.swaggerObject),
    swaggerTools.swaggerSecurity(magic.volosAuth.swaggerSecurityHandlers),
    magic.volosAuth,
    swaggerTools.swaggerValidator(validatorConfig),
    magic.volosApp,
    addFuncsToRequest(a127Funcs),
    swaggerTools.swaggerRouter(routerConfig)
  ];

  // config options: https://www.npmjs.com/package/cors
  if (startConfig.corsOptions) {
    middlewares.unshift(CORS(startConfig.corsOptions));
  }

  if (config.docEndpoints) {

    var filter = DROP_SWAGGER_EXTENSIONS;
    if (config.docEndpoints.filter) {
      filter = new RegExp(config.docEndpoints.filter);
    }
    debug('swagger doc filter: %s', filter);
    var swaggerObject = filterKeysRecursive(magic.swaggerObject, filter);

    if (config.docEndpoints.raw) {
      middlewares.push(swaggerRaw(config.docEndpoints, swaggerObject));
    }
    if (config.docEndpoints.docs) {
      var swaggerDocs = require('swagger-docs');
      middlewares.push(swaggerDocs.middleWare(swaggerObject, { path: config.docEndpoints.docs }));
    }
  }

  return chain(middlewares);
}

// adds a127.resource(name) function to request
function addFuncsToRequest(a127Funcs) {
  return function(req, res, next) {
    req.a127 = a127Funcs;
    next();
  };
}

function chain(middlewares) {

  if (!middlewares || middlewares.length < 1) {
    return function(req, res, next) { next(); };
  }

  return function(req, res, next) {
    function createNext(middleware, index) {
      return function(err) {
        if (err) { return next(err); }

        var nextIndex = index + 1;
        var nextMiddleware = middlewares[nextIndex] ? createNext(middlewares[nextIndex], nextIndex) : next;
        middleware(req, res, nextMiddleware);
      };
    }
    return createNext(middlewares[0], 0)();
  };
}

function swaggerRaw(docEndpoints, filteredSwagger) {

  var rawDocPath = docEndpoints.raw;
  debug('swagger raw doc path: %s', rawDocPath);

  // should this just be based on accept type?
  var yaml = YAML.safeDump(filteredSwagger, { indent: 2 });
  var json = JSON.stringify(filteredSwagger, null, 2);

  return function swaggerDoc(req, res, next) {
    if (rawDocPath) {
      try {
        if (!req.path) {
          req.path = Url.parse(req.url).path
        }
        if (rawDocPath.indexOf(req.path) != -1) {
          if (req.headers['accept'].indexOf('yaml') != -1) {
            res.setHeader('Content-Type', 'application/yaml');
            return res.end(yaml);
          } else {
            res.setHeader('Content-Type', 'application/json');
            return res.end(json);
          }
        }
      } catch (err) {
        return next(err);
      }
    }
    next();
  };
}

function filterKeysRecursive(object, regex) {
  if (_.isPlainObject(object)) {
    var result = {};
    _.each(object, function(value, key) {
      if (regex.test(key)) {
        result[key] = filterKeysRecursive(value, regex);
      }
    });
    return result;
  }
  return object;
}

