'use strict';

const log         = require('../../../helpers/logger'),
      GmailMailer = require('../../../helpers/email_helper'),
      nodemailer  = require('nodemailer');

module.exports = function (agenda) {
  
  agenda.define('manHoursEmails', (job, done) => {
    log.info('testing Man Hours');
    const mailer = new GmailMailer();
    mailer.transport.verify(function (err, success) {
      if (err) {
        log.info({error: err}, "Error while manHours emailing: " + err);
        log.error({error: err}, "Error while manHours emailing: " + err);
        done();
      } else {
        log.info({success: success}, "Server is ready to make our messages");
        let mailOptions = {
          from: '"Orion Alerts" <orionalerts@parkenergyservices.com>"',
          to: 'mwhelan@parkenergyservices.com',
          subject: 'test',
          text: 'this was a test message',
        };
        mailer.transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            log.info({error: error}, "Error while manHours emailing Send: " + error);
            log.error({error: error}, "Error while manHours emailing Send: " + error);
            done();
          } else {
            log.info({message: info.message}, "Message sent");
            log.info({messageUrl: nodemailer.getTestMessageUrl(info)}, "Preview URL");
            done();
          }
        });
      }
    });
  });
  
  agenda.on('ready', () => {
    agenda.every('20 seconds', 'manHoursEmails');
  });
};
