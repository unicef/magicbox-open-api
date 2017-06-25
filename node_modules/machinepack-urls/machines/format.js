module.exports = {

  friendlyName: 'Format URL',
  description: 'Build a URL from a template string and a set of route parameters.',
  extendedDescription: 'Template is in the standard express/backbone format.',
  sync: true,
  cacheable: true,
  inputs: {
    urlTemplate: {
      description: 'The URL template, consisting of zero or more colon-prefixed tokens.',
      example: '/api/v1/user/:id/friends/:friendId',
      required: true
    },
    data: {
      description: 'An object of key/value pairs to use as url path parameter values',
      example: {},
      required: true
    }
  },
  defaultExit: 'success',
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      example: '/api/v1/user/7/friends/aba213-a83192bf-d139-e139e'
    }
  },

  fn: function (inputs, exits) {
    var result = inputs.urlTemplate.replace(/(\:[^\/\:\.]+)/g, function ($all, $1){
      var routeParamName = $1.replace(/^\:/, '');
      return inputs.data[routeParamName];
    });
    return exits.success(result);
  }
};

