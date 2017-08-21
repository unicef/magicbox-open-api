import config from '../../config'
import async from 'async'
import bluebird from 'bluebird'
import PostgresHelper from './postgres'
const dbClient = new PostgresHelper()
import * as azure_utils from '../../utils/azure'


let cursors = {}

/**
 * Returns name of the a country's shapefile from` the List of shapefiles
 * @param  {List} shapefiles List of shapefiles
 * @param  {String} country  Name of the country
 * @return {String} fileName Name of the shapefile for specified country, empty string if not found
 */
const getFile = (shapefiles, country) => {
  let fileName = ''
  let files = shapefiles.filter(shapefile => {
    const fileName = shapefile.split('/')[1]
    return fileName.split('_')[0] === country
  })
  if (files.length > 0) {
    fileName = files[0]
  }
  return fileName
}

/**
 * Return an object with list of countries and aggregated data for each country
 * @param{String} kind - Type of data requested (population or mosquito)
 * @param{String} source - source from which data should be fetched
 * @param{String} country - country for which data should be fetched,
 *                          if not specified fetch data for all countries
 * @return{Promise} Fulfilled when records are returned
 */
export const countries_with_this_kind_data = (kind, source, country) => {
  return new Promise((resolve, reject) => {
    // Get country name for each shapefile
    getShapeFiles(kind, source)
    .then(shapefileSet => {
      if (country) {
        let fileName = getFile(shapefileSet.shapefiles, country)
        if (fileName.length > 0) {
          shapefileSet.country = country
          shapefileSet.fileName = fileName
          shapefileSet.shapefiles = []
          return getGeoProperties(shapefileSet)
                  .then(readShapeFile)
                  .then(mergePropertiesWithShapefile)
        } else {
          return reject('country not found')
        }
      } else {
        return aggregateShapeFiles(shapefileSet)
      }
    })
    .then(population => {
      return resolve(population)
    })
  })
}


/**
 * Returns geo-properties for a country
 * @param  {object} shapefileSet Object with information regarding requested data
 *                               e.g. country, name of shapefile etc.
 * @return {Promise} Fulfilled  when geo-properties are returned
 */
const getGeoProperties = (shapefileSet) => {
  return new Promise((resolve, reject) => {
    let fileName = shapefileSet.fileName
    let geo_props_file_name = fileName.match(/[a-z]{3}_\d/)[0].toUpperCase() + '.json'
    azure_utils.read_file('geo-properties', 'gadm2-8', geo_props_file_name)
    .then(admin_properties => {
      shapefileSet.admin_properties = admin_properties
      return resolve(shapefileSet)
    })
    .catch(error => {
      return reject('Error getting geo-properties for ' + shapefileSet.country)
    })
  })
}

/**
 * Returns list of shapefiles from specified source for specified kind of data
 * @param{String} kind - Type of data requested (population or mosquito)
 * @param{String} source - source from which data should be fetched
 * @return{Promise} Fulfilled  when shapefiles are returned
 */
export const getShapeFiles = (kind, source) => {
  return new Promise((resolve, reject) => {
    azure_utils.get_file_list(kind, source)
    .then(directories => {
      let dirs_shapefiles = extract_dirs(directories.entries.directories)
      let shapefiles = []
      bluebird.each(dirs_shapefiles, directory => {
        return azure_utils.get_file_list(kind, source + '/' + directory)
        .then(fileList => {
          fileList.entries.files.forEach(file => {
            shapefiles.push(directory + '/' + file.name)
          })
        })
      }, {concurrency: 1})
      .then(() => {
        resolve({kind, source, shapefiles})
      })
    })
  })
}

/**
 * Extracts and returns data from shapefiles
 * @param  {object} shapefileSet Object with information regarding requested data
 *                               e.g. country, name of shapefile etc.
 * @return {Promise} Fulfilled  when aggregated data is returned
 */
export const aggregateShapeFiles = (shapefileSet) => {
  return new Promise((resolve, reject) => {
    let population = {}
    shapefileSet.shapefiles.forEach(shapefile => {
      const fileName = shapefile.split('/')[1]
      const record = file_to_record(fileName);
      if(population[record.country]) {
        population[record.country].push(record);
      } else {
        population[record.country] = [record];
      }
    });
    return resolve(population);
  })
}


/**
 * Reads and returns content of a shapefile
 * @param  {object} shapefileSet Object with information regarding requested data
 *                               e.g. country, name of shapefile etc.
 * @return {Promise} Fulfilled  when a shapefile is read
 */
const readShapeFile = (shapefileSet) => {
  return new Promise((resolve, reject) => {
    let { kind, source, fileName, country } = shapefileSet
    const [ database, file ] = fileName.split('/')
    azure_utils.read_file(kind, source + '/' + database, file)
    .then(content => {
      shapefileSet.shapefile = content
      resolve(shapefileSet)
    })
  });
}


/**
 * This function will merge geo-properties with shapefile content
 * @param  {object} shapefileSet Object with information regarding requested data
 *                               e.g. country, name of shapefile etc.
 * @return {Promise} Fulfilled  when geo-properties are merged with shapefile content
 */
