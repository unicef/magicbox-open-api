// Export Machine.pack() object for convenience
module.exports = require('machine').pack({
  pkg: require('./package.json'),
  dir: __dirname
});
