/**
 * Module dependencies
 */

var util = require('util');
var dehydrate = require('./dehydrate');


/**
 * Given a value, return a human-readable string representing the **value itself**.
 * This string is equivalent to a JavaScript code snippet which would accurately represent
 * the value in code.
 *
 * This is a lot like `util.inspect(val, false, null)`, but it also has special
 * handling for Errors, Dates, RegExps, and Functions (using `dehydrate()` with
 * `allowNull` enabled.) The biggest difference is that everything you get from
 * `rttc.compile()` is ready for use as values in `*`, `{}`, or `[]` type machines,
 * Treeline, Angular's rendering engine, and JavaScript code in general (i.e. if you
 * were to append it on the right-hand side of `var x = `, or if you ran `eval()` on it)
 *
 * Note that undefined values in arrays and undefined values of keys in dictionaries
 * will be stripped out, and circular references will be handled as they are in
 * `util.inspect(val, false, null)`
 *
 * Useful for:
 *   + generating code samples
 *   + in particular for bootstrapping data on server-rendered views for access by client-side JavaScript
 *   + error messages,
 *   + debugging
 *   + user interfaces
 *
 *                             ~~ Notable differences from `util.inspect()` ~~
 *                            =================================================
 *
 *  |  actual                 |  util.inspect()                           |  rttc.compile()                      |
 *  | ----------------------- | ----------------------------------------- | -------------------------------------|
 *  | a function              | `[Function: foo]`                         | `'function foo (){}'`                |
 *  | a Date                  | `Tue May 26 2015 20:05:37 GMT-0500 (CDT)` | `'2015-05-27T01:06:37.072Z'`         |
 *  | a RegExp                | `/foo/gi`                                 | `'/foo/gi/'`                         |
 *  | an Error                | `[Error]`                                 | `'Error\n    at repl:1:24\n...'`     |
 *  | a deeply nested thing   | `{ a: { b: { c: [Object] } } }`           | `{ a: { b: { c: { d: {} } } } }`     |
 *  | a circular thing        | `{ y: { z: [Circular] } }`                | `{ y: { z: '[Circular ~]' } }`       |
 *  | undefined               | `undefined`                               | `null`                               |
 *  | Infinity                | `Infinity`                                | `0`                                  |
 *  | -Infinity               | `-Infinity`                               | `0`                                  |
 *  | NaN                     | `NaN`                                     | `0`                                  |
 *  | Readable (Node stream)  | `{ _readableState: { highWaterMar..}}`    | `null`                               |
 *  | Buffer (Node bytestring)| `<Buffer 61 62 63>`                       | `null`                               |
 *
 *
 * ----------------------------------------------------------------------------------------
 *
 * @param  {===} val
 * @return {String}
 */
module.exports = function compile(val){
  return util.inspect(dehydrate(val, true), false, null);
};
