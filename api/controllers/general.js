// import util from 'util'
// import general_helper from '../helpers/general'

var util = require('util');
var general_helper = require('../helpers/general');
var config = require('../../config');
/**
 * Return list of countries with aggregated population data
 * @param{String} request - request object
 * @param{String} res - response object
 * @return{Promise} Fulfilled when records are returned
 */
function general(req, res) {
  const data_kind = req._key || req.swagger.params.kind.value
  // Fetch array of countries and metadata about population aggregations.
  // Example: {"afg":{"popmap15adj":[{"gadm2-8":2}]},"ago":{"AGO15adjv4":[{"gadm2-8":3}]}
  const source = config[req._key].source
  const source_url = config[req._key].source_url
  general_helper
    .countries_with_this_kind_data(data_kind)
    .then(data => res.json({
      source: source,
      source_url: source_url,
      data_kind: data_kind,
      data: data
    }))
    .catch(err =>
      res.json({message: err})
    )
}


/**
 * Returns an object with information about cases for specific kind in all countries
 * @param{String} request - request object
 * @param{String} res - response object
 * @return{Promise} Fulfilled when records are returned
 */
function getCases(request, response) {
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
function getPopulationByCountry(request, response) {
  // country represents country whose population we are pulling
  const [ key, country ] = request._key.split('_')

  general_helper
    .get_data_by_admins(key, country)
    .then(pop_or_prev_map => {
      let return_object = {
        country: country,
        source: config[key].source,
        source_url: config[key].source_url

      }

      return_object.kind = pop_or_prev_map.raster,
      return_object.value = pop_or_prev_map.value

      response.json(return_object)
    })
    .catch(error =>
      response.json({ message: error })
    )
}

module.exports = {
  getPopulationByCountry: getPopulationByCountry,
  general: general,
  getCases: getCases
};
