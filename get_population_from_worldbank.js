const fs = require('fs')
const csvtojson = require('csvtojson')
let population = {}
const source = 'worldbank'
const admin_level = 0

csvtojson()
.fromFile('./POP.csv')
.on('json', row => {
  population[row.iso.toLowerCase()] = {
    country: row.iso.toLowerCase(),
    data_source: source,
    admin_level: admin_level,
    sum: parseInt(row.population.replace(/,/g, '')) * 1000
  }
})
.on('done', () => {
  fs.writeFileSync('./population.json', JSON.stringify(population))
})

// ../mnt/population/worldbank/
