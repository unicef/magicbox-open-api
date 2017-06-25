# rttc
Runtime (recursive) type-checking for JavaScript.

## Installation

```sh
$ npm install rttc --save
```


## Quick Start


Want to coerce a value to match a particular type?

```javascript
var rttc = require('rttc');

rttc.coerce({ firstName: 'string'}, {firstName: 13375055});
// => { firstName: "13375055" }

rttc.coerce({ firstName: 'string'}, {something: 'totally incorrect'});
// => { firstName: "" }
// (when confronted with something totally weird, `.coerce()` returns the "base value" for the type)
```

Want to throw an Error if a value doesn't match a particular type?

```javascript
rttc.validateStrict({ firstName: 'string'}, {firstName: 13375055});
// throws error
// (`.validateStrict()` demands a value that is precisely the correct type)

rttc.validateStrict({ firstName: 'string'}, {firstName: '13375055'});
// does not throw
```

Or if you want to be a little more forgiving:

```javascript
rttc.validate({ firstName: 'string'}, {something: 'totally incorrect'});
// throws error

rttc.validate({ firstName: 'string'}, {firstName: 45});
// => "45"
// (when confronted with minor differences, `.validate()` coerces as needed to make stuff fit)
```


Not sure how to build a type schema for use with `.coerce()` or `.validate()`? Use `.infer()` to build one from an example value you've got laying around:

```javascript
rttc.infer({ firstName: 'Rosella', lastName: 'Graham', friends: ['Valencia', 'Edgar', 'Attis'] });
// => { firstName: 'string',  lastName: 'string', friends: ['string'] }
```

> note that when inferring an array type, the first item of the example is used as a pattern- assuming homogeneity (i.e. that all items will look the same)


You can do this with anything-- here's a more advanced version to show what I mean:
```javascript
rttc.infer([{ upstream: '===', fieldName: 'photos', files: [{getFile: '->', fileName: 'whatever', numBytes: 34353, meta: '*' }] }]);
// =>
// [
//  {
//    upstream: 'ref',
//    fieldName: 'string',
//    files: [
//      {
//        getFile: 'lamda',
//        fileName: 'string',
//        numBytes: 'number',
//        meta: 'json'
//      }
//    ]
// }
// ]
```



Finally, note that all of the validation and coercion strategies used in this modules are recursive through the keys of plain old JavaScript objects and the indices of arrays.


## Usage

### Validation

##### .validateStrict(expectedTypeSchema, actualValue)

Throws if the provided value is not the right type (recursive).


##### .validate(expectedTypeSchema, actualValue)

Either returns a (potentially "lightly" coerced) version of the value that was accepted, or it throws.  The "lightly" coerced value turns `"3"` into `3`, `"true"` into `true`, `-4.5` into `"-4.5"`, etc.



### Munging


##### .coerce(expectedTypeSchema, actualValue)

ALWAYS returns an acceptable version of the value, even if it has to mangle it to get there (i.e. by using the "base value" for the expected type.  More on that below.)


##### .hydrate(value, [_typeSchema_=`undefined`])

This function will use the provided `typeSchema` to figure out where "lamda" values (functions) are expected, then will use `eval()` to bring them back to life.  Use with care.


##### .dehydrate(value, [_allowNull_=`false`])

This takes care of a few serialization edge-cases, such as:

+ stringifies functions, regexps, and errors (grabs the `.stack` property)
+ replacing circular references with a string (e.g. `[Circular]`)
+ replaces `-Infinity`, `Infinity`, and `NaN` with 0
+ strips keys and array items with `undefined` or `null` values. If `allowNull` is set to true, `null` values will not be stripped from the encoded string.



##### .parse(stringifiedValue, [_typeSchema_=`undefined`], [_unsafeMode_=`false`])

Parse a stringified value back into a usable value.

This is basically just a variation on JSON.parse that calls `rttc.hydrate()` first if `unsafeMode` is enabled.


##### .stringify(value, [_allowNull_=`false`])

Encode a value into a string.

This is basically just a variation on JSON.stringify that calls `rttc.dehydrate()` first.


##### .parseHuman(stringFromHuman, [_typeSchema_=`undefined`], [_unsafeMode_=`false`])

Parse a string from a human into something usable.  If provided, `typeSchema` will be used to make a better guess.  If `unsafeMode` is enabled, lamda functions will be hydrated.


##### .stringifyHuman(value, typeSchema)

The inverse of `.parseHuman()`, this function encodes a string that, if run through `.parseHuman()` would result in the given value.


### Assertions

