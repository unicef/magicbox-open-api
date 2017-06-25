var should = require('should');
var a127config = require('../lib/config');
var loader = require('../lib/loader');
var path = require('path');
var fs = require('fs');
var yaml = require('js-yaml');

process.env.A127_APPROOT = __dirname;

describe('loader', function() {

  describe('proper swagger', function() {

    var SWAGGER_FILE = path.resolve(__dirname, 'api', 'swagger', 'swagger.yaml');

    it('must load yaml', function(done) {

      var swaggerObject = yaml.safeLoad(fs.readFileSync(SWAGGER_FILE, 'utf8'));
      var swaggerConfig = swaggerObject['x-a127-config'];

      swaggerConfig.testString1.should.equal('value');
      swaggerConfig.testArray1.should.eql([ 'one', 'two' ]);
      swaggerConfig.testHash1.should.eql({ one: 'one', two: 'two'});
      swaggerConfig.testBoolean1.should.equal(true);
      swaggerConfig.testNumber1.should.equal(1);

      done();
    });

    it('empty config must not change the structure', function(done) {

      a127config.load(function(config) {
        var originalSwagger = yaml.safeLoad(fs.readFileSync(SWAGGER_FILE, 'utf8'));
        var convertedSwagger = loader.load(SWAGGER_FILE, {});

        originalSwagger.should.eql(convertedSwagger);

        done();
      });
    });

    it('must load and replace config', function(done) {

      a127config.reload(function(config) {
        var swaggerObject = loader.load(SWAGGER_FILE, config);

        var swaggerConfig = swaggerObject['x-a127-config'];

        swaggerConfig.testString1.should.equal('defaultString');
        swaggerConfig.testArray1.should.eql([ 'default1', 'default2' ]);
        swaggerConfig.testHash1.should.eql({ test1: 'defaultHash1', test2: 'defaultHash2'});

        swaggerConfig['a127.account.password'].should.equal('PASSWORD');

        var swaggerReference = swaggerObject['x-volos-test'];
        swaggerReference.testReference1.should.equal('defaultString');
        swaggerReference.testReference2.should.eql([ 'default1', 'default2' ]);
        swaggerReference.testReference3.should.eql({ test1: 'defaultHash1', test2: 'defaultHash2'});
        swaggerReference.testReference4.should.equal(false);
        swaggerReference.testReference5.should.equal(2);

        done();
      });
    });
  });

  describe('broken swagger', function() {

    it('with duplicate a127 services must fail on load', function(done) {

      var SWAGGER_FILE = path.resolve(__dirname, 'api', 'swagger', 'swagger_with_dup_resource.yaml');

      (function() {
        var swaggerObject = loader.load(SWAGGER_FILE, {});
      }).should.throw('duplicate resource named: cache in: x-a127-services');

      done();
    });

    it('with duplicate volos resources must fail on load', function(done) {

      var SWAGGER_FILE = path.resolve(__dirname, 'api', 'swagger', 'swagger_with_dup_resource_old.yaml');

      (function() {
        var swaggerObject = loader.load(SWAGGER_FILE, {});
      }).should.throw('duplicate resource named: cache in: x-volos-resources');

      done();
    });

  });
});
