
const loadUnits           = require('./unit.js'),
    loadCustomers         = require('./customer.js'),
    loadUsers             = require('./user.js'),
    loadParts             = require('./part.js'),
    loadApplicationTypes  = require('./applicationtype.js'),
    loadAssetTypes        = require('./assetType'),
    loadVendors           = require('./vendor'),
    loadLocations         = require('./location.js'),
    log = require('../../helpers/logger');


module.exports = function () {
    return new Promise((resolve, reject) => {
        log.trace("Netsuite tasks started");

        loadCustomers()
            .then(() => loadVendors())
            .then(() => loadUsers())
            .then(() => loadUnits())
            .then(() => loadParts())
            .then(() => loadApplicationTypes())
            .then(() => loadAssetTypes())
            .then(() => loadLocations())
            .then(() => {
                log.trace("Netsuite Task Finished");
                resolve();
            })
            .catch((err) => {
                log.trace("Netsuite Task Failed");
                console.log(err);
                reject(err);
            })
    });
};
