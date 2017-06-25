You got your Volos in my Swagger! You got your Swagger in my Volos!

This module initializes and controls an Apigee-127 Swagger-driven project. Full documentation is available [here](https://github.com/apigee-127/a127-documentation/wiki).

Basic usage example:

    var a127 = require('a127-magic');
    var app = require('express')();

    a127.init(function(config) {
      app.use(a127.middleware(config));
      app.listen(process.env.PORT || 10010);
    });

(See also the Apigee-127 [project-skeleton](https://github.com/apigee-127/a127/blob/master/project-skeleton/app.js)
