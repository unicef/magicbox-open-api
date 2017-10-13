import config from '../../config'
import request from 'request'
import authZeroWeb from 'auth0-js'
import authZero from 'auth0'
import * as logger from './../helpers/logger'
// import isJSON from 'is-json'
const tokenPrefix = 'Bearer '
const keyScope = 'x-security-scopes'
const keyRoles = 'magic-box/roles'

const authProperties = {
  domain: config.auth0.auth_domain,
  clientID: config.auth0.client_id
}

let webAuth = new authZeroWeb.WebAuth(authProperties)
let authClient = new authZero.AuthenticationClient(authProperties)

/**
 * Returns authorisation url which redirects user to Auth0's website.
 * User can register or login and get access token from Auth0 website
 * @return {string} url authorisation url
 */
export const getAuthorizeUrl = () => {
  let url = webAuth.client.buildAuthorizeUrl({
    responseType: 'token',
    redirectUri: config.auth0.callback_url,
    state: 'innovation',
    responseMode: 'form_post',
    scope: 'openid'
  })
  return url
}


/**
 * Returns user's information fetched using the access token provide by the user.
 * @param  {string} token user's access token
 * @return {Promise} Fullfilled when user information is fetched
 */
export const getUserInfo = (token) => {
  return new Promise((resolve, reject) => {
    authClient.getProfile(token)
    .then(userInfo => {
      if (userInfo === 'Unauthorized') {
        console.error('userInfo is Unauthorized')
        // If access token is bad
        // userInfo returns as "Unauthoraized"
        userInfo = {message: userInfo}
      }
      // if (!isJSON(userInfo)) {
      //   console.log("NOT JSON", userInfo)
      //   // If access token is bad
      //   // userInfo returns as "Unauthoraized"
      //   userInfo = {message: userInfo}
      // }

      if (typeof userInfo === 'string') {
        console.error('userInfo is string !!', userInfo)
        logger.log('userInfo', JSON.parse(userInfo))
        userInfo = JSON.parse(userInfo);
        console.log(userInfo)
        console.log(userInfo.email)
        console.log('_____')
        return resolve(userInfo)
      }
        console.error('userInfo is Object', userInfo)
      logger.log('userInfo', userInfo)
      return resolve(userInfo)
    })
    .catch(reject)
  })
}

/**
 * Verifies if user has required level of authorisation
 * @param  {object} req request object
 * @param  {object} authOrSecDef auth and security definations from swagger file
 * @param  {string} token token string provided with request
 * @param  {Function} callback callback function
 * @return {Array} user roles
 */
export const verifyToken = (req, authOrSecDef, token, callback) => {
  let errorObject = {message: 'Access Denied. Please check your token'}

  if (token && token.indexOf(tokenPrefix) !== -1) {
    let accessToken = token.substring(
      token.indexOf(tokenPrefix) + tokenPrefix.length
    )
    console.error('Access token', accessToken)
    // get all the required roles from swagger doc.
    let requiredRoles = req.swagger.operation[keyScope]

    getUserInfo(accessToken)
    .then(userInfo => {
      let userRoles = userInfo[keyRoles]
      console.log('userRoles', !!userRoles, userRoles)
      if (!userRoles) {
        if (userInfo.email && userInfo.email_verified) {
          console.log('Email all good')
          let email_domain = userInfo.email.split('@');
          if (config.auth0.roles[email_domain[1]]) {
            console.log('Assign some roles', email_domain[1])
            userRoles = [config.auth0.roles[email_domain[1]]]
            console.log('User roles', userRoles)
          }
          console.log('aaaaa')
        }
          console.log('bbbbb')
      }
      console.log('cccc')
      console.log('Required roles', requiredRoles)
      // check if user has all the required roles
      let verified = requiredRoles.every(role => {
        return userRoles.indexOf(role) >= 0
      })
      console.log('dddd')
      console.log(verified)
      console.log('eeee')
      // check if user is verified or if he is admin
      if (verified || userRoles.indexOf('admin') !== -1) {
        console.log('Verified OR user is admin')
        return callback(null)
      } else {
        console.error('111 check if user is verified or if he is admin',
        errorObject, userRoles)
        Object.assign(errorObject, {second: '111'})
        return callback(errorObject)
      }
    })
    .catch(error => {
      console.error('2222')
      Object.assign(errorObject, {second: '222'})
      return callback(errorObject)
    })
  } else {
    console.error('3333')
    Object.assign(errorObject, {second: '3333'})
    return callback(errorObject)
  }
  console.log('444444')
}

/**
 * Verifies if user has required level of authorisation
 * @param  {object} code fetched from auth0
 * @return {object} object with ip, path and query of the request
 */
export const getRefreshToken = code => {
  return new Promise((resolve, reject) => {
    let options = {method: 'POST',
    url: config.auth0.auth_url,
    headers: {'content-type': 'application/json'},
    body:
     {grant_type: 'authorization_code',
       client_id: config.auth0.client_id,
       client_secret: config.auth0.client_secret,
       scope: 'profile+roles',
       code: code,
       redirect_uri: config.auth0.redirect_uri},
    json: true};

    request(options, function(error, response, body) {
      if (error) throw new Error(error);
      // Object has refresh token
      return resolve(body);
    });
  })
}

/**
 * Gets new access token
 * @param  {object} refresh_token fetched from auth0
 * @return {object} object with ip, path and query of the request
 */
export const refreshAccessToken = refresh_token => {
  return new Promise((resolve, reject) => {
    let options = {method: 'POST',
    url: config.auth0.auth_url,
    headers: {'content-type': 'application/json'},
    body:
     {grant_type: 'refresh_token',
       client_id: config.auth0.client_id,
       client_secret: config.auth0.client_secret,
       responseType: 'token id_token',
       refresh_token: refresh_token,
       state: 'innovation',
       redirect_uri: config.auth0.redirect_uri},
    json: true};

    request(options, function(error, response, body) {
      if (error) throw new Error(error);
      return resolve(body);
    });
  })
}
