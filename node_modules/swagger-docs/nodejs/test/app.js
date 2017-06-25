'use strict';

var connect = require('connect');
var swaggerDocs = require('../..');

var swagger = require('./swagger.json');

var app = connect();

app.use(swaggerDocs.middleWare(swagger, {path: '/api-docs'}));

app.listen(3000, console.log);

