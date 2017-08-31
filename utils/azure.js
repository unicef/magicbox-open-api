import config from '../config'
import azure_storage from 'azure-storage'

const storage_account = config.azure.storage_account
const azure_key = config.azure.key1
const fileSvc = azure_storage.createFileService(storage_account, azure_key)
const base_dir = config.azure.directory

/**
 * Gets list of country population aggregation blobs
 * Just in case we want to only process files that we don't already have
 * @param{String} kind - Name of blob container
 * @param{String} dir - Name of blob container
 * @return{Promise} Fulfilled list of blobs
 */
export function get_file_list(kind, dir) {
  let path = config[kind].path
  path = dir ? path + dir : path
  return new Promise((resolve, reject) => {
    fileSvc.listFilesAndDirectoriesSegmented(
      base_dir, path, null, function(err, result, response) {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Read a file and return Json object with the file content
 * @param  {String} key Key for the request. This determines root dir for the file
 * @param  {String} dir dir of file
 * @param  {String} fileName File to read
 * @return {Promise} Fulfilled when records are returned
 */
export function read_file(key, dir, fileName) {
  return new Promise((resolve, reject) => {
    let path = config[key].path;
    path = dir ? path + dir : path;
    fileSvc.getFileToText(
      base_dir, path, fileName, (error, fileContent, file) => {
      if (!error) {
        resolve(JSON.parse(fileContent));
      } else {
        console.log('Error while reading', base_dir+path+fileName);
      }
    });
  });
}
