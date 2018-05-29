'use strict';
const GenericError = require('./generic');

class AuthError extends GenericError {
    constructor (message, status, level) {
        super(message, status, level)

        this.title = 'AuthError occurred'
        this._level = level
        this._status = status
    }

    get level () { return this._level || 'warn' }

    set level (level) { this._level = level }

    get status () { return this._status || 403 }

    set status (status) { this._status = status }
}

module.exports = AuthError;
