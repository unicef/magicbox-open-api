module.exports = {
  friendlyName: 'Resolve URL',
  description: 'Build a sanitized, fully-qualified version of the provided URL.',
  extendedDescription: 'Given a URL or URL segment, I return a fully-qualified URL with trailing slashes stripped off.  For example, if a valid protocol is provided (e.g. "https://") and the original URL contains no trailing slashes, the URL I return will be identical to what was passed in.  If the provided URL begins with "//", it will be replaced with "http://".  If the provided URL does not start with a usable protocol, "http://" will be prepended.  If the URL cannot be sanitized, I\'ll trigger the `invalid` exit.',
  sync: true,
  cacheable: true,
  inputs: {
    url: {
      friendlyName: 'URL',
      example: 'www.example.com/search',
      description: 'The URL to sanitize, with or without the protocol prefix (e.g. "http://")',
      required: true
    }
  },
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'URL resolved successfully.',
      example: 'http://www.example.com/search'
    },
    invalid: {
      description: 'The provided URL is not valid.'
    }
  },
  fn: function(inputs, exits) {

    var validateUrl = require('machine').build(require('./validate'));

    // Build our best attempt at a fully-qualified URL.
    var fullyQualifiedUrl = (function (){
      // If a protocol is already included in URL, leave it alone
      if (inputs.url.match(/^(https?:\/\/|ftp:\/\/)/)) {
        return inputs.url;
      }
      // If protocol is invalid, but sort of makes sense ("//"), change it to `http`
      else if (inputs.url.match(/^(\/\/)/)){
        return inputs.url.replace(/^\/\//, 'http://');
      }
      // Otherwise default to "http://" and prefix the provided URL w/ that
      else {
        return 'http://'+inputs.url;
      }
    })();

    // Trim off any trailing slashes
    fullyQualifiedUrl = fullyQualifiedUrl.replace(/\/*$/, '');

    // Now check that what we ended up with is actually valid.
    // (will throw if it's not)
    try {
      validateUrl({string: fullyQualifiedUrl}).execSync();
    }
    catch (e) {
      if (e.exit === 'invalid') {
        return exits.invalid(e);
      }
      return exits.error(e);
    }

    return exits.success(fullyQualifiedUrl);
  },

};
