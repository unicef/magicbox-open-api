var config = require('../../config');
var async = require('async');
var bluebird = require('bluebird');
var azure_utils= require('../../utils/azure');
var azure_storage = require('azure-storage');
var storage_account = config.population.azure.storage_account;
var azure_key = config.population.azure.key1;
var fileSvc = azure_storage.createFileService(storage_account, azure_key);

/**
 * Return list of countries with aggregated population data
 * @param{String} request - request object
 * @param{String} res - response object
 * @return{Promise} Fulfilled when records are returned
 */
var countries_with_this_kind_data = (kind) => {
  return new Promise((resolve, reject) => {
    // return resolve(temp_population_json);
    async.waterfall([
      function(callback) {
        // gadm2-8, santiblanko
        azure_utils.get_file_list(fileSvc, kind)
        .then(directories => {
          var dirs_shapefiles = extract_dirs(directories.entries.directories);
          callback(null, dirs_shapefiles, kind);
        });
      },
      // Iterate through each shapefile source
      // and keep a running hash of country to array of aggregations per source
      function(dirs_shapefiles, kind, callback) {
        bluebird.reduce(dirs_shapefiles, (h, dir) => {
          return shapefile_aggregations(h, dir, kind)
          .then(updated_hash => {
            h = updated_hash;
            return h;
          })
        }, {})
        .then(hash => {
          callback(hash);
        })
      },
    ], function(population) {
      return resolve(population);
    });
  })
}
function shapefile_aggregations(h, dir, kind) {
  return new Promise((resolve, reject) => {
    azure_utils.get_file_list(fileSvc, kind, dir)
    .then(files => {
      files.entries.files.forEach(e => {
        var record = file_to_record(e);
        if(h[record.country]) {
          h[record.country].push(record);
        } else {
          h[record.country] = [record];
        };
      });
      return resolve(h);
    });

  })
}

/**
 * Return object for raster that contains metadata gleaned from the raster file name
 * @param{Object} raster_blob_obj - raster blob object from storage
 * @return{Object} Raster metadata
 */
function file_to_record(file_obj) {
  // tha_3_gadm2-8^THA_ppp_v2b_2015_UNadj^worldpop^74943039^198478.json
  var record = file_obj.name.split(/\^/);
  // tha_3_gadm2-8
  var ary = record[0].split('_');
  var shapefile = ary.pop();
  var admin_level = ary.pop();
  var country = ary.pop();
  // worldpop
  var data_source = record[2];
  // ^2323^323.json
  // if (record[5]) {
  //   console.log(record[3])
  var pop_sum = parseFloat(record[3]);
  var sq_km = parseInt(record[4].replace(/.json/, ''));
    // Need to update worldpop rasters with source
  // } else {
  //   var pop_sum = parseInt(record[3]);
  //   var sq_km = parseInt(record[4].replace(/.json/, ''));
  // }
  // var pop_obj = {}
  //
  // pop_obj[country] = {
  return {
    // kind: file_obj.kind,
    country: country,
    data_source: data_source,
    // 3 letter iso code
    // gadm2-8
    shapefile_set: shapefile,
    // 0, 1, 2, 3, 4, 5...
    admin_level: admin_level,
    sum: pop_sum,
    sq_km: sq_km,
    density: (pop_sum/sq_km),
    // popmap15adj.json
    raster: record[1].replace(/.json$/, '')
  };
  return pop_obj;
}
function extract_dirs(ary) {
  return ary.map(e => { return e.name;});
}
module.exports = {
  countries_with_this_kind_data: countries_with_this_kind_data,
}
