angular.module('WorkOrderApp.Services')
.factory('WorkOrderAccordionService', [function () {

  var WorkOrderAccordionService = {};

  WorkOrderAccordionService.instantiate = function (workorder) {
    var isCreate = !workorder._id;
    return {
      genInfo:      { open: true,      disabled: false, valid: false },
      hardware:     { open: !isCreate, disabled: true,  valid: false },
      logs:         { open: !isCreate, disabled: true,  valid: false },
      callOut:      { open: !isCreate, disabled: true,  valid: false },
      highPressure: { open: !isCreate, disabled: true,  valid: false },
      parts:        { open: !isCreate, disabled: true,  valid: false }
    };
  };

  WorkOrderAccordionService.sectionIsValid = function (section, accordion, workorder) {
    var isValid = false;
    var wo = workorder;

    switch (section) {

      case "genInfo":
        isValid = wo.date &&
                  wo.unit.number;
                  break;

      case "hardware":
        isValid = accordion.genInfo.valid &&
                  wo.suction.length !== 0 &&
                  wo.discharge.length !== 0 &&
                  wo.flowrate.length !== 0 &&
                  wo.engineHours.length !== 0 &&
                  wo.engineOilPressure.length !== 0 &&
                  wo.jwTemperature.length !== 0 &&
                  wo.rpm.length !== 0 &&
                  wo.manifoldVac.length !== 0 &&
                  wo.compressorHours.length !== 0 &&
                  wo.compressorOilPressure.length !== 0;
                  break;

      case "logs":
        isValid = accordion.hardware.valid &&
                  wo.workOrderLogs;
                  break;

      case "callOut":
        isValid = accordion.logs.valid &&
                  (wo.isCallOut !== true || (
                   wo.calledOutBy &&
                   wo.timeCalled &&
                   wo.timeDeparted &&
                   wo.timeArrived &&
                   wo.callOutReason
                  ));
                  break;

      case "highPressure":
        isValid = accordion.logs.valid &&
                  ((wo.isHighPressure !== true) || (!!wo.pressureRating));
                  break;

      case "parts":
        isValid = accordion.logs.valid &&
                  wo.workOrderParts;
                  break;

    }
    return isValid;
  };

  return WorkOrderAccordionService;

}]);
