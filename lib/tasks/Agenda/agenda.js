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

jobTypes.forEach((type) => {
  require(`./jobs/${type}`)(agenda);
});

if (jobTypes.length) {
  agenda.on('ready', () => {
    agenda.start();
  });
  // agenda.start();
}

// Gracefully shutdown
function graceful() {
  // cancel all netsuiteSync jobs.
  let count = 0;
  jobTypes.forEach((job) => {
    agenda.cancel({name: job}, function (err, numberRemoved) {
      if(err) log.error({err: err}, 'Error Shutting down netsuiteSync agenda job' + err);
      count += numberRemoved;
    });
  });
  
  log.trace({number: count}, 'Number of netsuiteSync agenda jobs removed');
  
  agenda.stop();
  // disconnect from database
  mongoose.connection.close();
  
  setTimeout(function () {
    process.exit(0);
  },300);
  
}
// Run Gracefull when ctrl+c or termination
process.on('SIGTERM',graceful);
process.on('SIGINT', graceful); // ctrl+c

module.exports = agenda;
