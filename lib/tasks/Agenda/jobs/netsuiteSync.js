'use strict';

const log           = require('../../../helpers/logger'),
      netsuiteSync  = require('../../netsuiteSync/index'),
      syncTask      = new netsuiteSync();

module.exports = function (agenda) {
  agenda.define('netsuiteSync', (job, done) => {

    log.info("Netsuite import...");
    syncTask.execute((err) => {
      if(err){
        log.error({error: err}, "Error occured during Netsuite Sync: " + err);
      }
      else {
        log.info("...Netsuite import finished");
      }
    });
    done();
  });

  agenda.on('ready', () => {
    // agenda.every('5 minutes', 'netsuiteSync');
    // agenda.start();
  });
};
