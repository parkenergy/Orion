'use strict';

const log                 = require('../../../helpers/logger'),
  manHourMonitoringFn = require('../../manHourMonitoring/manHourMonitoring');

module.exports = function (agenda) {
  
  // Every 4 Hours ----------------------------------------------------------
  agenda.define('manHoursEmails', (job, done) => {
    manHourMonitoringFn()
      .then(() => {
        console.log('finished');
        done();
      })
      .catch((err) => {
        log.error({error: err}, "Error while trying to email manHours" + err);
        done();
      });
  });
  
  agenda.on('ready', () => {
    // agenda.schedule('monday at 21:37', 'manHoursEmails');
    agenda.every('2 hours', 'manHoursEmails');
  });
  // ------------------------------------------------------------------------
  
  // Every Thursday at Noon -------------------------------------------------
  agenda.define('ThursdayManHoursTotalEmail', (job, done) => {
    // method to get man hours for the week from monday - this current time Thursday
  });
  
  agenda.on('ready', () => {
    agenda.schedule('thursday at 17:00', 'ThursdayManHoursTotalEmail');
  });
  // ------------------------------------------------------------------------
  
  // Every Sunday at 6 am ---------------------------------------------------
  agenda.define('SundayPastWeekWOLCHTotalEmail', (job, done) => {
    // method to get man hours from Sunday at 00:00 to Saturday at 23:59 of past week
  });
  
  agenda.on('ready', () => {
    agenda.schedule('sunday at 00:00', 'SundayPastWeekWOLCHTotalEmail');
  });
  // ------------------------------------------------------------------------
};