const mergePropertiesWithShapefile = (shapefileSet) => {

  return new Promise((resolve, reject) => {
    let { kind, source: dir, fileName, country, admin_properties, shapefile } = shapefileSet
    let [ raster, source  ] = fileName.split('^').slice(1, 3)
    let admin_to_value_map = {}
    admin_to_value_map.raster = raster
    admin_to_value_map.source = source
    admin_to_value_map.population = {}
    var value_map = shapefile.reduce((ary, element) => {
      var tempList = Object.keys(element).filter(key => {
        return ( key.startsWith('id_') )
      }).map(key => {
        return element[key]
      })

      let temp_map = {}
      temp_map[country + '_' + tempList.join('_') + '_' + dir] = element[config[kind].val_type]

      // Enrich each object with the feature properties from the original shapefile
      var admin_props = assign_correct_admin_from_admins(admin_properties, tempList);

      ary.push(Object.assign(
        {
          admin_id: country + '_' + tempList.join('_') + '_' + dir,
          value: element[config[kind].val_type]
        },
        admin_props
      )
    )
      return ary
    }, []);
    admin_to_value_map.population = value_map;
    resolve(admin_to_value_map)
  });
}


/**
 * Return object for raster that contains metadata gleaned from the raster file name
 * @param{Object} raster_blob_obj - raster blob object from storage
 * @return{Object} Raster metadata
 */
function file_to_record(file_obj) {
  let [ ary, raster, data_source, sum, sq_km ] = file_obj.split(/\^/);
  let [ country, admin_level, shapefile ] = ary.split('_')
  sum = parseFloat(sum);
  sq_km = parseInt(sq_km.replace(/.json/, ''));
  raster = raster.replace(/.json$/, '')
  let density = (sum/sq_km)

  return { country, data_source, shapefile, admin_level, sum, sq_km, density, raster }
}


/**
 * Returns directory names from an array of directory properties
 * @param  {List} ary Array of directory properties
 * @return {List}     List of names of directories
 */
function extract_dirs(ary) {
  return ary.map(e => { return e.name;});
}


/**
 * Returns files having case data of specified kind
 * @param  {String} key      Type of data requested (cases)
 * @param  {String} kind     Name of the epidemic
 * @param  {String} weekType Week type (epi or iso)
 * @param  {String} week     first day of week, if not specified it will fetch data for all the weeks
 * @return {Promise} Fulfilled  when case files are returned
 */
export const getCaseFiles = (key, kind, weekType, week) => {
  return new Promise((resolve, reject) => {
    let casesPath = config[key][kind].path + '/' + weekType
    azure_utils.get_file_list(key, casesPath)
    .then(files => {
      files = files.entries.files
      if (week !== undefined) {
        files = files.filter(file => {
          return file.name.replace(/.json/g, '') === week;
        });
        if (files.length !== 1) {
          console.error("Error -> File not found", week);
          return reject()
        }
      }
      return resolve({key, kind, weekType, files})
    })
  })
}


/**
 * Returns case data from the files
 * @param  {object} caseFiles Object with information regarding requested data
 *                               e.g. kind, list of case files etc.
 * @return {Promise} Fulfilled  when case data is read and returned
 */
export const readCaseFiles = (caseFiles) => {
  return new Promise((resolve, reject) => {
    var returnObj = {}
    let { key: key, kind:kind, weekType: weekType, files: files } = caseFiles
    bluebird.each(caseFiles.files, file => {
      var objKey = file.name.replace(/.json/g, '')
      let filePath = config[key][kind].path + '/' + weekType
      return azure_utils.read_file(key, filePath, file.name)
      .then(content => {
        returnObj[objKey] = content.countries
      })
      .catch(error => {
        console.log("Error", error)
      });
    }, {concurrency: 1})
    .then(() => {
      return resolve(returnObj)
    })
  })
}


/**
 * Fetches cases of specified kind for specified week. To get all the cases set week to null
 * @param  {String} key       Key for azure_helper (should always be cases)
 * @param  {String} kind      name of disease
 * @param  {String} week      Last day of the week
 * @param  {String} weekType  type of week (epi or iso)
 * @return {Promise} Fulfilled when records are returned
 */
export const get_cases = (key, kind, weekType, week) => {
  return new Promise((resolve, reject) => {
    getCaseFiles(key, kind, weekType, week)
    .then(readCaseFiles).catch(reject)
    .then(cases => { resolve(cases) })
    .catch(reject)
  });
}


/**
 * Returns list of properties for given query
 * @param  {String} queryString string specifing key for properties
 * @return {Promise} Fulfilled when records are returned
 */
