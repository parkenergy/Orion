'use strict';

const log                 = require('../../../helpers/logger'),
      manHourMonitoringFn = require('../../manHourMonitoring/manHourMonitoring');

module.exports = function (agenda) {

    // Every 4 Hours ----------------------------------------------------------
    agenda.define('manHoursEmails', {concurrency: 1}, (job, done) => {
        return manHourMonitoringFn()
            .then(() => {
                log.trace('Finished manHoursEmails Task');
                done();
            })
            .catch((err) => {
                log.error({error: err}, 'Error while trying to email manHours' +
                    err);
                done();
            });
    });

    agenda.on('ready', () => {
        // agenda.schedule('monday at 21:37', 'manHoursEmails');
        // agenda.every('30 seconds', 'manHoursEmails');
        // agenda.every('2 minutes', 'manHoursEmails');
        agenda.every('2 hours', 'manHoursEmails');
    });
    // ------------------------------------------------------------------------
};
