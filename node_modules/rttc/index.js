module.exports = {
  validate: require('./lib/validate'),
  validateStrict: require('./lib/validate-strict'),
  coerce: require('./lib/coerce'),
  infer: require('./lib/infer'),
  isEqual: require('./lib/is-equal'),
  stringify: require('./lib/stringify'),
  parse: require('./lib/parse'),
  parseHuman: require('./lib/parse-human'),
  stringifyHuman: require('./lib/stringify-human'),
  hydrate: require('./lib/hydrate'),
  dehydrate: require('./lib/dehydrate'),
  compile: require('./lib/compile'),
  sample: require('./lib/sample'),
  exemplar: require('./lib/exemplar'),
  getDisplayType: require('./lib/get-display-type'),
  isStrictType: require('./lib/is-strict-type'),
  isInvalidExample: require('./lib/is-invalid-example'),
  reify: require('./lib/reify'),
  intersection: require('./lib/intersection'),
  union: require('./lib/union'),
  getPathInfo: require('./lib/get-path-info'),
  getBaseVal: require('./lib/get-base-val'),
};


// Backwards compatibility
module.exports.encode = module.exports.stringify;
module.exports.decode = module.exports.parse;
module.exports.typeInfo = require('./lib/type-info');
module.exports.inspect = module.exports.compile;
