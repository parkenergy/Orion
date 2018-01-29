'use strict';

const log = require('../../../helpers/logger'),
  SaturdayToWednesdayTotalsEmail = require('../../manHourMonitoring/Saturday_WednesdayTotalEmail');

const define = (agenda) => {
  agenda.define('WednesdayManHoursTotalEmail', {concurrency: 1}, (job, done) => {
    // method to get man hours for the week from monday - this current time Thursday
    SaturdayToWednesdayTotalsEmail()
      .then(() => {
        log.trace('Finished WednesdayManHoursTotalEmail Task');
        job.remove((err) => {
          if (err) {
            log.debug({error: err}, 'Error Saturday - Wednesday this week, on remove');
          }
          define(agenda);
          agenda.schedule('wednesday at 17:00', 'WednesdayManHoursTotalEmail');
          done();
        });
      })
      .catch((err) => {
        log.error({error: err}, `Error while trying to email Wednesdays total times: ${err}`);
        log.debug({error: err}, 'Error while trying to email Saturday - Wednesday, on execution');
        // remove job form db and reschedule
        job.remove((err) => {
          if (err) {
            log.debug({error: err}, 'Error Saturday - Wednesday this week, on execution, remove')
          }
          define(agenda);
          agenda.schedule('wednesday at 17:00', 'WednesdayManHoursTotalEmail');
          done();
        });
      });
  });
};

const start = (agenda) => {
  // Every Wednesday at Noon -------------------------------------------------
  define(agenda);
  agenda.on('ready', () => {
    // 17:00 = 12:00pm. need to have + 5hours to 12
    // agenda.schedule('wednesday at 17:00', 'WednesdayManHoursTotalEmail');
  });
  // ------------------------------------------------------------------------
};

module.exports = function (agenda) {
  start(agenda);
};
