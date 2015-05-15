
var self = {};

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js')
}).forEach(function (file) {
  var name = file.split('.')[0];
  self[name] = require('./' + name);
});


module.exports = self;
