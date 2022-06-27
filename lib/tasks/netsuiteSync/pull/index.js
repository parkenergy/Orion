
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
          //  setTimeout(() => {  log.info('Units.'); }, 1000);
               loadUnits() ;  
              
        })
            .then(() => {  
          //  setTimeout(() => {   log.info('Vendors.');}, 5000);
                loadVendors();  
          
        })
            .then(() => {
          //  setTimeout(() => {  log.info('.'); }, 5000);
                loadUsers()
                log.info('Users.')
        })
           
            .then(() => {
          //  setTimeout(() => {  log.info('.'); }, 10000);
                loadParts()
                log.info('Parts.')
        })
            .then(() => {
          //   setTimeout(() => {  log.info('.'); }, 5000);
               loadApplicationTypes()
                log.info('Application Types.')
        })
            .then(() => {
             //    setTimeout(() => {  log.info('.'); }, 5000);
           loadAssetTypes()
                log.info('Asset Types.')
        })
            .then(() => {
           // setTimeout(() => {  log.info('.'); }, 5000);
               loadLocations()
                log.info('Locations.')
        })
            .then(() => {
        //    setTimeout(() => {  log.info('.'); }, 5000);
               loadFrameModels()
                log.info('Frame Models.')
        })
            .then(() => {
             loadEngineModels()
                log.info('Engine Models')
        })
            .then(() => {
         //   setTimeout(() => {    }, 15000);
          loadKillCodes();
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
