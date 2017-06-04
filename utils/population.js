var config = require('../../config');
var azure_utils= require('../../utils/azure');
var azure_storage = require('azure-storage');
var account = config.population.azure.storage_account;
var container = config.population.azure.container;
var azure_key = config.geojson.azure.key1;
var blobSvc = azure_storage.createBlobService(account, azure_key);

/**
 * Return list of countries in aggregated populations
 * @param{String} container - Name of blob container
 * @param{String} blobSvc - Azure blob service
 * @param{String} country - Country 3 letter io code
 * @param{String} admin_level - admin levl
 * @return{Promise} Fulfilled list of countries with raster metadata
 */
exports.population = (country, admin_level) => {
  return new Promise((resolve, reject) => {
    azure_utils.country_geojson(container, blobSvc, country, admin_level)
    .then(resolve);
  })
}
