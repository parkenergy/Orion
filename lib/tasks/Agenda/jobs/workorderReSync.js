'use strict'
const log = require('../../../helpers/logger')
const WOSync = require('../../../helpers/wo_SyncChecks')
const WorkOrders = require('../../../models/workOrder')

module.exports = function (agenda) {
    agenda.define('workorderReSync', {concurrency: 1}, (job, done) => {
        const WOSYNC = new WOSync(WorkOrders, [], [])
        return WOSYNC.syncWOs()
                     .then(() => {
                         log.trace('finished woReSync')
                         done()
                     })
                     .catch((err) => {
                         log.error({error: err}, 'Error while attempty to Re Sync WOs' +
                             JSON.stringify(new Date()))
                         done()
                     })
    })

    agenda.on('ready', () => {
        agenda.every('10 minutes', 'workorderReSync')
    })
}
