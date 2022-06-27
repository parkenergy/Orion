
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
         setTimeout(() => {  log.info('Units.'); loadUnits() ;  }, 1000);
               
              
        })
            .then(() => {  
        setTimeout(() => {   log.info('Vendors.');  loadVendors();  }, 5000);
              
          
        })
            .then(() => {
           setTimeout(() => {    loadUsers(); log.info('.'); }, 5000);
             
                log.info('Users.')
        })
           
            .then(() => {
         setTimeout(() => {    loadParts(); log.info('.'); }, 10000);
             
               
        })
            .then(() => {
          setTimeout(() => { loadApplicationTypes();  }, 15000);
               
                log.info('Application Types.')
        })
            .then(() => {
           setTimeout(() => {   loadAssetTypes() ;   log.info('Asset Types.'); }, 20000);
         
             
        })
            .then(() => {
        setTimeout(() => {  loadLocations();   log.info('Locations.'); }, 25000);
               
        })
            .then(() => {
           setTimeout(() => {  loadFrameModels();   log.info('Frame Models.') ; }, 30000);
              
        })
            .then(() => {
             loadEngineModels()
                 setTimeout(() => {    log.info('Engine Models') log.info('Kill Codes')  }, 35000);
               
        })
            .then(() => {
          setTimeout(() => {     loadKillCodes();  log.info('Kill Codes')  }, 40000);
       
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
