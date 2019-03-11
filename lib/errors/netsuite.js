'use strict'
const GenericError = require('./generic')

class NetsuiteError extends GenericError {
    constructor (message, status, level) {
        super(message, status, level)
        this.title = 'Netsuite Error occurred'
        this._level = level
        this._status = status
    }

    get level () { return this._level || 'warn'}
    set level (level) { this._level = level}
    get status () { return this._status || 502}
    set status (status) { this._status = status}
}

module.exports = NetsuiteError
