var a127config = require('../lib/config');

process.env.A127_APPROOT = __dirname;

var middleware = require('../lib/middleware');
var should = require('should');
var request = require('supertest');

describe('middleware', function() {

  var config;
  before(function(done) {
    a127config.load(function(conf) {
      config = conf;
      done();
    });
  });

  it('must load correctly', function(done) {

    config.validateResponse.should.be.true;

    middleware(config);

    var magic = config['a127.magic'];
    should.exist(magic);

    var swaggerTools = magic.swaggerTools;
    should.exist(swaggerTools);

    done();
  });

  it('must allow resource access', function(done) {

    var app = require('connect')();
    app.use(middleware(config));

    app.use(function(req, res, next) {
      try {
        var resource = req.a127.resource('oauth2');
        should.exist(resource);
        should.exist(resource.beforeCreateToken);
        resource.beforeCreateToken.should.be.Function;
        res.end('ok');
      } catch (err) {
        return done(err);
      }
      next();
    });

    request(app)
      .get('/')
      .end(function(err, res) {
        done(err);
      });
  });

  it('must allow config access', function(done) {

    var app = require('connect')();
    app.use(middleware(config));

    app.use(function(req, res, next) {
      try {
        var hash = req.a127.config('testHash1');
        should.exist(hash);
        hash.should.containDeep({test2: "defaultHash2"});
        res.end('ok');
      } catch (err) {
        return done(err);
      }
      next();
    });

    request(app)
      .get('/')
      .end(function(err, res) {
        done(err);
      });
  });
});
