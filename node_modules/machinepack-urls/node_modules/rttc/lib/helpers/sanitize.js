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
module.exports = function rebuildSanitized(val, allowNull) {

  // Does not `allowNull` by default.

  // Never allows `undefined` at the top level (or inside- but that check is below in stringifySafe)
  if (_.isUndefined(val)) {
    if (allowNull) return null;
    else return undefined;
  }

  // First, prevent against endless circular recursion:
  // (this should never throw, but if it does, it needs to be handled
  //  by the caller of `rebuildSanitized`)
  val = JSON.parse(stringifySafe(val));
  // So doing that parse/stringify thing will remove keys that have undefined values on its own.
  // BUT, we still have to worry about removing array items which are undefined.
  // And the above operation actually converts these undefined items into `null` items.
  // But since we aren't really OK with `null` items either, we can just go ahead and strip
  // them out.  So we do that in `_recursivelyRebuildAndSanitize`.


  // Then build a deep copy
  // (in the process, remove keys with undefined values from nested dictionaries recursively)
  return _recursivelyRebuildAndSanitize(val, allowNull);

  // TODO:
  // could consolidate this cloning + stripping undefined keys + prevention against
  // ∞-recursion into a single tree traversal, which would triple the efficiency,
  // because then instead of doing "stringify", then "parse", then "rebuild", it could
  // all be accomplished in just one iteration instead of three.
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

function _recursivelyRebuildAndSanitize (val, allowNull) {
  if (_.isArray(val)) {
    return _.reduce(val,function (memo, item, i) {
      if (!_.isUndefined(item) && (allowNull || !_.isNull(item))) {
        memo.push(_recursivelyRebuildAndSanitize(item, allowNull));
      }
      return memo;
    }, []);
  }

  else if (_.isObject(val)) {
    return _.reduce(val,function (memo, subVal, key) {
      if (!_.isUndefined(subVal) && (allowNull || !_.isNull(subVal))) {
        memo[key] = _recursivelyRebuildAndSanitize(subVal, allowNull);
      }
      return memo;
    }, {});
  }
  else {
    return val;
  }
}



/**
 * This was modified by @mikermcneil from @isaacs' json-stringify-safe
 * (see https://github.com/isaacs/json-stringify-safe/commit/02cfafd45f06d076ac4bf0dd28be6738a07a72f9#diff-c3fcfbed30e93682746088e2ce1a4a24)
 * @param  {===} val           [description]
 * @return {String}               [description]
 */
function stringifySafe(val) {
  return JSON.stringify(val, serializer());
}

function serializer(replacer, cycleReplacer) {
  var stack = [];
  var keys = [];

  if (!cycleReplacer) {
    cycleReplacer = function(key, value) {
      if (stack[0] === value) return '[Circular ~]';
      return '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']';
    };
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
    }
    else stack.push(value);

    // Serialize errors, regexps, dates, and functions to strings:
    if (_.isError(value)){
      value = value.stack;
    }
    else if (_.isRegExp(value)){
      value = value.toString();
    }
    else if (_.isFunction(value)){
      value = value.toString();
    }
    else if (_.isObject(value)){
      if (value instanceof Readable) {
        return null;
      }
      if (value instanceof Buffer) {
        return null;
      }
    }

    // Coerce NaN, Infinity, and -Infinity to 0:
    if (_.isNaN(value)) {
      value = 0;
    }
    else if (value === Infinity) {
      value = 0;
    }
    else if (value === -Infinity) {
      value = 0;
    }

    if (!replacer) {
      return value;
    }
    return replacer.call(this, key, value);
  };
}
