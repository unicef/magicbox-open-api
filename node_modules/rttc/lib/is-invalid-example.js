/**
 * Module dependencies
 */

var _ = require('lodash');
var infer = require('./infer');


/**
 * isInvalidExample()
 *
 * Although `undefined` technically is inferred as "ref", this function
 * considers it an invalid example
 *
 * @param  {*} example
 * @return {===} truthy if the provided example is invalid,
 *               false otherwise.
 */
module.exports = function isInvalidExample(example){

  if (_.isUndefined(example)) {
    return new Error('Invalid example: `undefined` is not a valid example.');
  }
  try {
    var typeSchema = infer(example);
    if (_.isUndefined(typeSchema) || _.isNull(typeSchema)) {
      return new Error('Invalid example: could not infer type schema.');
    }
  }
  catch (e) {
    return e;
  }

  return false;
};
