// 'use strict';

const Agenda = require('agenda'),
      config = require('../../../config'),
      mongoose     = require('mongoose'),
      log     = require('../../helpers/logger'),
      agenda = new Agenda({db: {address: config.mongodb}}),
      jobTypes = [
        'netsuiteSync',
        'manHoursEmails',
        'WednesdayManHoursTotalEmail',
        'SaturdayPastWeekWOLCHTotalEmail',
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

    return Promise.all(jobTypes.map((type) => {
      return ApplicationAgenda.gracefulShutdownCB(type);
    }))
    .then((num) => {
      log.trace({number: num}, 'Number of netsuiteSync agenda jobs removed');
      agenda.stop(() => {
        mongoose.connection.close();
        process.exit(0)
      });
    })
    .catch((err) => {
      console.log(err);
    })
  }
};

module.exports = ApplicationAgenda;