##### .isEqual(firstValue, secondValue, [_expectedTypeSchema_=`undefined`])

Determine whether two values are equivalent using `_.isEqual()`, but also look for expected `lamda` values in the optional type schema and call `toString()` on functions before comparing them.

> This is the method used by `rttc`'s own tests to validate that expected values and actual values match.


##### .infer(exampleValue)

Guess the type schema from an example value.

##### .isStrictType(typeSchema, [recursive=false])

Determine whether the given type schema is "strict" (meaning it is a string, number, boolean, lamda, faceted dictionary, or patterned array).  If second argument (`recursive`) is set to `true`, then also recursively check the subkeys of faceted dictionaries and patterns of arrays in the type schema.

| type                    | is strict?          |
|-------------------------|---------------------|
| string                  | yes _(always)_ |
| number                  | yes _(always)_ |
| boolean                 | yes _(always)_ |
| lamda                   | yes _(always)_ |
| `{}` (generic)          | no                 |
| `[]` (generic)          | no                 |
| `{...}` (faceted)       | yes _(maybe recursively)_  |
| `[...]` (patterned)     | yes _(maybe recursively)_  |
| json                    | no                 |
| ref                     | no                 |


### Utilities


##### .sample(typeSchema, [n=2])

Given a type schema, return an array of up to `n` unique sample values that would validate against it (in random order).  `n` defaults to 2 if left undefined.


##### .getDisplayType(value)

Given a value, return its type as a human-readable string (this is not limited to rttc types-- it can return strings like `"Error"` and `"Date"`)


##### .compile(value)

Given a value, return a human-readable string which represents it.  This string is equivalent to a JavaScript code snippet which would accurately represent the value in code.

This is a lot like `util.inspect(val, false, null)`, but it also has special handling for Errors, Dates, RegExps, and Functions (using `dehydrate()` with `allowNull` enabled.) The biggest difference is that everything you get from `rttc.compile()` is ready for use as values in `*`, `{}`, or `[]` type machines, Treeline, Angular's rendering engine, and JavaScript code in general (i.e. if you were to append it on the right-hand side of `var x = `, or if you ran `eval()` on it)

Note that undefined values in arrays and undefined values of keys in dictionaries will be stripped out, and circular references will be handled as they are in `util.inspect(val, false, null)`

Useful for:
  + generating code samples
  + in particular for bootstrapping data on server-rendered views for access by client-side JavaScript
  + error messages,
  + debugging
  + user interfaces


Here's a table listing notable differences between `util.inspect()` and `rttc.compile()` for reference:


| value                    | util.inspect()                            | rttc.compile()                       |
|--------------------------|-------------------------------------------|--------------------------------------|
| a function               | `[Function: foo]`                         | `'function foo (){}'`                |
| a Date                   | `Tue May 26 2015 20:05:37 GMT-0500 (CDT)` | `'2015-05-27T01:06:37.072Z'`         |
| a RegExp                 | `/foo/gi`                                 | `'/foo/gi/'`                         |
| an Error                 | `[Error]`                                 | `'Error\n    at repl:1:24\n...'`     |
| a deeply nested thing    | `{ a: { b: { c: [Object] } } }`           | `{ a: { b: { c: { d: {} } } } }`     |
| a circular thing         | `{ y: { z: [Circular] } }`                | `{ y: { z: '[Circular ~]' } }`       |
| undefined                | `undefined`                               | `null`                               |
| Infinity                 | `Infinity`                                | `0`                                  |
| -Infinity                | `-Infinity`                               | `0`                                  |
| NaN                      | `NaN`                                     | `0`                                  |
| Readable (Node stream)   | `{ _readableState: { highWaterMar..}}`    | `null`                               |
| Buffer (Node bytestring) | `<Buffer 61 62 63>`                       | `null`                               |


## Types

Here are the various types recognized by `rttc`.  They are recursive within faceted dictionaries and patterned arrays. If those words don't make sense, keep reading, you'll see what I mean.

#### Strings

`example: 'stuff'`


#### Numbers

`example: 323`


#### Booleans

`example: false`


#### Generic dictionaries

`example: {}`

The **generic dictionary** type is a dictionary type schema with no keys.


