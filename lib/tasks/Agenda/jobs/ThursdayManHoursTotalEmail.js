'use strict';

const log = require('../../../helpers/logger'),
  SundayThursdayTotalEmail = require('../../manHourMonitoring/Sunday_ThursdayTotalEmail');

const define = (agenda) => {
  agenda.define('ThursdayManHoursTotalEmail', {concurrency: 1}, (job, done) => {
    // method to get man hours for the week from monday - this current time Thursday
    SundayThursdayTotalEmail()
      .then(() => {
        log.trace('Finished ThursdayManHoursTotalEmail Task');
        job.remove((err) => {
          if (err) {
            log.debug({error: err}, 'Error Sunday - Thursday this week, on remove');
          }
          define(agenda);
          agenda.schedule('thursday at 17:00', 'ThursdayManHoursTotalEmail');
          done();
        });
      })
      .catch((err) => {
        log.error({error: err}, `Error while trying to email Thursdays total times: ${err}`);
        log.debug({error: err}, 'Error while trying to email Sunday - Thursday, on execution');
        // remove job form db and reschedule
        job.remove((err) => {
          if (err) {
            log.debug({error: err}, 'Error Sunday - Thursday this week, on execution, remove')
          }
          define(agenda);
          agenda.schedule('thursday at 17:00', 'ThursdayManHoursTotalEmail');
          done();
        });
      });
  });
};

const start = (agenda) => {
  // Every Thursday at Noon -------------------------------------------------
  define(agenda);
  agenda.on('ready', () => {
    // 17:00 = 12:00pm. need to have + 5hours to 12
    agenda.schedule('thursday at 17:00', 'ThursdayManHoursTotalEmail');
  });
  // ------------------------------------------------------------------------
};

module.exports = function (agenda) {
  start(agenda);
};
