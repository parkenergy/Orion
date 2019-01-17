'use strict';

const TBA = require('../helpers/tokenBasedAuthentication')
const {isEmpty} = require('tedb-utils')
const log = require('../helpers/logger')

const getPOListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=transaction&id=277';

const POSTPOURL5 = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=182&deploy=5';


module.exports = {

    newPONumber () {
        return new Promise((resolve, reject) => {
            let backoff = 200
            let retries = 8
            const makeCall = (repeats) => {
                const newPOLink = new TBA(getPOListUrl)
                newPOLink.getRequest(277,
                    (res) => {
                        res = JSON.parse(res)
                        if (!isEmpty(res) && !isEmpty(res.error)) {
                            const error_message = res.error.code || JSON.stringify(res)
                            log.error(res.error)
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
                                    return reject(res)
                                }
                            } else {
                                return reject(res)
                            }
                        } else {
                            const numbers = res.map((d) => +d.columns.tranid)
                            resolve(numbers.reduce((acc, val) => (acc > val) ? acc : val))
                        }
                    }, (error) => {
                        if (!isEmpty(error.error)) {
                            console.log(error)
                            const error_message = error.error.code || JSON.stringify(error)
                            log.error(error.error)
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
                const createPOLink = new TBA(POSTPOURL5)
                createPOLink.postRequest(data,
                    (body) => {
                        if (!isEmpty(body) && !isEmpty(body.error)) {
                            const error_message = body.error.code ||
                                JSON.stringify(body)
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
                                    return reject(body.error)
                                }
                            } else {
                                return reject(body.error)
                            }
                        } else {
                            resolve(body)
                        }
                    }, (error) => {
                        console.log(error)
                        const error_message = error.error.code ||
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