Dictionaries that have been validated/coerced against the generic dictionary type:
+ will have no prototypal properties, getters, or setters, as well as a complete deficit of any other sort of deceit, lies, or magic
+ are guaranteed to be JSON-serializable, with a few additional affordances:
  + normally, stringified JSON may contain `null` values.  Instead, rttc removes `null` items from arrays and removes keys with `null` values from objects.
  + normally, `Error` instances get stringified into empty objects.  Instead, rttc turns them into human-readable strings by reducing them to their `.stack` property (this includes the error message and the stack trace w/ line numbers)
  + normally, `RegExp` instances get stringified into empty objects.  Instead, rttc turns them into human-readable strings like `'/some regexp/gi'`
  + normally, `function()` instances get stringified into empty objects.  Instead, rttc turns them into human-readable strings like `'function doStuff (a,b) { console.log(\'wow I can actually read this!\'); }'`


#### Faceted dictionaries

`example: {...}`

The **faceted dictionary** type is any dictionary type schema with at least one key.  Extra keys in the actual value that are not in the type schema will be stripped out. Missing keys will cause `.validate()` to throw.

Dictionary type schemas (i.e. plain old JavaScript objects nested like `{a:{}}`) can be infinitely nested.  Type validation and coercion will proceed through the nested objects recursively.

```javascript
{
  id: 'number',
  name: 'string',
  isAdmin: 'boolean',
  mom: {
    id: 'number',
    name: 'string',
    occupation: {
      title: 'string',
      workplace: 'string'
    }
  }
}
```



#### Generic arrays

`example: []`

Arrays that have been validated/coerced against the generic array type:
+ _may_ be heterogeneous (have items with different types) - but it is generally best practice to avoid heterogeneous arrays in general.
+ are guaranteed to be JSON-serializable, with a few additional affordances:
  + normally, stringified JSON may contain `null` values.  Instead, rttc removes `null` items from arrays and removes keys with `null` values from objects.
  + normally, `Error` instances get stringified into empty objects.  Instead, rttc turns them into human-readable strings by reducing them to their `.stack` property (this includes the error message and the stack trace w/ line numbers)
  + normally, `RegExp` instances get stringified into empty objects.  Instead, rttc turns them into human-readable strings like `'/some regexp/gi'`
  + normally, `function()` instances get stringified into empty objects.  Instead, rttc turns them into human-readable strings like `'function doStuff (a,b) { console.log(\'wow I can actually read this!\'); }'`




#### Patterned arrays

`example: ['Margaret']`
`example: [123]`
`example: [true]`
`example: [[...]]`
`example: [{...}]`

Array type schemas may be infinitely nested and combined with dictionaries or any other types.

Runtime arrays being validated/coerced against array type schemas will be homogeneous (meaning every item in the array will have the same type).

> Also note that, because of this, when providing a type schema or type-inference-able example for an array, you only need to provide one item in the array, e.g.:

```javascript
[
  {
    id: 'number',
    name: 'string',
    email: 'string',
    age: 'number',
    isAdmin: 'boolean',
    favoriteColors: ['string'],
    friends: [
      {
        id: 'number',
        name: 'string'
      }
    ]
  }
]
```

#### Generic JSON

`example: '*'`

This works pretty much like the generic array or generic dictionary type, with two major differences: (1) the top-level value can be a string, boolean, number, dictionary, array, or null value. (2) `null` is permitted, both as a top-level value and recursively in nested arrays and dictionaries (and as you might expect, `null` values are NOT stripped from nested arrays and dictionaries when performing type coercion)

Other than the aforementioned exception for `null`, the generic JSON type follows the JSON-serializability rules from generic arrays and generic dictionaries.



#### Mutable reference ("ref")

`example: '==='`

This special type allows anything except `undefined`.  It also _does not rebuild objects_, which means it maintains the original reference (i.e. is `===`).  It does not guarantee JSON-serializability.




## Base values

As mentioned above, every type has a base value.

+ For the "string" type, base value is `""`
+ For the "number" type, base value is `0`
+ For the "boolean" type, base value is `false`
+ For the "lamda" type (`'->'`), base value is a function that uses the standard machine fn signature and triggers its "error" callback w/ a message about being the rttc default (e.g. `function(inputs,exits,env) { return exits.error(new Error('not implemented')); }`)
+ For the generic dictionary type (`{}`) or a faceted dictionary type (e.g. `{foo:'bar'}`), the base value is `{}`.
+ For the generic array type (`[]`), or a faceted/homogenous array type (e.g. `[3]` or `[{age:48,name: 'Nico'}]`), the base value is `[]`
+ For the "json" type (`'*'`), base value is `null`.
+ For the "ref" type (`'==='`), base value is `undefined`.

> Note that, for both arrays and dictionaries, any keys in the schema will get the base value for their type (and their keys for their type, etc. -- recursive)


## Edge-cases

The following is a high-level overview of important conventions used by the `rttc` module. For detailed coverage of every permutation of validation and coercion, check out the declarative tests in the `spec/` folder of this repository.

