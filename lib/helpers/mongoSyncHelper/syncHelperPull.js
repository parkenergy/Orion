var DataHelper = require('../../controllers/dataHelper.js');

var SyncHelperPull = function (collection) {
  var dataHelper = new DataHelper(collection);

  return {
    _collection: collection,
    _dataHelper: dataHelper,

    getMostRecentlyUpdated: function (callback) {
      var self = this;
      var query = { limit: 1, sort: { updated_at: -1 } };
      dataHelper.list({query: query}, function (err, data) {
        return callback(err, data[0]);
      });
    },

    updateNow: function (callback) {
      console.log('Inner Update Now');
      var self = this;
      this.getMostRecentlyUpdated(function (err, data) {
        if (err || !data) { return callback((err || new Error("no data"))); }
        var dateUpdated = data.updated_at;
        var url = 'http://orion.parkenergyservices.com/api/' + self._collection;
        var obj = { query: { updated_at: { $gte: dateUpdated } } };
        needle.request('get', url, obj, function(err, resp) {
          if (err) { return callback(err); }
          if (!err && resp.statusCode !== 200) {
            var e = new Error("error ocurred while attempting to fetch.");
            return callback(e);
          } else {
            var arr = Object.keys(resp.body)
              .map(function(k){ return resp.body[k]; });
            async.eachSeries(arr, dataHelper.create, function (err) {
              return callback(err);
            }); // async.eachSeries

          } // else

        }); // needle

      }); // getMostRecentlyUpdated

    } // update now

  }; // return

}; // end

module.exports = SyncHelperPull;
