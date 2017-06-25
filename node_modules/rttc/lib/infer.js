/**
 * Module dependencies
 */

var _ = require('lodash');
var types = require('./helpers/types');



/**
 * Given a primitive exemplar, return its type.
 * ________________________________________________________________________________
 * @param  {*} eg      there's that "mystery meat" again
 * ________________________________________________________________________________
 * @returns {String}
 */

function getTypeOfPrimitive(eg) {

  // Check for `type: 'ref'` (===)
  if (types.ref.isExemplar(eg)) {
    return 'ref';
  }

  // Check for `type: 'lamda'` (->)
  if (types.lamda.isExemplar(eg)) {
    return 'lamda';
  }

  // Check for `type: 'json'` (*)
  if (types.json.isExemplar(eg)){
    return 'json';
  }

  // Check for string
  if (types.string.isExemplar(eg)) {
    return 'string';
  }

  // Check for number
  if (types.number.isExemplar(eg)) {
    return 'number';
  }

  // Check for boolean
  if (types.boolean.isExemplar(eg)) {
    return 'boolean';
  }

  // This return value of undefined means the inference failed.
  return;
}


/**
 * Recursively create a new type schema dictionary from an exemplar.
 * ________________________________________________________________________________
 * @param {Object} obj
 * ________________________________________________________________________________
 * @returns {Object} If this is an object, returns a new schema object.
 * @returns {undefined} If `obj` is not an object
 */

function getSchemaOfObject(obj) {
  if(!types.dictionary.is(obj)) return;

  var newObj = {};
  _.each(_.keys(obj), function(key) {
    var val = obj[key];

    var type;
    if(types.array.is(val)) {
      type = infer(val);
    }
    else if(types.dictionary.is(val)) {
      type = getSchemaOfObject(val);
    }
    else {
      type = getTypeOfPrimitive(val);
    }
    newObj[key] = type;
  });

  return newObj;
}




/**
 * Given an exemplar, parse it to infer its type schema.
 * ________________________________________________________________________________
 * @param  {*} eg
 * ________________________________________________________________________________
 * @returns {*} a type schema
 */

function infer(eg) {

  // If the exemplar isn't an object or array, we will derive its primitive type.
  if(!types.dictionary.is(eg) && !types.array.is(eg)) {
    return getTypeOfPrimitive(eg);
  }

  // If the exemplar is an array, figure out what to do.
  // For now just check that it's an array.
  if(types.array.is(eg)) {

    // Ensure empty arrays are not recursively parsed.
    if (eg.length === 0) {
      return [];
    }

    // Parse arrays of arrays
    if (_.isArray(eg[0])) {
      return [infer(eg[0])];
    }

    // Parse arrays of objects
    if (_.isObject(eg[0])) {
      return [getSchemaOfObject(eg[0])];
    }

    // Parse arrays of primitives
    return [getTypeOfPrimitive(eg[0])];
  }

  // Otherwise parse the object
  return getSchemaOfObject(eg);

}

module.exports = infer;
