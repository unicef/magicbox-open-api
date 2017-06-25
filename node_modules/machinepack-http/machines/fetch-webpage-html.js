module.exports = {
  friendlyName: 'Fetch webpage HTML',
  description: 'Fetch the HTML from a web page.',
  inputs: {

    url: {
      friendlyName: 'URL',
      example: 'http://www.example.com',
      description: 'The URL of the web page to fetched',
      extendedDescription: 'This should include the hostname and a protocol like "http://"',
      required: true,
    }

  },

  exits: {

    success: {
      example: '<html><body><h1>Hello world</h1></body></html>',
      variableName: 'html',
      friendlyName: 'then',
      description: 'HTML contents of the web page fetched successfully.'
    },

    notFound: {
      description: '404 status code returned from server',
      example: {
        status: 404,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    badRequest: {
      description: '400 status code returned from server',
      example: {
        status: 400,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    forbidden: {
      description: '403 status code returned from server',
      example: {
        status: 403,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    unauthorized: {
      description: '401 status code returned from server',
      example: {
        status: 401,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    serverError: {
      description: '5xx status code returned from server (this usually means something went wrong on the other end)',
      example: {
        status: 503,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    requestFailed: {
      description: 'Unexpected connection error: could not send or receive HTTP request.',
      extendedDescription: 'Could not send HTTP request; perhaps network connection was lost?'
    },

    error: {
      description: 'Unexpected error occurred'
    }
  },
  fn: function(inputs, exits) {

    var Machine = require('machine');

    var Urls = require('machinepack-urls');

    // Make sure this is a fully-qualified URL, and coerce it if necessary.
    var url = Urls.resolve({url: inputs.url}).execSync();

    Machine.build(require('./send-http-request')).configure({
      method: 'get',
      url: url
    }).exec({
      error: exits.error,
      requestFailed: exits.requestFailed,
      badRequest: exits.badRequest,
      unauthorized: exits.unauthorized,
      forbidden: exits.forbidden,
      notFound: exits.notFound,
      serverError: exits.serverError,
      success: function (response){
        var html = response.body;
        return exits.success(html);
      }
    });

  }

};
