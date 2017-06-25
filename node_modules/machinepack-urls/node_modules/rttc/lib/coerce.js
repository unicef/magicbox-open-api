/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var validateRecursive = require('./helpers/validate-recursive');
var consolidateErrors = require('./helpers/consolidate-errors');

/**
 * Coerce value to type schema
 * (very forgiving)
 *
 * @param  {~Schema} expected   type schema
 * @param  {===} actual           "mystery meat"
 * @return {<expected>}
 */
module.exports = function coerce (expected, actual){

  var errors = [];

  // Avoid damaging `expected`
  expected = _.cloneDeep(expected);

  // Jump into recursive validation
  var result = validateRecursive(expected, actual, errors, true);
  // (the true => `ensureSerializable` -- i.e. ensure the thing is JSON-serializable)

  // Strip out "E_INVALID_TYPE" errors- they are ok if we're just coercing.
  _.remove(errors, {code: 'E_INVALID_TYPE'});

  // Strip out "E_COERCION" errors- they are ok if we're just coercing.
  _.remove(errors, {code: 'E_COERCION'});

  // TODO:
  // Note that it would be more efficient to pass in a list of error codes
  // to ignore when calling `validateRecursive`, rather than iterating through
  // the list of errors afterwards and stripping them out.

  // If there are still errors, coallesce the remaining list of errors into a single
  // Error object we can throw.
  var err = consolidateErrors(errors, 'coercing value');
  if (err) throw err;
  else return result;
};
