/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var types = require('./helpers/types');
var coerce = require('./coerce');
var parse = require('./parse');
var hydrate = require('./hydrate');


/**
 * Convert a string that was entered by a human into a value
 * of the appropriate type. If optional type schema is provided,
 * use it to make a better guess.
 *
 * @param  {String} humanString
 * @param  {*} expectedTypeSchema  [optional]
 * @param  {Boolean} unsafeMode  - enable to use `eval` to hydrate stringified functions based on `expectedTypeSchema` (this is not safe to use on user-provided input and so is disabled by default)
 * @return {*}
 */
module.exports = function parseHuman (humanString, expectedTypeSchema, unsafeMode) {

  if (!_.isString(humanString)) {
    throw new Error('rttc.parseHuman() expects a string value, but a '+typeof humanString+' was provided:'+util.inspect(humanString, false, null));
  }

  if (unsafeMode && _.isUndefined(expectedTypeSchema)) {
    throw new Error('rttc.parseHuman() cannot enable `unsafeMode` without also providing a `expectedTypeSchema`.');
  }

  // If no type schema was specified, we will try to make a nice number or boolean
  // out of the value, but if that doesn't work, we'll leave it a string.
  if (_.isUndefined(expectedTypeSchema)) {
    try {
      return types.number.to(humanString);
    }
    catch (e){}
    try {
      return types.boolean.to(humanString);
    }
    catch (e){}
    return humanString;
  }

  // If the type schema is expecting a simple string, boolean, or number,
  // just coerce it and send the result back.
  if (expectedTypeSchema === 'string' || expectedTypeSchema === 'number' || expectedTypeSchema === 'boolean') {
    return coerce(expectedTypeSchema, humanString);
  }

  // If the type schema is expecting a simple lamda function, attempt to use hydrate.
  // (but if `unsafeMode` is disabled, just return the string as-is)
  if (expectedTypeSchema === 'lamda') {
    if (!unsafeMode) return humanString;
    return hydrate(humanString, expectedTypeSchema);
  }

  // Otherwise, we'll assume this was entered as JSON and parse it first...
  // ...and if we make it past that, then we'll coerce the final result.
  return coerce(expectedTypeSchema, parse(humanString, expectedTypeSchema, unsafeMode));
};
