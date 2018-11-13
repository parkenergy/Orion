angular.module('WorkOrderApp.Services')
.factory('CommonWOfunctions', [function () {
  var CommonWOFunctions = {};

  // Add Component Name to every part in wo -------------
  CommonWOFunctions.addComponentNameToParts = function (wo, parts) {
    if(wo.hasOwnProperty('parts')){
      if(wo.parts.length !== 0){
        wo.parts.map(function (part) {
          var netsuiteId = +part.netsuiteId;
          _.forEach(parts, function (obj) {
            if(obj.netsuiteId === netsuiteId){
              part.componentName = (obj.componentName) ? obj.componentName : '';
            }
          });
        });
      }
    }
    return wo;
  };
  // ----------------------------------------------------

    // clear all emissions, unitReadings, pmChecklist items
    // that are not associated with this WO
    CommonWOFunctions.clearNoneEngineFrame = function (wo, woInputs) {
        woInputs.forEach((input) => {
            let found = false
            input.engines.forEach((engine) => {
                if (engine.netsuiteId === wo.unitReadings.engineModel) {
                    found = true
                }
            })
            input.compressors.forEach((frame) => {
                if (frame.netsuiteId === wo.unitReadings.compressorModel) {
                    found = true
                }
            })
            if (!found) {
                // clear this input
                wo[input.path] = ''
            }
        })
        return wo
    }
  
  return CommonWOFunctions;
}]);
