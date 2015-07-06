var StatesLoader = require('./states');
var CountiesLoader = require('./counties');

var DataLoader = function () {

  console.log("\n\nloading data...\n\n");

  var statesloader = new StatesLoader(function (err) {
    if (err) throw err;
    console.log("\n\nstates loaded!\n\n");
    var countiesloader = new CountiesLoader(function (err) {
      if (err) throw err;
      console.log("\n\ncounties loaded\n\n");
    })
  })

}

module.exports = DataLoader;
