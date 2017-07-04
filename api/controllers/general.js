import util from 'util'
import general_helper from '../helpers/general'
import config from '../../config'

/**
 * Returns mosquito prevalence for specified country. If country is not specified it will return
 * mosquito prevalence for all countries.
 * @param{String} request - request object
 * @param{String} response - response object
 * @return{Promise} Fulfilled when records are returned
 */
export function getMosquito(request, response) {

  // get kind of mosquito
  const data_kind = request.swagger.params.kind.value

  // get country. if it's not set, set it to empty string
  const country = request.swagger.params.country ? request.swagger.params.country.value : ''

  if (country !== '') {
    // get data for specified country
    general_helper
      .get_data_by_admins(data_kind, country)
      .then(population_map => response.json({
        country : country,
        source : population_map.source,
        kind : population_map.raster,
        mosquito_prevalence : population_map.value
      }))
      .catch(err =>
        response.json({message: err})
      )
  } else {
    // get data for all countries
    general_helper
      .countries_with_this_kind_data(data_kind)
      .then(data => response.json({
        data_kind : data_kind,
        data : data
      }))
      .catch(err =>
        response.json({message: err})
      )
  }
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
  general_helper
    .getPopulation(source, country)
    .then(data => response.json({
      data_kind: key,
      source: source,
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
  const key = request._key
  // kind represents disease whose cases we are pulling
  const kind = request.swagger.params.kind.value
  // week types (epi-week or iso-week)
  const weekType = request.swagger.params.weekType.value
  // week represents last date of epi-week. If set, the API will fetch cases only for that week
  const week = request.swagger.params.date ? request.swagger.params.date.value : null

  const source = config.zika.source
  const source_url = config.zika.source_url

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
 * Returns population of each admin for specified country.
 * @param{String} request - request object
 * @param{String} res - response object
 * @return{Promise} Fulfilled when records are returned
 */
export function getPopulationByCountry(request, response) {
  // country represents country whose population we are pulling
  const [ key, country ] = request._key.split('_')

  general_helper
    .get_data_by_admins(key, country)
    .then(pop_or_prev_map => response.json({
        country: country,
        source: config[key].source,
        source_url: config[key].source_url,
        kind: pop_or_prev_map.raster,
        value: pop_or_prev_map.value
    }))
    .catch(error =>
      response.json({ message: error })
    )
}
