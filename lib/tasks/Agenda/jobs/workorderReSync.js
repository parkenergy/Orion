'use strict'
const log = require('../../../helpers/logger')
const WOReSync = require('../../netsuiteSync/push/workorders')

module.exports = function (agenda) {
    agenda.define('workorderReSync', (job, done) => {
        log.info('WO Resync Started ....')
        return WOReSync()
                     .then(() => {
                         log.info('WO Resync finished ....')
                         log.trace('finished woReSync')
                         done()
                     })
                     .catch((err) => {
                         log.info('WO ReSync Failed....')
                         log.error({error: err}, 'Error while attempty to Re Sync WOs' +
                             JSON.stringify(new Date()))
                         done()
                     })
    })

    agenda.on('ready', () => {
        agenda.every('7 minutes', 'workorderReSync')
    })
}
