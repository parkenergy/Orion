'use strict';

const axios = require('axios');

const getPOListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=transaction&id=277';

const POSTPOURL5 = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=182&deploy=5';
const urlHeaders = {
    headers: {
        'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
        'User-Agent': 'SuiteScript-Call',
        'Content-Type': 'application/json',
    },
};

module.exports = {

    newPONumber () {
        return new Promise((resolve, reject) => {
            axios.get(getPOListUrl, {
                    headers: urlHeaders.headers,
                })
                .then((res) => {
                const docs = res.data;
                const numbers = docs.map((d) => +d.columns.tranid);
                resolve(numbers.reduce((acc, val) => (acc > val) ? acc : val));
                }).catch(reject);
        });
    },

    createPO (data) {
        return new Promise((resolve, reject) => {
            axios.post(POSTPOURL5, data, {
                    headers: urlHeaders.headers,
                })
                .then((res) => {
                resolve(res.data);
                }).catch(reject);
        });
    },

};
