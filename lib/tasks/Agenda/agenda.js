'use strict';

const Agenda = require('agenda'),
      config = require('../../../config'),
      mongoose     = require('mongoose'),
      log     = require('../../helpers/logger'),
      agenda = new Agenda({db: {address: config.mongodb}}),
      jobTypes = [
        'netsuiteSync',
        'manHoursEmails',
        'ThursdayManHoursTotalEmail',
        'SundayPastWeekWOLCHTotalEmail',
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
  
  gracefulShutdownCB(name) {
    return new Promise((resolve, reject) => {
      agenda.cancel({name: `${name}`}, (err, num) => {
        if (err) {
          log.error(`Error graceful shutdown of agenda job ${name}: ${err}`);
          return reject(err);
        } else {
          resolve(num);
        }
      });
    });
  },
  
  graceful() {
    log.trace('Graceful shutdown');
    const promises = [];
    jobTypes.forEach((job) => {
      promises.push(ApplicationAgenda.gracefulShutdownCB(job));
    });
    Promise.all(promises)
      .then((num) => {
        log.trace({number: num}, 'Number of netsuiteSync agenda jobs removed');
        //agenda.stop(() => process.exit(0));
        agenda.stop(() => {
          process.exit(0)
        });
        mongoose.connection.close();
      })
  }
};

module.exports = ApplicationAgenda;
