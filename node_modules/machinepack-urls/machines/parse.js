module.exports = {


  friendlyName: 'Parse URL',


  description: 'Parse metadata from a URL.',


  sync: true,


  cacheable: true,


  inputs: {

    url: {
      description: 'The URL to parse',
      example: 'http://www.example.com/search',
      required: true
    }

  },


  exits: {

    error: {
      description: 'Unexpected error occurred.'
    },

    success: {
      description: 'Done.',
      example: {
        protocol: 'redis:',
        auth: '',
        port: 80,
        hostname: 'google.com',
        hash: '',
        search: '',
        path: '/',
        // slashes: true,
        // host: 'google.com',
        // query: {},
        // pathname: '/',
        // href: 'http://google.com/'
      }
    }

  },


  fn: function(inputs, exits) {

    var Url = require('url');
    // var sanitizeUrl = require('machine').build(require('./sanitize'));

    // var sanitizedUrl;
    // try {
    //   sanitizedUrl = sanitizeUrl({url: inputs.url}).execSync();
    // }
    // catch (e) {
    //   if (e.exit === 'invalid') return exits.invalid();
    //   return exits.error(e);
    // }

    var parsedUrl = Url.parse(inputs.url);

    // Attempt to infer port if it doesn't exist
    if (!parsedUrl.port) {
      if (parsedUrl.protocol === 'https:') {
        parsedUrl.port = 443;
      }
      else {
        parsedUrl.port = 80;
      }
    }

    return exits.success(parsedUrl);
  },

};
