import fs from 'fs'
import csvtojson from 'csvtojson'
import * as azure_utils from './utils/azure'

let population = {}
const source = 'worldbank'
const key_country_code = 'Country Code'
const key_population_2016 = '2016'
const admin_level = 0

csvtojson()
.fromFile('./POP.csv')
.on('json', row => {
  population[row[key_country_code].toLowerCase()] = {
    country: row[key_country_code].toLowerCase(),
    data_source: source,
    admin_level: admin_level,
    sum: parseInt(row[key_population_2016].replace(/,/g, ''))
  }
})
.on('done', () => {
  azure_utils.createAndWriteFile('population', 'worldbank', 'population.json', JSON.stringify(population))
  .then(() => {
    console.log('worldbank population done!');
  })
})
