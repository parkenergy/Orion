'use strict';

const log      = require('../../../helpers/logger'),
      syncTask = require('../../netsuiteSync/pull');

module.exports = function (agenda) {
    agenda.define('netsuiteSync', (job, done) => {

        log.info("Netsuite import...");
        return syncTask()
            .then((res) => {
                log.info("...Netsuite import finished");
                done();
            })
            .catch((err) => {
                // log.error({error: err}, `Error while trying to sync`);
                // log.debug({error: err}, 'Error while trying to sync');
                log.error({error: err.error}, `error while trying to sync`)
                log.error(`${JSON.stringify(err)}`)

                log.info("...Netsuite import failed");
                done();
            });
    });

    agenda.on('ready', () => {
        agenda.every('5 minutes', 'netsuiteSync')
        // agenda.start();
    });
};
