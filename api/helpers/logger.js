import Mixpanel from 'mixpanel'
import dataFormatter from 'dateformat'
import config from './../../config'
const mixpanel = Mixpanel.init(config.logger.key);

/**
 * Logs client-ip, requested url, query params for incoming request.
 * @param  {Object} request  request object
 * @param  {Object} response response object
 * @param  {Function} next  next handler to call
 */
export const logRequest = (request, response, next) => {
  if (request.url.indexOf('/api/v1/') !== -1) {
    let logObject = getRequestParams(request)
    log('REQUEST', logObject)
  }
  next()
}

/**
 * Log given information as INFO event
 * @param  {Object} logObject Object to log
 */
export const info = (logObject) => {
  log('INFO', logObject)
}

/**
 * Log given information as WARN event
 * @param  {Object} logObject Object to log
 */
export const warn = (logObject) => {
  log('WARN', logObject)
}

/**
 * Log given information as ERROR event
 * @param  {Object} logObject Object to log
 */
export const error = (logObject) => {
  log('ERROR', logObject)
}


/**
 * Log given event and specified object
 * @param  {string} eventName name of the event
 * @param  {Object} logObject Object to log
 */
export const log = (eventName, logObject) => {
  logObject.timestamp = dataFormatter(Date.now(), 'isoDateTime')
  mixpanel.track(eventName, logObject)
}

/**
 * Logs error for the request
 * @param  {object} request request object
 * @param  {object} err     error object
 */
export const logErrorResponse = (request, err) => {
  let logObject = getRequestParams(request)
  logObject.desc = err
  error(logObject)
}

/**
 * Returns ip, path and query of the request
 * @param  {object} request request object
 * @return {object} object with ip, path and query of the request
 */
export const getRequestParams = (request) => {
  return {
    clientIp: request.clientIp,
    path: request.url.replace('/api/v1/', ''),
    query: request.param
  }
}
