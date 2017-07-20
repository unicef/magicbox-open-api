// import config from '../../config'
// import authZero from 'auth0-js'
// import bluebird from 'bluebird'
// import qs from 'qs'
// // var config = require('../../config')
// // var authZero = require('auth0-js')
//
//
// let webAuth = new authZero.WebAuth({
//   domain: config.auth0.auth_domain,
//   clientID: config.auth0.client_id,
//   redirectUri: config.auth0.callback_url,
//   responseType: 'token',
//   responseMode: 'form_post',
//   scope: 'openid',
//   leeway: 60
// });
//
// export const getAuthorizeUrl = () => {
//   let url = webAuth.client.buildAuthorizeUrl({
//     clientID: '-ByPmbRVYjhEdMIHrwjwJUIz9wJYXOb7', // string
//     responseType: 'token', // code or token
//     redirectUri: config.auth0.callback_url,
//     state: 'PPP'
//   });
//   return url
// }
//
// export const getToken = (tokenContainer) => {
//   return qs.parse(tokenContainer).accessToken
// }
//
//
//
// // https://pratikkul1.auth0.com/authorize?client_id=-ByPmbRVYjhEdMIHrwjwJUIz9wJYXOb7&response_type=token&redirect_uri=localhost%3A8000%2Fapi%2Fv1%2Ftoken%2F%7Btoken%7D&scope=openid&state=PPP&auth0Client=eyJuYW1lIjoiYXV0aDAuanMiLCJ2ZXJzaW9uIjoiOC44LjAifQ%3D%3D
// //
