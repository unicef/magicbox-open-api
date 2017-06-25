/**
 * Module dependencies
 */

var coerce = require('./coerce');
var infer = require('./infer');


/**
 * A convenience method to return the base val for the given value.
 *
 * @param  {===} val
 * @return {*?}
 */
module.exports = function getBaseVal(val){
  return coerce(infer(val));
};
