'use strict';

const axios = require('axios');

const getPOListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=transaction&id=277';

const POSTPOURL5 = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=182&deploy=5';
const urlHeaders = {
    headers: {
        'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy2018~',
        'User-Agent':    'SuiteScript-Call',
        'Content-Type':  'application/json',
    },
};

module.exports = {

    newPONumber () {
        return new Promise((resolve, reject) => {
            let backoff = 200
            let retries = 8
            const makeCall = (repeats) => {
                axios.get(getPOListUrl, {
                         headers: urlHeaders.headers,
                     })
                     .then((res) => {
                         const docs = res.data
                         const numbers = docs.map((d) => +d.columns.tranid)
                         resolve(numbers.reduce((acc, val) => (acc > val) ? acc : val))
                     })
                     .catch((error) => {
                         const error_message = error.response.data.error.code ||
                             JSON.stringify(error)
                         if (['ECONNRESET', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'SSS_REQUEST_LIMIT_EXCEEDED'].indexOf(error_message) !==
                             -1) {
                             if (repeats > 0) {
                                 if (backoff && retries) {
                                     setTimeout(() => {
                                         makeCall(repeats - 1)
                                     }, backoff * (retries - (repeats + 1)))
                                 } else {
                                     makeCall(repeats - 1)
                                 }
                             } else {
                                 reject(error)
                             }
                         } else {
                             reject(error)
                         }
                     })
            }
            makeCall(retries)
        });
    },

    createPO (data) {
        return new Promise((resolve, reject) => {
            let backoff = 200
            let retries = 8
            const makeCall = (repeats) => {
                axios.post(POSTPOURL5, data, {
                         headers: urlHeaders.headers,
                     })
                     .then((res) => {
                         resolve(res.data)
                     })
                     .catch((error) => {
                         const error_message = error.response.data.error.code ||
                             JSON.stringify(error)
                         if (['ECONNRESET', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'SSS_REQUEST_LIMIT_EXCEEDED'].indexOf(error_message) !==
                             -1) {
                             if (repeats > 0) {
                                 if (backoff && retries) {
                                     setTimeout(() => {
                                         makeCall(repeats - 1)
                                     }, backoff * (retries - (repeats + 1)))
                                 } else {
                                     makeCall(repeats - 1)
                                 }
                             } else {
                                 reject(error)
                             }
                         } else {
                             reject(error)
                         }
                     })
            }
            makeCall(retries)
        });
    },

};
