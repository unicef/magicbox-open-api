/**
 * Module dependencies
 */

var _ = require('lodash');


/**
 * A variation on the lodash equality check that uses the expected typeSchema
 * for additional context (it stringifies lamdas and compares them that way)
 *
 * If no typeSchema is provided, this is currently just the same thing as `_.isEqual`
 *
 * @param  {===} firstValue
 * @param  {===} secondValue
 * @param  {*} typeSchema
 * @return {Boolean}
 */
module.exports = function isEqual (firstValue, secondValue, typeSchema) {

  // If typeSchema is not provided, use `_.isEqual`
  // TODO: make this better
  if (_.isUndefined(typeSchema)) {
    return _.isEqual(firstValue, secondValue);
  }

  // console.log('\n\n\n');
  // console.log('running equality check:');
  // console.log(firstValue);
  // console.log('vs:');
  // console.log(secondValue);
  // console.log();

  // Otherwise recursively crawl the type schema and ensure that `firstValue`
  // and `secondValue` are equivalent to one another in all the places.
  return _isEqualRecursive(firstValue, secondValue, typeSchema, []);

};




/**
 * [_isEqualRecursive description]
 * @param  {[type]}  firstValue  [description]
 * @param  {[type]}  secondValue [description]
 * @param  {[type]}  typeSchema  [description]
 * @param  {[type]}  keypathArray  [description]
 * @param  {[type]}  keyOrIndex  [description]
 * @return {Boolean}             [description]
 */
function _isEqualRecursive(firstValue, secondValue, typeSchema, keypathArray, keyOrIndex){


  try {

    // console.log(' ('+keypathArray.join('.')+') \n•',firstValue,'vs', secondValue);

    // Attempt to look up the appropriate keypath within the type schema, or
    // use the top-level type schema if we haven't tracked any key/indices traversed
    // yet.
    var typeToCompareAgainst;
    if (keypathArray.length === 0) {
      typeToCompareAgainst = typeSchema;
    }
    else {
      var lastTypeToCompareAgainst = _.get(typeSchema, keypathArray.slice(0,-1).join('.'));
      // If previous comparison type was a homogenous array type (i.e. any array at this point)
      // ensure that we use the first item of the type schema as our type-- because otherwise
      // it won't exist!
      if (_.isArray(lastTypeToCompareAgainst)) {
        typeToCompareAgainst = _.get(typeSchema, keypathArray.slice(0,-1).concat([0]).join('.'));
      }
      // Otherwise, just grab the type to compare against normally:
      else {
        typeToCompareAgainst = _.get(typeSchema, keypathArray.join('.'));
      }
    }

    // Also look up the two value segments we'll be comparing below
    var firstValueSegment = keypathArray.length === 0 ? firstValue : _.get(firstValue, keypathArray.join('.'));
    var secondValueSegment = keypathArray.length === 0 ? secondValue : _.get(secondValue, keypathArray.join('.'));

    // Keep track of indices/keys already traversed in order to dereference the appropriate part
    // of the type schema (`indexOrKey` will be undefined if this is the top-level)
    keypathArray.push(keyOrIndex);

    if (_.isArray(typeToCompareAgainst)) {
      if (_.isEqual(typeToCompareAgainst, [])){
        return _.isEqual(firstValueSegment, secondValueSegment);
      }
      // Only take the recursive step for homogeneous arrays
      return _.all(firstValueSegment, function checkEachItemIn1stArray(unused, i){
        return _isEqualRecursive(firstValue, secondValue, typeSchema, keypathArray, i);
      }) &&
      _.all(secondValueSegment, function checkEachItemIn2ndArray(unused, i){
        return _isEqualRecursive(firstValue, secondValue, typeSchema, keypathArray, i);
      });
    }
    else if (_.isObject(typeToCompareAgainst)) {
      if (_.isEqual(typeToCompareAgainst, {})){
        return _.isEqual(firstValueSegment, secondValueSegment);
      }
      // Only take the recursive step for faceted arrays
      return _.all(firstValueSegment, function checkEachItemIn1stDict(unused, key){
        return _isEqualRecursive(firstValue, secondValue, typeSchema, keypathArray, key);
      }) &&
      _.all(secondValueSegment, function checkEachItemIn2ndDict(unused, key){
        return _isEqualRecursive(firstValue, secondValue, typeSchema, keypathArray, key);
      });
    }
    // If this type is a lamda, `.toString()` the functions and compare
    // them that way.
    else if (typeToCompareAgainst === 'lamda') {
      // console.log('Comparing lamdas...');
      return (firstValueSegment.toString() === secondValueSegment.toString());
    }
    else {
      // console.log('not lamda, its:', typeToCompareAgainst);
      return _.isEqual(firstValueSegment, secondValueSegment);
    }
  }
  catch (e){
    // console.log('------ ERR ------',e.stack);
    return false;
  }

}
