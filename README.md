# Magic Box Open API
This API was created to serve information useful to the data science team at the Office Of Innovation at UNICEF. Actual data served by the API is currently hosted on Azure and fetched via the Azure [File Service](https://www.npmjs.com/package/azure-storage). However, samples of each dataset are in the public directory of this repository. In case you don't have a valid Azure storage account key, the Public directory will be the default datasource.



Current available data includes:
- [Population rasters](worldpop.org.uk) aggregated by [shapefiles](gadm.org).
- [Mosquito prevalence](https://elifesciences.org/articles/08347) in aggregated by shapefiles.
- [Paho case data](paho.org/hq/index.php?option=com_content&view=article&id=12390&Itemid=42090&lang=en) for Zika in the Americas grouped by [epi-week and iso-week](https://medium.com/@mikefabrikant/epi-week-to-iso-week-overlaying-virus-case-data-with-mobility-b071fe431811).

You can access the API [here](http://magicbox-open-api.azurewebsites.net/docs).

[Here](https://medium.com/@mikefabrikant/unicefs-open-api-70b6d8530b99) is an article that introduces it.

### Set up, install and run
```bash
  git clone https://github.com/unicef/magicbox-open-api.git
  cd magicbox-open-api
  cp config-sample.js config.js
  npm install
  npm run start
```
### Sample end points
#### Population
[/api/v1/population/countries](magicbox-open-api.azurewebsites.net/api/v1/population/countries) returns a list of country codes (ISO 3) for which exists population data on the server.
![ScreenShot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/rsz_2countries.png)

[/api/v1/population/countries/afg](magicbox-open-api.azurewebsites.net/api/v1/population/countries) returns an array of geo-properties along with an admin ID and population value. Each country is served according to the highest admin level available by gadm.org.
![ScreenShot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/rsz_afghanistan_population.png)
