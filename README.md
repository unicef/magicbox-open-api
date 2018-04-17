Magic Box API
=============

[![Chat on Gitter](https://badges.gitter.im/unicef-innovation-dev/Lobby.png)](https://gitter.im/unicef-innovation-dev/Lobby)
[![Build Status](https://travis-ci.org/unicef/magicbox-open-api.svg?branch=master)](https://travis-ci.org/unicef/magicbox-open-api)
[![Maintainability](https://api.codeclimate.com/v1/badges/d36cba5a7e783ffd8970/maintainability)](https://codeclimate.com/github/unicef/magicbox-open-api/maintainability)

[Magic Box](https://github.com/unicef/magicbox/wiki) is an open-source platform that is intended to use real-time information to inform life-saving humanitarian responses to emergency situations. It’s composed of multiple github repositories designed to ingest, aggregate, and serve data.

### Install the API that serves the data

Magic Box API serves information useful to the data science team at the Office Of Innovation at UNICEF. This section describes how to install a local instance. It comes with sample data, but you can follow links below for code to download and aggregate many of the open data sets.

Types of data currently available to the public include:

- population
- mosquito prevalence
- Paho Zika case data
- School location and connectivity

...aggregated at municipal, state, and national levels.


### Dependencies:
#### NVM
	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
#### Node.js
	nvm install 8
## Setup

    git clone https://github.com/unicef/magicbox-open-api.git
    cd magicbox-open-api
    cp config-sample.js config.js
    npm install
    npm run build
    npm run start

Now browse to: localhost:8000/docs

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/expand_pop.gif)

The first endpoint: /api/v1/population/countries, returns a list of codes for countries for which we have population data:
````
[ ‘afg’, ‘ago’, ‘arg’ … ‘zwe’]
````

The second endpoint returns population data for a single country. For instance, to fetch the population for Afghanistan at the district level, browse to: localhost:8000/api/v1/population/countries/afg

	[
 	  { admin_id: ‘afg_1_5_50_gadm2–8’, value: 165297 },
	  { admin_id: ‘afg_1_4_33_gadm2–8’, value: 175117 },
	  { admin_id: ‘afg_1_7_57_gadm2–8’, value: 49994},
	  { admin_id: ‘afg_1_11_102_gadm2–8’, value: 50304 },

	  … 228 more items
	]

### What does this mean?
The value points to number of people. But, what swath of land does each admin_id refer to?

Answer: An admin ID points to a specific shape in a shapefile that represents an individual country.

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/afg_shapefile.png)

To understand where afg_1_11_102-gadm2–8 points to, first note that Afghanistan has three levels of administrative boundaries:

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/admin_levels.png)

The admin_id has three integers, one per admin level:

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/admin_levels_arrows.png)

The first integer is 1 because Afghanistan is the first country in the collection of 254 available at gadm.org.

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/afg_thru_zwe.png)

As for the second and third integers, Afghanistan has 34 shapes at admin level one (each shape is assigned an ID), and 320 shapes in admin 2.

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/admin_1_and_2v2.png)

Thus, afg_1_11_102-gadm2–8 indicates that any population value attached to it is related to:

- The first country in the gadm collection.
- The 11th shape in the admin 1 level shapefile.
- The 102nd shape in the admin 2 level shapefile.

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/admin_id_explain_all.png)

### Mosquito Prevalence (University of Oxford)

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/mos_endpoints.png)

- Currently, the API serves prevalence scores at both a national and district/province level per country. Scores range from 0 to 1. Browse to localhost:8000/api/v1/mosquito/kinds to see what mosquito types we have data for:

````
[ ‘aegypti’, ‘albopictus’ ]
````
- Browse to localhost:8000/api/v1/mosquito/kinds/aegypti for a country by country list:
````
	{
	  abw: 0.92733,
	  afg: 0.12469,
	  …
	  zwe: 0.54493
	}
````

Similar to Population, you can also use:

- /api/v1/mosquito/kinds/aegypti/countries to retrieve a list of country_codes
- /api/v1/mosquito/kinds/aegypti/countries/afg/ to get mosquito prevalence scores per district.

### Zika Case Data (Paho)

The API serves Zika case data for the Americas (national level) as published by the Pan American Health Organization in excel files each epi week. In order to overlay with travel data given to us by Amadeus, we’ve also used a *really* simple algorithm to group the cases by ISO week.

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/epi_iso.png)

To fetch all zika case data to date for either week type, use these end points:
- localhost:8000/api/v1/cases/kinds/zika/weekTypes/iso
- localhost:8000/api/v1/cases/kinds/zika/weekTypes/epi

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/case_output.png)

#### To serve the same data as the [live API](http://magicbox-open-api.azurewebsites.net/docs), follow the [Magic Box Wiki](https://github.com/unicef/magicbox/wiki)!
