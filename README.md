# Magic Box Open API
Magic Box Open API provides data, aggregated from various sources. The data that is made available includes,
1. population of different countries
2. mosquito prevalence in different countries
3. Confirmed cases of an epidemic in an epi-week and iso-week, currently only Zika

You can access the API [here](http://mb-api.azurewebsites.net/docs/#/default)

### 1. Population:
Magic box fetches and provides population of different countries recorded by [WorldPop](http://www.worldpop.org.uk/)

* ***URL***

    ` /api/population/ `

* ***Method***

    ` GET `

* ***Success Response***
    ```
    CODE: 200
    RESPONSE:
            {
              "data_kind": "population",
              "data": {
                "afg": [
                  {
                    "country": "afg",
                    "data_source": "worldpop",
                    "shapefile_set": "gadm2-8",
                    "admin_level": "2",
                    "sum": 45155184,
                    "sq_km": 248596,
                    "density": 181.64083090637018,
                    "raster": "popmap15adj"
                  }
                ]
              }
            }
    ```

### 2. Mosquito Prevalence:
Mosquiro Prevalence indicates comonness of having mosquitos in a country. Currently we are only focusing on 2 types of mosquitos, namely:
1. Aegypti
2. Albopictus

* ***URL***

    ` /api/mosquito/{kind} `

* ***Method***

    ` GET `

* ***URL Params***

    ` kind=[String] `

* ***Success Response***
    ```
    CODE: 200
    RESPONSE:
    {
      "data_kind": "aegypti",
      "data": {
        "abw": [
          {
            "country": "abw",
            "data_source": "simon_hay",
            "shapefile_set": "gadm2-8",
            "admin_level": "0",
            "sum": 0.92733,
            "sq_km": 70,
            "density": 0.013247571428571428,
            "raster": "aegypti"
          }
        ]
      }
    }
    ```
* ***Sample Call***
    `http://mb-api.azurewebsites.net/api/mosquito/aegypti`

### 3. Cases:
Confirmed cases of an epidemic (kind) per epi week or iso week around the world.

* ***URL***

    ` /api/cases/{kind}/{weekType}/ `

* ***Method***

    `GET`

* ***URL Params***

    `kind = [String]`

    `weekType = [String]`

* ***Success Response***
    ```
    CODE: 200
    RESPONSE:
    {
    "kind": "zika",
    "weekType": "epi",
    "cases": {
        "2016-11-17": {
          "can": {
            "country": "Canada",
            "autochthonous_cases_suspected": 0,
            "autochthonous_cases_confirmed": 0,
            "imported_cases": 374,
            "incidence_rate": 0,
            "deaths": 0,
            "confirmed_congenital": 0,
            "population_x_1k": 36286,
            "congenital_suspected": 0,
            "congenital_probable": 0,
            "gbs_total": 0,
            "gbs_confirmed": 0
          }
        }
      }
    }
    ```

* ***Sample Call***

    `http://mb-api.azurewebsites.net/api/cases/zika/epi`
