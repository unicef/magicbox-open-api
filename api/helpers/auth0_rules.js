/**
 * This file is not used by any script in this repository.
 * This file documents functions (refered to as Rules) used by Auth0
 * to perform some operations in order to manage users and control access.
 * You can go to Auth0 dashboard to refer to these rules or update and add new rules.
 * URL: https://manage.auth0.com/#/rules
 *
 * Auth0 runs this functions in following order:
 * 1. addPropertyToUser
 * 2. setRoles
 * 3. trackLogins
 * 4. forceEmailVerifivation
 *
 * If any of these rules fails then Authentication Error is raised.
 *
 */


/**
 * Adds persistent attributes to the user.
 * Currently we use this rule to add "signedUp" attribute to user metadata. Using this we track the user is returning user or first time user.
 * @param {object} user  User object with all user information
 * @param {object} context context object
 * @param {Function} callback callback function
 */
const addPropertyToUser = function (user, context, callback) {
  user.user_metadata = user.user_metadata || {};

  if ('signedUp' in user.user_metadata) {
    user.user_metadata.signedUp = true;
  } else {
    user.user_metadata.signedUp = false;
  }

  auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
    .then(() => {
        callback(null, user, context);
    })
    .catch(error => {
        callback(error);
    });
}


/**
 * Sets roles to to user. As of now rules are assigned depending on domain of the email address.
 * If it's unicef.org user gets "admin" access, else user gets "user" access.
 * @param {object} user  User object with all user information
 * @param {object} context context object
 * @param {Function} callback callback function
 */
const setRoles = function (user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  // You can add a Role based on what you want
  // In this case I check domain
  let addRolesToUser = function(user, cb) {
    if (user.email && (user.email.indexOf('unicef.org') > -1)) {
      cb(null, ['admin']);
    } else {
      cb(null, ['user']);
    }
  };

  addRolesToUser(user, function(err, roles) {
    if (err) {
      callback(err);
    } else {
      user.app_metadata.roles = roles;
      auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
        .then(() => {
          context.idToken['magic-box/roles'] = user.app_metadata.roles;
          callback(null, user, context);
        })
        .catch(error => {
          callback(error)
        });
    }
  });
}


/**
 * Tracks Logins in MixPanel. properties logged are clientIp, name, roles,
 * @param {object} user  User object with all user information
 * @param {object} context context object
 * @param {Function} callback callback function
 * @return {[type]}            [description]
 */
const trackLogins = function (user, context, callback) {
  // Property object
  let properties = {
        'distinct_id': user.name,
        'token': 'mixpanel_token_here',
        'timestamp': new Date().toISOString(),
        'clientIp': context.request.ip,
        'name': user.name
    };

  // mix-panel even object
  let mpEvent = {};

  // check if user is signing up or logging in
  if (user.user_metadata.signedUp) {
    // if user is logging in then event is LOGIN, also add roles to properties
    mpEvent.event = 'LOGIN';
    properties.roles = user.roles;
  } else {
    // else if user signing up then event is SIGNUP
    mpEvent.event = 'SIGNUP';
  }

  // set properties of mix-panel event object
  mpEvent.properties = properties;

  // base64 String of mpEvent (not sure why, this template was provided by Auth0)
  let base64Event = new Buffer(JSON.stringify(mpEvent)).toString('base64');

  // sending event to mix-panel
  request.get({
    url: 'http://api.mixpanel.com/track/',
    qs: {
      data: base64Event
    }
  }, function(e, r, b) {
    // don’t wait for the MixPanel API call to finish, return right away (the request will continue on the sandbox)`
    callback(null, user, context);
  });
}

/**
 * Checks if the user's email address is verified. If it isn't UnauthorizedError is sent back.
 * @param {object} user  User object with all user information
 * @param {object} context context object
 * @param {Function} callback callback function
 */
const forceEmailVerifivation = function (user, context, callback) {
  if (!user.email_verified) {
    return callback(
      new UnauthorizedError('Please verify your email before logging in.')
    );
  } else {
    return callback(null, user, context);
  }
}
