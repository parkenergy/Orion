'use strict';
const log           = require('../helpers/logger'),
    ValidationError = require('mongoose/lib/error/validation'),
    GenericError = require('../errors/generic');

const responder = (req, res, next) => {
    res.reject = function (err) {
        if (err instanceof GenericError) {
            err.log()
            err.reject(res)
        }
        else if (err instanceof ValidationError) {
            log.warn({stack: err.stack || null, error: err.toString(), status: 400}, 'ValidationError occurred')
            res.status(400).send(err.message || err)
        }
        else {
            log.error({stack: err.stack || null, error: err.message || err}, 'Error occurred: ' + err)
            res.status(500).send(err.message || err)
        }
    }
    res.resolve = function (results) {
        res.json(results)
    }
    //res.resolve = res.json;

    // Helper to respond wth downloadable string
    res.downloadable = (fileName, type, str) => {
        log.info({fileName: fileName, type: type}, 'File download sent')
        res.set('Content-Disposition', 'attachment; filename=\"' + fileName + '\"')
        res.set('Content-Type', type)
        res.send(str)
    }

    next()
};

module.exports = app => {
    app.use(responder)
};
