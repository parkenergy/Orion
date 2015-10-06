var DataHelper = require('../../controllers/dataHelper');
var States = new DataHelper("states");
var async = require('async');

var StateLoader = function (callback) {
  console.log('creating states\n\n');
  var states = ["Arkansas", "Colorado", "Louisiana", "New Mexico", "Oklahoma", "Texas"];
  async.eachSeries(states,
    function (stateName, cb1) {
      var state = { name: stateName };
      States.create({body: state, query: state}, function (err, dbState) {
        console.log('\t'+state.name+' created');
        return cb1(err);
      });
    },
    function (err) {
      return callback(err);
    }
  );
};

module.exports = StateLoader;
