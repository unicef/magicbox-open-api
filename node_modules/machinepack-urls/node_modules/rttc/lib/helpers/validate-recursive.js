/**
 * Module dependencies
 */

var util = require('util');
var Stream = require('stream').Stream;
var _ = require('lodash');
var types = require('./types');
var rebuildSanitized = require('./sanitize');


/**
 *
 * @param  {===} expected
 * @param  {===} actual
 * @param  {Array} errors  [errors encountered along the way are pushed here]
 * @param  {Boolean} ensureSerializable   [no longer used]
 * @param  {Object} meta   [used in error messages]
 * @param  {Boolean} strict
 * @return {===} coerced value
 */
module.exports = function _validateRecursive (expected, actual, errors, ensureSerializable, meta, strict){

  // Look up expected type from `types` object using `expected`.
  var expectedType;
  var isExpectingArray;
  var isExpectingDictionary;
  var isExpectingAnything;
  var allowAnyArray;
  var allowAnyDictionary;
  var allowAnyJSONCompatible;


  // console.log('validating',actual,'against',expected,'...');


  //
  // Set special flags about what to allow/expect for the type:
  //

  // Flag [] (allow any array)
  if (_.isArray(expected) && expected.length === 0) {
    allowAnyArray = true;
  }
  // Flag {} (allow any dictionary)
  else if (_.isPlainObject(expected) && _.keys(expected).length === 0) {
    allowAnyDictionary = true;
  }
  // Flag 'ref' (allow anything that's not undefined)
  else if (expected === 'ref') {
    isExpectingAnything = true;
  }
  // Flag 'json' (allow anything that's JSON compatible)
  else if (expected === 'json') {
    allowAnyJSONCompatible = true;
  }



  //
  // Now look up the proper type validation/coercion strategy:
  //

  // Arrays
  if (_.isArray(expected)) {
    expectedType = types.array;
    isExpectingArray = true;
  }
  // Dictionaries
  else if (_.isObject(expected)) {
    expectedType = types.dictionary;
    isExpectingDictionary = true;
  }
  // everything else (i.e. 'string', 'boolean', 'number', 'ref', 'lamda', 'json')
  else {
    expectedType = types[expected];

    // If this refers to an unknown type, default
    // to a string's base type and remember the error.
    if (_.isUndefined(expectedType)) {
      errors.push((function (){
        var err = new Error('Unknown type: '+expected);
        err.code = 'E_UNKNOWN_TYPE';
        return err;
      })());
      return types.string.getBase();
    }
  }

  // Default the coercedValue to the actual value.
  var coercedValue = actual;

  // If the actual value is undefined, fill in with the
  // appropriate base type.
  if(_.isUndefined(actual)) {
    coercedValue = expectedType.getBase();
  }

  // Check `actual` value using `expectedType.is()`
  if (!expectedType.is(actual)){


    // Build an E_INVALID_TYPE error
    var newErr = (function (){
      var msg = util.format(
        'An invalid value was specified: \n' + util.inspect(actual, false, null) + '\n\n' +
        'This doesn\'t match the specified type: \n' + util.inspect(expected, false, null)
      );
      if (meta && meta.keyName) {
        msg = 'For key `'+meta.keyName+'`: ' + msg;
      }
      var err = new Error(msg);
      if (meta && meta.keyName) {
        err.inputKey = meta.keyName;
      }
      err.actual = util.inspect(actual, false, null);
      err.expected = util.inspect(expected, false, null);
      err.code = 'E_INVALID_TYPE';

      // This is considered a "minor" error if it can be coerced without
      // causing any errors.
      try {
        expectedType.to(actual);
        err.minor = true;
      }
      catch (e) {}
      return err;
    })();

    // Don't bother tracking minor errors unless we're in `strict` mode.
    if (!newErr.minor || (strict && newErr.minor)) {
      errors.push(newErr);
    }


    // Invalid expected type.  Try to coerce:
    try {
      coercedValue = expectedType.to(actual);
    }
    catch (e) {

      // If that doesn't work, use the base type:
      coercedValue = expectedType.getBase();

      // But also push an error
      errors.push((function (){
        var msg = util.format(
          'An invalid value was specified: \n' + util.inspect(actual, false, null) + '\n\n' +
          'This cannot be coerced into the specified type: \n' + util.inspect(expected, false, null)
        );
        if (meta && meta.keyName) {
          msg = 'For key `'+meta.keyName+'`: ' + msg;
        }
        var err = new Error(msg);
        if (meta && meta.keyName) {
          err.inputKey = meta.keyName;
        }
        err.actual = util.inspect(actual, false, null);
        err.expected = util.inspect(expected, false, null);
        err.code = 'E_COERCION';
        return err;
      })());
    }
  }
  // else {
  //   console.log('actual:',actual,' IS EXPECTED TYPE.');
  // }

  // Build partial result
  // (taking recursive step if necessary)

  // ...expecting ANYTHING ('===')
  if (isExpectingAnything) {
    return coercedValue;
  }

  // ...expecting ANY json-compatible value (`"%json"`)
  if (allowAnyJSONCompatible) {
    // (run rebuildSanitized with `allowNull` enabled)
    return rebuildSanitized(coercedValue, true);
  }

  if (isExpectingArray) {

    // ...expecting ANY array (`[]`)
    if (allowAnyArray) {
      return rebuildSanitized(coercedValue);
    }

    // ...expecting a specific array example
    var arrayItemTpl = expected[0];
    return _.reduce(coercedValue, function (memo, coercedVal){
      memo.push(_validateRecursive(arrayItemTpl, coercedVal, errors, ensureSerializable, undefined, strict));
      return memo;
    }, []);
  }

  if (isExpectingDictionary) {

    // ...expecting ANY dictionary (`{}`)
    if (allowAnyDictionary){
      return rebuildSanitized(coercedValue);
    }
    // ...expecting a specific dictionary example
    return _.reduce(expected, function (memo, expectedVal, expectedKey) {
      var keyName = (meta && meta.keyName ? (meta.keyName + '.') : '') + expectedKey;
      memo[expectedKey] = _validateRecursive(expected[expectedKey], coercedValue[expectedKey], errors, ensureSerializable, {keyName: keyName}, strict);
      return memo;
    }, {});
  }

  // ...expecting a primitive
  return coercedValue;
};



