angular.module('WorkOrderApp.Services')
.factory('CommonWOfunctions', [function () {
  var CommonWOFunctions = {};

  // Add Component Name to every part in wo -------------
  CommonWOFunctions.addComponentNameToParts = function (wo, parts) {
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
    return wo;
  };
  // ----------------------------------------------------


  return CommonWOFunctions;
}]);
