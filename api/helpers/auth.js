import config from '../../config'
import authZeroWeb from 'auth0-js'
import bluebird from 'bluebird'
import qs from 'qs'
import authZero from 'auth0'


let webAuth = new authZeroWeb.WebAuth({
  domain: config.auth0.auth_domain,
  clientID: config.auth0.client_id
});

export const getAuthorizeUrl = () => {
  let url = webAuth.client.buildAuthorizeUrl({
    responseType: 'token',
    redirectUri: config.auth0.callback_url,
    state: 'innovation',
    responseMode: 'form_post',
    scope: 'openid',
    leeway: 60
  })
  return url
}
