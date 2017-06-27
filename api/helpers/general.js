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
        }
      });
      return resolve(h);
    });
  });
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


/**
 * Fetches cases of specified kind for specified week. To get all the cases set week to null
 * @param  {String} key       Key for azure_helper (should always be cases)
 * @param  {String} kind      name of disease
 * @param  {String} week      Last day of the week
 * @param  {String} weekType  type of week (epi or iso)
 * @return {Object}      Object holding cases
 */
function get_cases(key, kind, weekType, week) {
  return new Promise((resolve, reject) => {
    async.waterfall([
      // fetch all the file-names holding cases
      // file names are last day of the week for which they hold data
      function(callback) {
        azure_utils.get_file_list(fileSvc, kind, weekType)
        .then(files => {
          callback(null, files.entries.files, week);
        });
      },
      // read all the files and make an object to return
      function (files, date, callback) {
        // if date is set then just read one file else read all the files
        if (date !== null) {
          files = files.filter(file => {
            return file.name.replace(/.json/g, '') === date;
          });
          if (files.length !== 1) {
            console.error("Error -> File not found", file.name);
          }
        }
        var returnObj = {};

        // read files and store the content in returnObj with key as the date
        bluebird.each(files, file => {
          var objKey = file.name.replace(/.json/g, '');
          return read_file(kind, weekType, file.name)
          .then(content => {
            returnObj[objKey] = content.countries;
          })
          .catch(error => {
            console.log("Error", error);
          });
        }, {concurrency: 1})
        .then(() => {
          callback(returnObj);
        });
      }], returnObj => {
      console.log("DONE!!!");
      return resolve(returnObj);
    });
  });
}


/**
 * Read a file and return Json object with the file content
 * @param  {String} key      Key for the request. This determines root dir for the file
 * @param  {String} fileName File to read
 * @return {Promise} Fulfilled when records are returned
 */
function read_file(key, dir, fileName) {
  return new Promise((resolve, reject) => {
    var directory = config[key].azure.directory;
    var path = config[key].azure.path;
    path = dir ? path + dir : path;
    fileSvc.getFileToText(directory, path, fileName, function(error, fileContent, file) {
      if (!error) {
        resolve(JSON.parse(fileContent));
      } else {
        console.log("Error while reading", directory+path+fileName);
      }
    });
  });
}

/**
 * Returns population of each admin for specified country. The population is a list of strings having following format:
 * <country>_<admin 0 id>_<admin 1 id>_...<admin n id>_<population of smallest admin level>_<source>
 * @param  {String} kind      type of data requested (population or mosquito)
 * @param  {String} country   iso 3 code of the country
 * @return{Promise} Fulfilled when records are returned
 */
const get_data_by_admins = (kind, country) => {
  return new Promise((resolve, reject) => {
    async.waterfall([
      // get all files from population/worldpop dir
      (callback) => {
        azure_utils.get_file_list(fileSvc, kind, config[kind].azure.default_database)
        .then(files => {
          files = files.entries.files.filter(file => {
            return file.name.split('_')[0] === country
          })
          if (files.length === 1) {
            callback(null, kind, config[kind].azure.default_database, files[0].name)
          }
        })
      },
      // read the required file and reduce every element to corresponding formated string
      (kind, dir, fileName, callback) => {


        let [ raster, source  ] = fileName.split('^').slice(1, 3)

        let population_map = {}
        population_map.raster = raster
        population_map.source = source
        population_map.population = {}

        read_file(kind, dir, fileName)
        .then(content => {
          var pop_map = content.reduce((map, element) => {
            var tempList = Object.keys(element).filter(key => {
              return ( key.startsWith('id_') )
            }).map(key => {
              return element[key]
            })

            let temp_map = {}
            temp_map[country + '_' + tempList.join('_') + '_' + dir] = element.sum || element.mean
            Object.assign(map, temp_map)
            return map
          }, {})
          Object.assign(population_map.population, pop_map)
          callback(null, population_map)
        })
      }
    ], (error, population_map) => {
      if (error) {
        return reject(error)
      }
      return resolve(population_map)
    })
  });
}

module.exports = {
  countries_with_this_kind_data,
  get_cases,
  get_data_by_admins
};
