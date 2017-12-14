'use strict';

const log = require('../../../helpers/logger'),
  SundaySaturdayTotalEmail = require('../../manHourMonitoring/SundayPastWeekTotal');

const define = (agenda) => {
  agenda.define('SundayPastWeekWOLCHTotalEmail', {concurrency: 1}, (job, done) => {
    // method to get man hours from Sunday at 00:00 to Saturday at 23:59 of past week
    SundaySaturdayTotalEmail()
      .then(() => {
        log.trace('Finished SundayPastWeekWOLCHTotalEmail Task');
        // remove job from db and reschedule
        job.remove((err) => {
          if (err) {
            log.debug({error: err}, 'Error Sunday Past week email, on remove');
          }
          define(agenda);
          agenda.schedule('sunday at 15:00', 'SundayPastWeekWOLCHTotalEmail');
          done();
        });
      })
      .catch((err) => {
        log.error({error: err}, `Error while trying to email Sunday total times: ${err}`);
        log.debug({error: err}, 'Error while trying ot email Sunday total, on execution');
        // remove job from db and reschedule
        job.remove((err) => {
          if (err) {
            log.debug({error: err}, 'Error Sunday Past week email, on execution, remove');
          }
          define(agenda);
          agenda.schedule('sunday at 15:00', 'SundayPastWeekWOLCHTotalEmail');
          done();
        });
      });
  });
};


const start = (agenda) => {
  // Every Sunday at 6 am ---------------------------------------------------
  define(agenda);
  agenda.on('ready', () => {
    // email out at 10 am on sunday  need + 5 hours
    // 15:00 = 10am
    agenda.schedule('sunday at 15:00', 'SundayPastWeekWOLCHTotalEmail');
  });
  // ------------------------------------------------------------------------
};


module.exports = function (agenda) {
  start(agenda);
};
