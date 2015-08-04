var DataHelper = require('../../controllers/dataHelper.js');

var SyncHelperPush = function (collection) {
  var dataHelper = new DataHelper(collection);

  return {
    _collection: collection,
    _dataHelper: dataHelper,

    getPending: function (callback) {
      var self = this;
      var query = { datePostedToMaster: null };
      dataHelper.list({query: query}, function (err, data) {
        return callback(err, data);
      });
    },

    updateNow: function (callback) {
      var self = this;
      this.getPending(function (err, arr) {
        if (err || !data) { return callback((err || new Error("no data"))); }
        var url = 'http://orion.parkenergyservices.com/api/' + self._collection;
        async.eachSeries(arr, function (obj, cb) {
          var data = arr[0];
          needle.request('post', url, data, function(err, resp) {
            if (err) { return cb(err); }
            if (!err && resp.statusCode !== 200 ) {
              var e = new Error("error ocurred while attempting to push.");
              console.error(e);
              return cb(null);
            } else {
              data.datePostedToMaster = new Date();
              dataHelper.update({body: obj}, cb);
            }
          });
        }, function (err) {
          return callback(err);
        }); // async.eachSeries

      }); // getPending

    } // update now

  }; // return

}; // end

module.exports = SyncHelperPush;
