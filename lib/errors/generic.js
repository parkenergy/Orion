'use strict';
const logger = require('../helpers/logger');

class GenericError extends Error {
    constructor (message, level, status) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.title = '';
        this._level = level;
        this._status = status;

        Error.captureStackTrace(this, this.constructor);
    }

    get level () { return this._level || 'error'; }

    set level (level) { this._level = level; }

    get status () { return this._status || 500; }

    set status (status) { this._status = status; }

    log () {
        const {stack, message: error, level, title} = this;
        logger[level]({stack, error}, title);
    }

    reject (res) {
        const {status, message} = this;
        res.status(status).send(message);
    }
}

module.exports = GenericError;
