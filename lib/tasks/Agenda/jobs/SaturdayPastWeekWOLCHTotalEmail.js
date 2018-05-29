'use strict';

const log = require('../../../helpers/logger'),
    SaturdayFridayTotalEmail = require('../../manHourMonitoring/SaturdayPastWeekTotal');

const define = (agenda) => {
    agenda.define('SaturdayPastWeekWOLCHTotalEmail', {concurrency: 1}, (job, done) => {
        // method to get man hours Saturday Sunday at 00:00 to Friday at 23:59 of past week
        return SaturdayFridayTotalEmail()
            .then(() => {
                log.trace('Finished SaturdayPastWeekWOLCHTotalEmail Task')
                // remove job from db and reschedule
                job.remove((err) => {
                    if (err) {
                        log.debug({error: err}, 'Error Saturday Past week email, on remove')
                    }
                    define(agenda)
                    agenda.schedule('saturday at 15:00', 'SaturdayPastWeekWOLCHTotalEmail')
                    done()
                })
            })
            .catch((err) => {
                log.error({error: err}, `Error while trying to email Saturday total times: ${err}`)
                log.debug({error: err}, 'Error while trying ot email Saturday total, on execution')
                // remove job from db and reschedule
                job.remove((err) => {
                    if (err) {
                        log.debug({error: err}, 'Error Saturday Past week email, on execution, remove')
                    }
                    define(agenda)
                    agenda.schedule('saturday at 15:00', 'SaturdayPastWeekWOLCHTotalEmail')
                    done()
                })
            })
    })
};


const start = (agenda) => {
    // Every Sunday at 6 am ---------------------------------------------------
    define(agenda)
    agenda.on('ready', () => {
        // email out at 10 am on sunday  need + 5 hours
        // 15:00 = 10am
        agenda.schedule('saturday at 15:00', 'SaturdayPastWeekWOLCHTotalEmail')

        // agenda.schedule('friday at 16:28', 'SaturdayPastWeekWOLCHTotalEmail');
    })
    // ------------------------------------------------------------------------
};


module.exports = function (agenda) {
    start(agenda)
};
