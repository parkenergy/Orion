'use strict';

const Agenda = require('agenda'),
      config = require('../../../config'),
      mongoose     = require('mongoose'),
      log     = require('../../helpers/logger'),
      agenda = new Agenda({db: {address: config.mongodb}}),
      jobTypes = [
        'netsuiteSync',
        'manHoursEmails',
      ];

const ApplicationAgenda = {
  
  /**
   * Make agenda pull in jobs listed above and make them available to
   * the code base.
   */
  start() {
    
    jobTypes.forEach((type) => {
      require(`./jobs/${type}`)(agenda);
    });
    
    
    if (jobTypes.length) {
      agenda.on('ready', () => {
        agenda.start();
      });
    }
  },
  
  graceful() {
    log.trace('Graceful shutdown');
    jobTypes.forEach((job) => {
      agenda.cancel({name: `${job}`}, (err, num) => {
        if (err) log.error(`Error graceful shutdown of agenda job ${job}: ${err}`);
      })
    });
    agenda.stop(() => process.exit(0));
    mongoose.connection.close();
  }
};

module.exports = ApplicationAgenda;
