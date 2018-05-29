import config from '../config'
const base_dir = config.azure.directory
const csvjson = require('csvjson');
// import jsonfile from 'jsonfile'

/**
 * Gets list of country population aggregation blobs
 * Just in case we want to only process files that we don't already have
 * @param{String} fileSvc - Azure file service - might be null
 * @param{String} kind - Name of blob container
 * @param{String} dir - Name of blob container
 * @return{Promise} Fulfilled list of blobs
 */
export function get_file_list(fileSvc, kind, dir) {
  let path = config[kind].path
  path = dir ? path + dir : path
  return new Promise((resolve, reject) => {
    fileSvc.listFilesAndDirectoriesSegmented(
      base_dir, path, null, function(err, result, response) {
      if (err) {
        return reject(err);
      } else {
        console.log(base_dir, path, '!!!!', JSON.stringify(result))
        resolve(result);
      }
    });
  });
};

/**
 * Read a file and return Json object with the file content
 * @param{String} fileSvc - Azure file service - might be null
 * @param  {String} key Key for the request. This determines root dir for the file
 * @param  {String} dir dir of file
 * @param  {String} fileName File to read
 * @return {Promise} Fulfilled when records are returned
 */
export function read_file(fileSvc, key, dir, fileName) {
  return new Promise((resolve, reject) => {
    let path = config[key].path;
    path = dir ? path + dir : path;
    // Check if using azure, if not, grab from prepped data in public dir.
    fileSvc.getFileToText(
      base_dir, path, fileName, (error, fileContent, file) => {
      if (!error) {
        // uncomment to create fixtures.
        // jsonfile.writeFile('./public/aggregations/' + [key, dir, fileName].join('/'), JSON.parse(fileContent), function (err) {
        //   console.error(err)
        // })
        resolve(csvjson.toObject(fileContent, {}))
        // resolve(JSON.parse(fileContent));
      } else {
        console.log('Error while reading', base_dir+path+fileName);
      }
    });
  });
}
