'use strict';

const log = require('../../../helpers/logger'),
  SundayThursdayTotalEmail = require('../../manHourMonitoring/Sunday_ThursdayTotalEmail');

module.exports = function (agenda) {
  // Every Thursday at Noon -------------------------------------------------
  agenda.define('ThursdayManHoursTotalEmail', (job, done) => {
    // method to get man hours for the week from monday - this current time Thursday
    SundayThursdayTotalEmail()
    .then(() => {
      log.trace('Finished ThursdayManHoursTotalEmail Task');
      done();
    })
    .catch((err) => {
      log.error({error: err}, `Error while trying to email Thursdays total times: ${err}`);
      done();
    });
  });
  
  agenda.on('ready', () => {
    // 17:00 = 12:00pm. need to have + 5hours to 12
    agenda.schedule('thursday at 17:00', 'ThursdayManHoursTotalEmail');
  });
  // ------------------------------------------------------------------------
};
