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
    agenda.every('10 seconds', 'manHoursEmails');
  });
  // ------------------------------------------------------------------------
  
  // Every Thursday at Noon -------------------------------------------------
  // ------------------------------------------------------------------------
  
  // Every Sunday at 6 am ---------------------------------------------------
  // ------------------------------------------------------------------------
};