export const getProperties = (queryString) => {
  return new Promise((resolve, reject) => {
    let queryParts = queryString.split('_')
    let key = queryParts[0]
    let path = ''
    switch(key) {
      case 'population': {
        if (queryParts.length === 2) {
          if (queryParts[1] === 'worldpop') {
            path += 'worldpop/' + config.population.default_database
          } else {
            azure_utils.read_file(key, 'worldbank', 'population.json')
            .then(content => {
              let properties = { key: queryParts.join('_'), properties: Object.keys(content) }
              return resolve(properties)
            })
            break;
          }
        }
        fetchProperty(key, path, '_', 0)
        .then(propertyList => {
          let properties = { key: queryParts.join('_'), properties: propertyList }
          return resolve(properties)
        })
        break;
      }

      case 'mosquito': {
        if (queryParts.length === 2) {
          path += queryParts[1] + '/' + config.mosquito.default_source + '/' + config.mosquito.default_database
        }
        fetchProperty(key, path, '_', 0)
        .then(propertyList => {
          let properties = { key: queryParts.join('_'), properties: propertyList }
          return resolve(properties)
        })
        break
      }

      case 'cases': {
        if (queryParts.length > 1) {
          path += config.cases[ queryParts[1] ].path + queryParts.slice(2).join('/')
        }
        fetchProperty(key, path, '.', 0)
        .then(propertyList => {
          let properties = { key: queryParts.join('_'), properties: propertyList }
          return resolve(properties)
        })
        break
      }
    }
  })
}


/**
 * Reads directory specified by key and path and returns list of properties
 * @param  {String} key     Key of the requested data
 * @param  {String} path    Path of the resource
 * @param  {String} splitOn string specified part of the properties to ignor (e.g. '.json' in case of JSON files)
 * @param  {int} part    specifies which part to select after spliting the property string
 * @return {Promise} Fulfilled when records are returned
 */
const fetchProperty = (key, path, splitOn, part) => {
  return new Promise((resolve, reject) => {
    azure_utils.get_file_list(key, path)
    .then(fileList => {

      let propertyList = fileList.entries.directories.length > 0  ? fileList.entries.directories: fileList.entries.files;
      propertyList = propertyList.reduce((list, element) => {
        list.push(element.name.split(splitOn)[part])
        return list
      }, [])
      return resolve(propertyList)
    })
  });
}


/**
  * Returns population metadata available from specified source for specified country.
  * If country is not specified it will return data for all countries.
 * @param  {String} source      Source for the population data
 * @param  {String} country     country for which we need the data
 * @return {Promise} Fulfilled  when records are returned
 */
export const getPopulation = (key, source, country) => {
  return new Promise((resolve, reject) => {
    source = (source !== undefined) ? source : config[key].default_source
    switch(source) {
      case 'worldpop': {
        countries_with_this_kind_data(key, source, country)
        .then(data => {
          return resolve(data)
        })
        .catch(reject)
        break
      }

      // case 'worldbank': {
      //   azure_utils.read_file('population', source, 'population.json')
      //   .then(content => {
      //     if (country !== undefined) {
      //       return resolve(content[country])
      //     } else {
      //       return resolve(content)
      //     }
      //   })
      //   .catch(reject)
      //   break
      // }
    }
  });
}


/**
  * Returns mosquito metadata available from specified source for specified country.
  * If country is not specified it will return data for all countries.
 * @param  {String} source      Source for the mosquito data
 * @param  {String} country     country for which we need the data
 * @return {Promise} Fulfilled  when records are returned
 */
export const getMosquito = (key, kind, country) => {
  return new Promise((resolve, reject) => {
    countries_with_this_kind_data(key, kind + '/' + config.mosquito.default_source, country)
    .then(data => {
      return resolve(data)
    })
    .catch(error => {
      return reject(error)
    })
  });
}


/**
 * Return admin properties that matches spark output ids
 * @param  {Array} admin_properties_ary admin properties per a country
 * @param  {Array} spark_output_ids ids from spark aggregation output
 * @return{Promise} Fullfilled Admin poperties obj
 */
function assign_correct_admin_from_admins(admin_properties_ary, spark_output_ids) {
  let index_short_cut = parseInt(spark_output_ids[spark_output_ids.length-1]) -1;
  return admin_properties_ary.slice(index_short_cut).find(p => {
    let count = 0;
    const temp_admin_id = Object.keys(p).reduce((ary, k) => {
      if (k == 'ID_' + count) {
        ary.push(p[k])
        count += 1;
      }
      return ary;
    }, [])

    return temp_admin_id.join('_') === spark_output_ids.join('_');
  })
}


/**
 * Fetches schools based on country and other options specified
 * @param  {string} country country code
 * @param  {object} options other options as connectivity, environment, water etc.
 *                          to limit number of schools use option max_limit
 * @return{Promise} Fullfilled when schools are returned
 */
export const getSchools = (country, options) => {
  return new Promise((resolve, reject) => {

    let select = 'SELECT address, admin0, admin1, admin2, admin3, admin4, admin_code, admin_id, altitude, availability_connectivity, connectivity, country_code, datasource, description, educ_level, electricity, environment, frequency, latency_connectivity, lat, lon, name, num_classrooms, num_latrines, num_teachers, num_students, num_sections, phone_number, postal_code, speed_connectivity, type_conectivity, type_school, water, created_at, updated_at FROM schools'

    options.country_code = country

    // let select = 'SELECT * from home_temp'
    // options.dept = country

    dbClient.execute(select, options)
    .then(resolve)
    .catch(reject)
  })
}
