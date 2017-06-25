/**
 * Module dependencies
 */

var util = require('util');
var X_VALID_ECMA51_VARNAME = require('./X_VALID_ECMA51_VARNAME');
var X_INVALID_CHARACTERS_IN_ECMA51_VARNAME = require('./X_INVALID_CHARACTERS_IN_ECMA51_VARNAME');
var X_INVALID_FIRST_CHARACTER = require('./X_INVALID_FIRST_CHARACTER');


/**
 * Given a string of dash-delimited words, return a conventional
 * (and ECMAScript-compatible) camel-cased variable-name-looking thing.
 *
 * @param {String} str
 * @return {String}
 * @throws {Error} If `str` cannot be coerced into a valid ECMAScript 5.1 variable name.
 */

module.exports = function makeECMAScriptCompatible(str) {

  // Save original string for error messages and such.
  var original = str;

  // Camel-case dash-delimited things
  str = str.replace(/-+([a-z])/g, function($all, $1) {
    return $1.toUpperCase();
  });

  // Remove any other naughty characters
  str = str.replace(X_INVALID_CHARACTERS_IN_ECMA51_VARNAME, '');

  // Ensure `str` doesn't start with a character which is not a letter or $.
  // (NOTE: ECMA5.1 is actually more permissive than this, i.e. you can use weird
  // unicode characters, but we're preventing that here.  Because... cm'on, really?)
  str = str.replace(X_INVALID_FIRST_CHARACTER, '');

  // One last check to make sure we ended up with a valid variable name:
  // (i.e. don't clash with special JavaScript keywords, like "delete")
  if (!str.match(X_VALID_ECMA51_VARNAME)) {
    throw (function (){
      var e = new Error(util.format('The string "%s" cannot be converted into an ECMAScript 5.1-compatible variable name.  "%s" collides with a JavaScript reserved word, or is otherwise invalid.', original,original));
      e.code = 'RESERVED';
      return e;
    })();
  }

  return str;
};
