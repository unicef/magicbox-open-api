# Magic Box Open API
Magic Box Open API provides data, aggregated from various sources. The data that is made available includes,
1. population of different countries
2. mosquito prevalence in different countries
3. Confirmed cases of an epidemic in an epi-week and iso-week, currently only Zika

You can access the API [here](http://mb-api.azurewebsites.net/docs/#/default)

### 1. Population:
Magic box fetches and provides population of different countries recorded by [WorldPop](http://www.worldpop.org.uk/)
You can either request for specific country or all the countries.
API end points:
```
http://mb-api.azurewebsites.net/api/population/{country}
```
If no country name is specified then API will return population of all the countries.

### 2. Mosquito Prevalence:
Mosquiro Prevalence indicates comonness of having mosquitos in a country. Currently we are only focusing on 2 types of mosquitos, namely:
1. Aegypti
2. Albopictus
<br />API to access mosquito prevalence is:
```
http:mb-api.azurewebsites.net/api/mosquito/{kind}
```
