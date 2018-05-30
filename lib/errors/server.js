'use strict';
const GenericError = require('./generic');

class ServerError extends GenericError {
    constructor (message, status, level) {
        super(message, status, level);

        this.title = 'ServerError occurred';
        this._level = level;
        this._status = status;
    }

    get level () { return this._level || 'error'; }

    set level (level) { this._level = level; }

    get status () { return this._status || 500; }

    set status (status) { this._status = status; }
}

module.exports = ServerError;
