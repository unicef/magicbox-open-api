/**
 * Module dependencies
 */

var _ = require('lodash');
var types = require('./helpers/types');



/**
 * Given a primitive value, return its type.
 * ________________________________________________________________________________
 * @param  {*} val      there's that "mystery meat" again
 * ________________________________________________________________________________
 * @returns {String}
 */

function getTypeOfPrimitive(val) {

  // Check for `type: 'ref'` (===)
  if (val === '===' || val === undefined) {
    return 'ref';
  }

  // Check for `type: 'lamda'` (->)
  if (_.isString(val) && val.match(/(^-+>$)|(^=+>$)|(^<=+$)|(^<-+$)/)) {
    return 'lamda';
  }

  // Check for `type: 'json'` (*)
  if (val === '*') {
    return 'json';
  }

  // Check for string
  if(types.str.is(val)) {
    return 'string';
  }

  // Check for number
  if(types.number.is(val)) {
    return 'number';
  }

  // Check for boolean
  if(types.bool.is(val)) {
    return 'boolean';
  }

  // This return value of undefined means the inference failed.
  return;
}


/**
 * Recursively create a new schema object from an example object.
 * ________________________________________________________________________________
 * @param {Object} obj
 * ________________________________________________________________________________
 * @returns {Object} If this is an object, returns a new schema object.
 * @returns {undefined} If `obj` is not an object
 */

function getSchemaOfObject(obj) {
  if(!types.obj.is(obj)) return;

  var newObj = {};
  _.each(_.keys(obj), function(key) {
    var val = obj[key];

    var type;
    if(types.arr.is(val)) {
      type = getSchema(val);
    }
    else if(types.obj.is(val)) {
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
 * Given an example, parse it to infer its schema.
 * ________________________________________________________________________________
 * @param  {*} example
 * ________________________________________________________________________________
 * @returns {*} a schema object
 */

function getSchema(example) {

  // If the example isn't an object or array, we will derive its primitive type.
  if(!types.obj.is(example) && !types.arr.is(example)) {
    return getTypeOfPrimitive(example);
  }

  // If the example is an array, figure out what to do.
  // For now just check that it's an array.
  if(types.arr.is(example)) {

    // Ensure empty arrays are not recursively parsed.
    if (example.length === 0) {
      return [];
    }

    // Parse arrays of arrays
    if (_.isArray(example[0])) {
      return [getSchema(example[0])];
    }

    // Parse arrays of objects
    if (_.isObject(example[0])) {
      return [getSchemaOfObject(example[0])];
    }

    // Parse arrays of primitives
    return [getTypeOfPrimitive(example[0])];
  }

  // Otherwise parse the object
  return getSchemaOfObject(example);

}

module.exports = getSchema;
