/**
 * Module dependencies
 */

var _ = require('lodash');
var rebuildSanitized = require('./helpers/sanitize');


/**
 * Dehydrate/sanitize a value recursively:
 *   • stringifying functions, dates, regexps, and errors, as well
 *   • taking care of circular references
 *   • normalizing -Infinity, Infinity, and NaN (to 0)
 *   • stripping undefined (and potentially null) keys and values. If `allowNull` is set, `null` values will not be stripped from the encoded string.
 *
 * @param  {===} value
 * @param  {Boolean} allowNull  [defaults to false]
 * @param  {Boolean} dontStringifyFunctions  [defaults to false]
 * @return {String}
 */
module.exports = function dehydrate (value, allowNull, dontStringifyFunctions) {
  return rebuildSanitized(value,allowNull,dontStringifyFunctions);
};
