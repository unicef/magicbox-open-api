import config from '../../config'
import authZeroWeb from 'auth0-js'
import bluebird from 'bluebird'
import qs from 'qs'
import authZero from 'auth0'

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
      return resolve(JSON.parse(userInfo))
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
 */
export const verifyToken = (req, authOrSecDef, token, callback) => {

  let errorObject = {message: "Invalid token"}

  if (token && token.indexOf(tokenPrefix) !== -1) {
    let accessToken = token.substring(token.indexOf(tokenPrefix) + tokenPrefix.length)
    let requiredRoles = req.swagger.operation[keyScope]

    getUserInfo(accessToken)
    .then(userInfo => {
      let userRoles = userInfo[keyRoles]
      let verified = requiredRoles.every(role => {
        return userRoles.indexOf(role) !== -1
      })

      if (verified) {
        return callback(null)
      } else {
        return callback(errorObject)
      }
    })
    .catch(error => {
      return callback(errorObject)
    })
  } else {
    return callback(errorObject)
  }
}
