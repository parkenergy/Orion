'use strict';

const log = require('../../../helpers/logger'),
  SundaySaturdayTotalEmail = require('../../manHourMonitoring/SundayPastWeekTotal');

module.exports = function (agenda) {
  // Every Sunday at 6 am ---------------------------------------------------
  agenda.define('SundayPastWeekWOLCHTotalEmail', {concurrency: 1}, (job, done) => {
    // method to get man hours from Sunday at 00:00 to Saturday at 23:59 of past week
    SundaySaturdayTotalEmail()
      .then(() => {
        log.trace('Finished SundayPastWeekWOLCHTotalEmail Task');
        agenda.schedule('sunday at 15:00', 'SundayPastWeekWOLCHTotalEmail');
        done();
      })
      .catch((err) => {
        log.error({error: err}, "Error while trying to email Sunday Past week summary" + err);
        agenda.schedule('sunday at 15:00', 'SundayPastWeekWOLCHTotalEmail');
        done();
      });
  });
  
  agenda.on('ready', () => {
    // email out at 10 am on sunday  need + 5 hours
    // 15:00 = 10am
    agenda.schedule('sunday at 15:00', 'SundayPastWeekWOLCHTotalEmail');
  });
  // ------------------------------------------------------------------------
};