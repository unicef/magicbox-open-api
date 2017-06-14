import config  from '../config'
import azure_utils from './azure'
import {createBlobService}  from 'azure-storage'

const account = config.geojson.azure.storage_account
const container = config.geojson.azure.container
const azure_key = config.geojson.azure.key1
const blobSvc = createBlobService(account, azure_key)

/**
 * Return list of countries in aggregated populations
 * @param{String} container - Name of blob container
 * @param{String} blobSvc - Azure blob service
 * @param{String} country - Country 3 letter io code
 * @param{String} admin_level - admin levl
 * @return{Promise} Fulfilled list of countries with raster metadata
 */
export function admins_shape(country, admin_level) {
  return new Promise((resolve, reject) => {
    azure_utils
      .country_geojson(container, blobSvc, country, admin_level)
      .then(resolve)
  })
}