##### `undefined` and `null` values

+ `undefined` _is never valid as a top-level value_ against ANY type, even mutable reference (`===`)
+ `undefined` IS, however, allowed as an item in a nested array or value in a nested dictionary, but only against the mutable reference type (`===`)
+ `null` is only valid against the JSON (`*`) and mutable reference (`===`) types.

##### Weird psuedo-numeric values

+ `NaN` is only valid against the mutable reference type (`'==='`)
+ `Infinity` and `-Infinity` is only valid against the mutable reference type (`'==='`)
+ `Infinity` and `-Infinity` are only valid against `example: '==='`
+ `+0` and `-0` are always coerced to `0` (except against the mutable reference type)

##### Instances of ECMAScript core classes

When coerced against the generic dictionary, generic array, or the generic json types, the following is true:
+ `Error` instances are coerced to the string value of their `.stack` property (i.e. the message + stack trace you're used to seeing in the terminal)
+ `Date` instances are coerced to the string value of running their `.toJSON()` method (a ISO-8601 timestamp, e.g. `'2015-05-24T15:16:48.999Z'`.  This reflects the Date in GMT/UTC time, so is therefore timezone-agnostic).
+ `RegExp` instances are coerced to the string value you get from running their `.toString()` method (e.g. `'/foo/'` or `'/^bar/gi'`)
+ Functions are coerced to the string value you get from running their `.toString()` method (e.g. `'function someFunction (some,args,like,this,maybe){ /* and some kind of implementation in here prbly */ }'`)

##### Instances of Node.js core classes

+ `Stream` and `Buffer` instances (from Node.js) are only valid against the mutable reference type.
+ Streams and Buffers are coerced to `null` against the generic dictionary, generic array, or the generic json types.


## More examples

#### rttc.infer(value)

Infer the type/schema of the provided value.

```javascript
require('rttc').infer(false);
// => 'boolean'
```

```javascript
require('rttc').infer(0);
// => 'number'
```

```javascript
require('rttc').infer({
  foo: 'bar'
});
// => { foo: 'string' }
```

```javascript
require('rttc').infer({
  foo: 'whatever',
  bar: { baz: true }
});
// => { foo: 'string', bar: { baz: 'boolean' } }
```

```javascript
require('rttc').infer([{
  foo: ['bar']
}]);
// => [{ foo: ['string'] }]
```

```javascript
require('rttc').infer({
  user: {
    friends: [{
      name: 'Lenny',
      age: 77
    }]
});
// =>
/*
{
  user: {
    friends: [{
      name: 'Lenny',
      age: 77
    }]
}
*/
```



#### rttc.validate(expected, actual)

```javascript
rttc.validate('string', 'foo');
// => 'foo'

rttc.validate('number', 4.5);
// => 4.5

rttc.validate('boolean', true);
// => true

rttc.validate('string', -2);
// => '-2'

rttc.validate('string', false);
// => 'false'

rttc.validate('number', '3');
// => 3

rttc.validate('boolean', 'true');
// => true

rttc.validate({
  user: {
    friends: [{
      name: 'Lenny',
      age: 77
    }]
}, {
  user: {
    friends: [{
      name: 'Lenny',
      age: '77'
    }]
  }
});
// =>
/*
{
  user: {
    friends: [{
      name: 'Lenny',
      age: 77
    }]
  }
}
 */
```

If value cannot be properly coerced, throws error with its `.code` property set to `E_INVALID_TYPE`:

```javascript
rttc.validate('number', 'asdf');
// throws E_INVALID_TYPE
```



#### rttc.coerce(expected, actual)

```javascript
rttc.coerce('string', 'foo');
// => 'foo'

rttc.coerce('number', 4.5);
// => 4.5

rttc.coerce('boolean', true);
// => true

rttc.coerce('string', -2);
// => '-2'

rttc.coerce('string', false);
// => 'false'

rttc.coerce('number', '3');
// => 3

rttc.coerce('boolean', 'true');
// => true
```


If value can't be properly coerced, the "base value" for the type will be used:

```
rttc.coerce('number', 'asdf');
// => 0

rttc.coerce('boolean', 'asdf');
// => false

rttc.coerce({
  user: {
    friends: [{
      name: 'Lenny',
      age: 77
    }]
}, 'err... some dude who\'s friends with lenny?');
// =>
/*
{
  user: {
    friends: [{
      name: 'Lenny',
      age: 77
    }]
  }
}
 */
```



## License

MIT

&copy; 2014 Mike McNeil, Cody Stoltman;  &copy; 2015 The Treeline Company
