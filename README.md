# The Magic Box API

Magic Box is an open-source platform that is intended to use real-time information to inform life-saving humanitarian responses to emergency situations. It’s composed of multiple github repositories designed to ingest, aggregate, and serve data.

### Quick Start: Installing the API that serves the data

Magic Box API serves information useful to the data science team at the Office Of Innovation at UNICEF. This section describes how to install a local instance. It comes with sample data, but you can follow links below for code to download and aggregate many of the open data sets.

Types of data currently available to the public include:

- population
- mosquito prevalence
- Paho Zika case data
- School location and connectivity

...aggregated at municipal, state, and national levels.

## Setup

	git clone https://github.com/unicef/magicbox-open-api.git
	cd magicbox-open-api
	cp config-sample.js config.js
	npm install
	npm run start

Now browse to: localhost:8000/docs

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/expand_pop.gif)

Expand ‘population’ and you’ll see *two* end points.

![Screenshot](https://github.com/unicef/magicbox-open-api/blob/master/public/images/expand_pop.png)
