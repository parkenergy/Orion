'use strict';
const nodemailer = require('nodemailer');

class GmailMailer {
    constructor () {
        this.transport = nodemailer.createTransport(this.generateTransport());
    }

    // generateTransport() {
    //     return {
    //         host: 'smtp.gmail.com',
    //         port: 465,
    //         secure: true,
    //         auth: {
    //             type: 'OAuth2',
    //         }
    //     };
    // }

    generateTransport() {
        return {
            host: 'smtp-server.com',
            // port: 25,
            port: 465,
            // ignoreTLS: true,
            //logger: true,
            secure: true,
            // secure: false,
            auth: {
                user: 'orionalerts@parkenergyservices.com',
                pass: 'ParkEnergy',
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            },
            //debug: true,
        };
    }

    /*generateTransport() {
      return {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'mwhelan@parkenergyservices.com',
          pass: ''
        }
      };
    }*/
}

module.exports = GmailMailer;
