/**
 * Module dependencies
 */

var _ = require('lodash');
var TYPES = require('./helpers/types');
var dehydrate = require('./dehydrate');
var buildSchemaIterator = require('./helpers/build-schema-iterator');

/**
 * Given an exemplar schema and a keypath, return information
 * about the specified segment.
 *
 * If the path is inside of a generic, then the exemplar is '*',
 * and this path is optional. If the path is inside of a `ref`,
 * then the exemplar is '===', and this path is optional.
 *
 * @param  {*} schema
 * @return {{}}
 */
module.exports = function getPathInfo (schema, path) {

  // Dehydrate the schema to avoid circular recursion
  var dehydratedSchema = dehydrate(schema);

  // Derive an array of "hops" from the provided keypath.
  var hops = (path === '') ? [] : path.split('.');

  // These variables are used by the iterator below.
  var currentExemplar = dehydratedSchema;
  // By default the path is not optional.
  var optional = false;


  _.each(hops, function dereferenceEach(hop){

    if (_.isArray(currentExemplar)) {
      if (!_.isFinite(+hop)) {
        // If the hop cannot be cast to a positive integer,
        // something funny is going on.
        throw new Error('Invalid keypath: "'+path+'" (non-numeric hop `'+hop+'` is not a valid array index)');
      }

      // generic array
      if (_.isEqual(currentExemplar, [])) {
        optional = true;
        currentExemplar = TYPES.json.getExemplar();
      }
      // patterned array
      else {
        optional = false;
        if (_.isUndefined(currentExemplar[0])) {
          throw new Error('Invalid keypath: "'+path+'" (unreachable in schema)');
        }
        else {
          currentExemplar = currentExemplar[0];
        }
      }
    }
    else if (_.isObject(currentExemplar)) {
      // generic dictionary
      if (_.isEqual(currentExemplar, {})) {
        optional = true;
        currentExemplar = TYPES.json.getExemplar();
      }
      // facted dictionary
      else {
        optional = false;
        if (_.isUndefined(currentExemplar[hop])) {
          throw new Error('Invalid keypath: "'+path+'" (unreachable in schema)');
        }
        else {
          currentExemplar = currentExemplar[hop];
        }
      }
    }
    // generic json
    else if (TYPES.json.isExemplar(currentExemplar)) {
      optional = true;
      currentExemplar = TYPES.json.getExemplar();
    }

    // mutable reference
    else if (TYPES.ref.isExemplar(currentExemplar)) {
      optional = true;
      currentExemplar = TYPES.ref.getExemplar();
    }

    // lamda
    else if (TYPES.lamda.isExemplar(currentExemplar)) {
      throw new Error('Invalid keypath: "'+path+'" (unreachable in schema)');
    }

    // primitive
    else {
      throw new Error('Invalid keypath: "'+path+'" (unreachable in schema)');
    }
  });


  return {
    exemplar: currentExemplar,
    optional: optional
  };

};


