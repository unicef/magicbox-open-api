/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var validateRecursive = require('./helpers/validate-recursive');
var consolidateErrors = require('./helpers/consolidate-errors');

/**
 * Like `validate()`, but doesn't tolerate and coerce minor
 * type incompatibilities such as '1'=>1, 'true'=>true, etc.
 *
 * @param  {~Schema} expected   type schema
 * @param  {===} actual           "mystery meat"
 */
module.exports = function validateStrict (expected, actual) {

  // Avoid damaging `expected`
  expected = _.cloneDeep(expected);

  var errors = [];
  var result = validateRecursive(expected, actual, errors, true, undefined, true);
  // (first `true` => `ensureSerializable` -- i.e. ensure the thing is JSON-serializable, if possible)
  // (second `true` => `strict` -- i.e. don't ignore minor type errors)

  // If there are still errors, coallesce the remaining list of errors into a single
  // Error object we can throw.
  var err = consolidateErrors(errors, 'validating value');
  if (err) throw err;
};


