/**
 * Module dependencies
 */

var _ = require('lodash');
var Readable = require('stream').Readable;



/**
 * Rebuild a value to make it JSON-compatible (plus some extra affordances)
 * This is used when validating/coercing an array or dictionary (and its contents)
 * against `example: {}` or `example: []`.
 */
module.exports = function rebuildSanitized(val, allowNull, dontStringifyFunctions) {

  // Does not `allowNull` by default.

  // Never allows `undefined` at the top level (or inside- but that check is below in stringifySafe)
  if (_.isUndefined(val)) {
    if (allowNull) return null;
    else return undefined;
  }

  return _rebuild(val, allowNull, dontStringifyFunctions);
};

// (note that the recursive validation will not penetrate deeper into this
//  object, so we don't have to worry about this function running more than once
//  and doing unnecessary extra deep copies at each successive level)


// If dictionary:
// ==============================================================================
// Sanitize a dictionary provided for a wildcard dictionary example (`example: {}`)
// The main recursive validation function will not descend into this dictionary because
// it's already met the minimum requirement of being an object.  So we need to deep clone
// the provided value for safety; and in the process ensure that it meets the basic minimum
// quality requirements (i.e. no dictionaries within have any keys w/ invalid values)

// If array:
// ==============================================================================
// Sanitize an array provided for a wildcard array example (`example: []`)
// The main recursive validation function will not descend into this array because
// it's already met the minimum requirement of being `_.isArray()`.  So we need to
// deep clone the provided value for safety; and in the process ensure that it meets
// the basic minimum quality requirements (i.e. no dictionaries within have any keys w/
// invalid values)
//
// We also don't include invalid items in the rebuilt array.
//
// (NOTE: `example: ['===']` won't make it here because it will be picked up
// by the recursive validation.  And so it's different-- it will contain
// the original items, and therefore may contain dictionaries w/ keys w/ invalid values)

function _rebuild(val, allowNull, dontStringifyFunctions) {
  var stack = [];
  var keys = [];

  // This was modified from @isaacs' json-stringify-safe
  // (see https://github.com/isaacs/json-stringify-safe/commit/02cfafd45f06d076ac4bf0dd28be6738a07a72f9#diff-c3fcfbed30e93682746088e2ce1a4a24)
  var cycleReplacer = function(unused, value) {
    if (stack[0] === value) return '[Circular ~]';
    return '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']';
  };

  function _recursivelyRebuildAndSanitize (val, key) {

    // Handle circle jerks
    if (stack.length > 0) {
      var self = this;
      var thisPos = stack.indexOf(self);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(self);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      if (~stack.indexOf(val)) {
        val = cycleReplacer.call(self, key, val);
      }
    }
    else stack.push(val);



    // Rebuild and strip undefineds/nulls
    if (_.isArray(val)) {
      return _.reduce(val,function (memo, item, i) {
        if (!_.isUndefined(item) && (allowNull || !_.isNull(item))) {
          memo.push(_recursivelyRebuildAndSanitize.call(val, item, i));
        }
        return memo;
      }, []);
    }

    // Serialize errors, regexps, dates, and functions to strings:
    else if (_.isError(val)){
      val = val.stack;
    }
    else if (_.isRegExp(val)){
      val = val.toString();
    }
    else if (_.isDate(val)){
      val = val.toJSON();
    }
    else if (_.isFunction(val)){
      if (!dontStringifyFunctions) {
        val = val.toString();
      }
    }
    else if (!_.isObject(val)) {
      // Coerce NaN, Infinity, and -Infinity to 0:
      if (_.isNaN(val)) {
        val = 0;
      }
      else if (val === Infinity) {
        val = 0;
      }
      else if (val === -Infinity) {
        val = 0;
      }
      // Coerce -0 to +0
      else if (val === 0) {
        val = 0;
      }
    }
    else if (_.isObject(val)) {
      if (val instanceof Readable) {
        return null;
      }
      if (val instanceof Buffer) {
        return null;
      }
      return _.reduce(val,function (memo, subVal, key) {
        if (!_.isUndefined(subVal) && (allowNull || !_.isNull(subVal))) {
          memo[key] = _recursivelyRebuildAndSanitize.call(val, subVal, key);
        }
        return memo;
      }, {});
    }


    return val;
  }

  // Pass in the empty string for the top-level "key"
  // to satisfy Mr. isaac's replacer
  return _recursivelyRebuildAndSanitize(val, '');
}
