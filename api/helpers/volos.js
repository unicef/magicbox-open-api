/****************************************************************************
 The MIT License (MIT)
 Copyright (c) 2014 Apigee Corporation
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
// 'use strict';

var debug = require('debug')('helpers');
const config = require('../../config')

module.exports = {
  cachePopulation,
  cachePopulationProperties,
  cachePopulationCountries,
  cacheCases,
  cacheCasesProperties,
  cacheMosquitoProperties,
  cacheMosquito
};

function cachePopulation(req) {
  let key = 'population' + getKeyForRequest(req.swagger.params)
  if (debug.enabled) { debug('Cache Key: '+key); }
  return key;
}

function cachePopulationCountries(req) {
  let key = 'population_' + config.population.default_source + getKeyForRequest(req.swagger.params)
  if (debug.enabled) { debug('Cache Key: '+ key + '_properties'); }
  return key;
}

function cacheMosquitoProperties(req) {
  let key = 'mosquito'
  key += getKeyForRequest(req.swagger.params)
  if (debug.enabled) { debug('Cache Key: '+ key + '_properties'); }
  console.log('key', key);
  return key;
}

function cacheMosquito(req) {
  let key = 'mosquito' + getKeyForRequest(req.swagger.params)
  if (debug.enabled) { debug('Cache Key: '+key); }
  return key;
}

function cacheCases(req) {
  var key = 'cases' + getKeyForRequest(req.swagger.params);
  if (debug.enabled) { debug('Cache Key: '+ key); }
  return key;
}

function cachePopulationProperties(req) {
  let key = 'population'
  key += getKeyForRequest(req.swagger.params)
  if (debug.enabled) { debug('Cache Key: '+ key + '_properties'); }
  return key;
}

function cacheCasesProperties(req) {
  let key = 'cases'
  key += getKeyForRequest(req.swagger.params)
  if (debug.enabled) { debug('Cache Key: '+ key + '_properties'); }
  return key;
}

const getKeyForRequest = (params) => {
  let key = ''
  let paramKeys = Object.keys(params)
  for (let property of paramKeys) {
    if (params[property] === undefined) {
      key += '_' + property
      break;
    } else {
      key += '_' + params[property].value
    }
  }
  return key
}
