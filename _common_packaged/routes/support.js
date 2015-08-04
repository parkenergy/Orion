var gitRev = require('git-rev');
var SyncHelper = require('../helpers/mongoSyncHelper');
var syncHelper = new SyncHelper();

module.exports = function(app) {

  app.get('/api/support', function (req, res, next) {
    var model = {
      gitVersion: "nothing yet",
      lastDatabaseSync: new Date(),
      numberOfPendingDataEntries: 0,
      laptopName: "nothing yet",
    };

    gitRev.long(function (str) {
      model.gitVersion = str;
      syncHelper.getMostRecentlyUpdated(function (err, data) {
        if (err) { return next(err); }
        model.lastDatabaseSync = data;
        syncHelper.getPending(function (err, data) {
          if (err) { return next(err); }
          model.numberOfPendingDataEntries = data;
          res.send(model);
        });
      });
    });
  });
};
