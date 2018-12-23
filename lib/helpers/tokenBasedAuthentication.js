'use strict'

const nsrestlet = require('nsrestlet')

class TBA {
    /**
     * Would make these priveate but not allowed yet in es6
     * @param url - full url with deplaoy and script Id. and recordy type if needed
     */
    constructor (url) {
        this.accountSettings = {
            accountId:      '4086435',
            tokenKey:       '91a98fb2380a49f47700e2f88112935af7cc5081aa8f72d8bf5e5f2df49d72cb',
            tokenSecret:    'e6d9706fef2a5f270f947b49ccaaca213aae5513d6077681db57ffa23a2e6307',
            consumerKey:    '747d3d1d175c4e866938e8712b90e420606981c5e389acb140c74eec5cfb6674',
            consumerSecret: '38b57c0910b0b920f2f8ba1c2d0d4781418937be6cf2bfc9ee5b3c8532b58a37',
        }
        this.urlSettings = {url: ''}
        this.urlSettings.url = url
        this.link = nsrestlet.createLink(this.accountSettings, this.urlSettings)
    }

    /**
     *
     * @param obj - posting object
     * @param success - cb
     * @param failure - cb
     */
    postRequest (obj, success, failure) {
        this.link.post(obj)
            .then(success)
            .catch(failure)
    }

    /**
     * The Script request is the Internal Id of the Saved search in Netsuite
     * @param scriptId
     * @param success - cb
     * @param failure - cb
     */
    getRequest (scriptId, success, failure) {
        this.link.get({tranid: scriptId})
            .then(success)
            .catch(failure)
    }
}

module.exports = TBA
