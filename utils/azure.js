import config from '../config'
// var config = require('../config');

/**
 * Gets list of country population aggregation blobs
 * Just in case we want to only process files that we don't already have
 * @param{String} container_name - Name of blob container
 * @return{Promise} Fulfilled list of blobs
 */
export function get_file_list(fileSrv, kind, dir) {

  let {directory: rootDir, path = null} = config[kind].azure
  path = dir ? path + dir : path

  return new Promise((resolve, reject) => {
    fileSrv.listFilesAndDirectoriesSegmented(rootDir, path, null, function(err, result, response) {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
