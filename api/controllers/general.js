import util from 'util'
import * as general_helper from '../helpers/general'
import config from '../../config'
import * as auth from '../helpers/auth'
import bluebird from 'bluebird'
import fs from 'fs'
import qs from 'qs'
const readFile = bluebird.promisify(fs.readFile)

/**
 * Returns mosquito prevalence for specified country. If country is not specified it will return
 * mosquito prevalence for all countries.
 * @param{String} request - request object
 * @param{String} response - response object
 * @return{Promise} Fulfilled when records are returned
 */
export function getMosquito(request, response) {

  let [ key, kind, country ] = request._key.split('_')
  const source = config[key].source
  const source_url = config[key].source_url
  general_helper
    .getMosquito(key, kind, country)
    .then(data => response.json({
      key: key,
      kind: kind,
      source: source,
      source_url: source_url,
      data: data
    }))
    .catch(err => {
      response.json({message: err})
    })
}

/**
 * Returns population metadata available from specified source for specified country.
 * If country is not specified it will return data for all countries.
 * Default source is worldpop.
 * @param{String} request - request object
 * @param{String} response - response object
 * @return{Promise} Fulfilled when records are returned
 */
export function getPopulation(request, response) {
  const [ key, source, country ] = request._key.split('_')
  const data_source = (source !== undefined) ? source : config.population.source
  general_helper
    .getPopulation(key, source, country)
    .then(data => response.json({
      key: key,
      source: data_source,
      data: data
    }))
    .catch(err => {
      response.json({message: err})
    })
}


/**
 * Returns an object with information about cases for specific kind in all countries
 * @param{String} request - request object
 * @param{String} response - response object
 * @return{Promise} Fulfilled when records are returned
 */
export function getCases(request, response) {

  // key represents what data we want to pull, here it is 'cases'
  // kind represents disease whose cases we are pulling
  // week-types (epi-week or iso-week)
  // week represents last date of epi-week. If set, the API will fetch cases only for that week
  const [ key, kind, weekType, week ] = request._key.split('_')
  const source = config.cases[kind].source
  const source_url = config.cases[kind].source_url

  general_helper
    .get_cases(key, kind, weekType, week)
    .then((cases) => response.json({
      kind: kind,
      source: source,
      source_url: source_url,
      weekType: weekType,
      cases: cases
    }))
    .catch(error =>
      response.json({ message: error })
    )
}


/**
 * Returns an object with properties for specific key
 * @param{String} request - request object
 * @param{String} response - response object
 * @return{Promise} Fulfilled when records are returned
 */
export function getProperties(request, response) {
  general_helper
  .getProperties(request._key)
  .then(properties => response.json ({
    key: properties.key,
    properties: properties.properties
  }))
}

export const getToken = (request, response) => {
  let url = auth.getAuthorizeUrl()
  // response.json({
  //   action: "Please open following url in browser and follow next steps",
  //   url: url
  // })
  // console.log(url);
  response.format({
    'text/html': function(){
      response.send("<html><body><h3><a href='" + url + "'> Click Here </a></h3></body></html>")
    }
  })
}

export const showToken = (request, response) => {
  let token = qs.parse(request.body).access_token
  response.format({
    'text/html': function(){
      response.send("<html><body><h3>Token: "+ token +"</h3></body></html>")
    }
  })
}
