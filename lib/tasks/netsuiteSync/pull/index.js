
const loadUnits            = require('./unit.js'),
      loadCustomers        = require('./customer.js'),
      loadUsers            = require('./user.js'),
      loadParts            = require('./part.js'),
      loadApplicationTypes = require('./applicationtype.js'),
      loadAssetTypes       = require('./assetType'),
      loadVendors          = require('./vendor'),
      loadFrameModels      = require('./framemodel'),
      loadEngineModels     = require('./enginemodel'),
      loadLocations        = require('./location.js'),
      loadKillCodes        = require('./killcode'),
      log                  = require('../../../helpers/logger');


module.exports = function () {
    return new Promise((resolve, reject) => {
        log.trace("Netsuite tasks started");
        // resolve()
        loadCustomers()
            .then(() => {
                loadVendors()
                log.info('Vendors.')
        })
            .then(() => {
                loadUsers()
                log.info('Users.')
        })
            .then(() => {
                loadUnits() 
                log.info('Units.')
        })
            .then(() => {
                loadParts()
                log.info('Parts.')
        })
            .then(() => {
                loadApplicationTypes()
                log.info('Application Types.')
        })
            .then(() => {
                loadAssetTypes()
                log.info('Asset Types.')
        })
            .then(() => {
               loadLocations()
                log.info('Locations.')
        })
            .then(() => {
               loadFrameModels()
                log.info('Frame Models.')
        })
            .then(() => {
                loadEngineModels()
                log.info('Engine Models')
        })
            .then(() => {
            loadKillCodes()
            log.info('Kill Codes')
        })
            .then(() => {
                log.trace('Netsuite Task Finished')
                resolve()
            })
            .catch((err) => {
                log.trace('Netsuite Task Failed')
                console.log(err)
                reject(err)
            })
    });
};
