import config from '../config'
import azure_storage from 'azure-storage'
import jsonfile from 'jsonfile'
import * as azure_utils from './azure'
import fs from 'fs'
const csvjson = require('csvjson');

const storage_account = config.azure.storage_account
const azure_key = (process.env.NODE_ENV !== 'test') ? config.azure.key1 : ''
// Magicbox open api pulls from Azure.
// If you don't have a valid azure storage key
// then data will be served from the public directory
console.log(azure_key)
console.log('____')
const fileSvc = is_valid_key(azure_key) ?
  azure_storage.createFileService(storage_account, azure_key) :
  null
const base_dir = config.azure.directory

/**
 * Gets list of country population aggregation blobs
 * Just in case we want to only process files that we don't already have
 * @param{String} key - Azure file service acess key
  * @return{Promise} Fulfilled list of blobs
 */
function is_valid_key(key) {
  return key.length > 20
}

/**
 * Gets list of country population aggregation blobs
 * Just in case we want to only process files that we don't already have
 * @param{String} kind - Name of blob container
 * @param{String} dir - Name of blob container
 * @return{Promise} Fulfilled list of blobs
 */
export function get_file_list(kind, dir) {
  return new Promise((resolve, reject) => {
    if (fileSvc) {
      azure_utils.get_file_list(fileSvc, kind, dir)
      .catch(console.log)
      .then(resolve)
    } else {
      let path = './public/aggregations/' + [kind, dir].join('/')
      let dir_contents_obj = {entries: {}};

      dir_contents_obj.entries.directories = fs.readdirSync(path)
      .filter(file => {
        return fs.statSync(path+'/'+file).isDirectory();
      }).map(e => {
        return {name: e};
      })

      dir_contents_obj.entries.files = fs.readdirSync(path).filter(file => {
        return !fs.statSync(path+'/'+file).isDirectory();
      }).map(e => {
        return {name: e};
      })

      resolve(dir_contents_obj)
      // fs.readdir('./public/aggregations/' + [kind, dir].join('/'), (err, data) => {
      //   console.log(data)
      //   resolve(data)
      // })
    }
  })
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
    // Check if using azure, if not, grab from prepped data in public dir.
    if (fileSvc) {
      azure_utils.read_file(fileSvc, key, dir, fileName)
      .catch(console.log)
      .then(resolve)
    } else {
      if (fileName.match(/\.csv$/)) {
        let path = './public/' + [base_dir, key, dir, fileName].join('/')
        return read_csv(path).then(resolve);
      }
      console.log('./public/' + [base_dir, key, dir, fileName].join('/'))
      jsonfile.readFile(
        './public/' + [base_dir, key, dir, fileName].join('/'),
        (err, data) => {
          resolve(data)
        }
      )
    }
  });
}

/**
 * Read a file and return Json object with the file content
 * @param  {String} path Path to CSV
 * @return {Promise} Fulfilled when records are returned
 */
function read_csv(path) {
  return new Promise((resolve, reject) => {
    let data = fs.readFileSync(path, {encoding: 'utf8'});
      resolve(csvjson.toObject(data, {}))
  })
}
