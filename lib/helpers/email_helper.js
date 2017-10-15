'use strict';
const nodemailer = require('nodemailer');

class GmailMailer {
  constructor () {
    this.transport = nodemailer.createTransport(this.generateTransport());
  }
  /*generateTransport() {
      return {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
        }
      }
  }*/
  
  generateTransport() {
    return {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'mwhelan@parkenergyservices.com',
        pass: 'Iluepm16'
      }
    };
  }
}

module.exports = GmailMailer;
