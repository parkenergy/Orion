const log = require('../../../helpers/logger')
const WOSync = require('../../../helpers/wo_SyncChecks')
const WorkOrders = require('../../../models/workOrder')

module.exports = function () {
    return new Promise((resolve, reject) => {
        const WOSYNC = new WOSync(WorkOrders, [], [])
        log.info('WO Resync Started')
        return WOSYNC.syncWOs()
            .then(() => {
                log.info('WO Resync finished...')
                resolve()
            })
            .catch((err) => {
                log.info('WO Resync failed')
                reject(err)
            })
    })
}
