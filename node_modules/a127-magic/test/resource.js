var should = require('should');
var path = require('path');
var a127config = require('../lib/config');
var middleware = require('../lib/middleware');

var resource = require('../lib/resource')();

process.env.A127_APPROOT = __dirname;
var SWAGGER_FILE = path.resolve(__dirname, 'api', 'swagger', 'swagger.yaml');

describe('resource', function() {

  var config;
  before(function(done) {
    a127config.load(function(conf) {
      config = conf;
      config['a127.magic'].swaggerFile = SWAGGER_FILE;
      done();
    });
  });

  it('oauth must be made available', function(done) {
    var oauth = resource('oauth2');
    should.exist(oauth);
    done();
  });
});
