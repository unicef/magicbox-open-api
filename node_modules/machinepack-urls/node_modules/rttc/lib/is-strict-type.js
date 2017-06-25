/**
 * Module dependencies
 */

var _ = require('lodash');
var buildSchemaIterator = require('./helpers/build-schema-iterator');



/**
 * Return whether or not this type schema is "strict"-- meaning
 * its type is either "string", "number", "boolean", "lamda", a
 * faceted dictionary, or a patterned array.
 *
 * This check is not recursive by default (i.e. `foo: { bar: [], baz: {} }`
 * would be considered strict).  Set `checkRecursively` to true to enable
 * recursive parsing.
 *
 * @param  {*} typeSchema
 * @param  {Boolean} checkRecursively  [defaults to false]
 * @return {Boolean}
 */
module.exports = function isStrictType (typeSchema, checkRecursively) {

  // Build iterator
  var iterator = (buildSchemaIterator(
    function onFacetDict(facetDictionary, parentKeyOrIndex, callRecursive){
      if (!checkRecursively) {
        return true;
      }
      return _.reduce(facetDictionary, function (isStrict, val, key) {
        return isStrict && callRecursive(val, key);
      }, true);
    },
    function onPatternArray(patternArray, parentKeyOrIndex, iterateRecursive){
      if (!checkRecursively) {
        return true;
      }
      return iterateRecursive(patternArray[0], 0);
    },
    function onGenericDict(schema, parentKeyOrIndex){
      return false;
    },
    function onGenericArray(schema, parentKeyOrIndex){
      return false;
    },
    function onOther(schema, parentKeyOrIndex){
      return (schema !== 'json' && schema !== 'ref');
    }
  ));

  return iterator(typeSchema);

};

