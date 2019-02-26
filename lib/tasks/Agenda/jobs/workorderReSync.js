'use strict'
const log = require('../../../helpers/logger')
const WOSync = require('../../../helpers/wo_SyncChecks')
const WorkOrders = require('../../../models/workOrder')

module.exports = function (agenda) {
    agenda.define('workorderReSync', {concurrency: 1}, (job, done) => {
        const WOSYNC = new WOSync(WorkOrders, [], [])
        log.info('WO Resync Started ....')
        return WOSYNC.syncWOs()
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
        agenda.every('10 minutes', 'workorderReSync')
    })
}
