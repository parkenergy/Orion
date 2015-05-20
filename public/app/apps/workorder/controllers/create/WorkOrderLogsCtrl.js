angular.module('WorkOrderApp.Controllers').controller('WorkOrderLogsCtrl',
['$scope', 'enumeration', 'AlertService', function ($scope, enumeration, AlertService) {

  $scope.enumeration = enumeration.workorder;
  $scope.typeNames = $scope.enumeration.typeNames();
  $scope.systemNames = $scope.enumeration.systemNames();
  $scope.typeOfWorkPerformedNames = $scope.enumeration.typeOfWorkPerformedNames();
  $scope.hoursList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  $scope.minutesList = [0, 15, 30, 45];

  // Creates a new part for out parts.html page and directive.
  $scope.emptyWorkOrderLog = function () {
    return {
      WorkOrderId: null,
      typeOfWorkPerformed: null,
      system: null,
      subsystem: null,
      type: null,
      subtype: null,
      hours: 0,
      minutes: 0
    };
  };

  // Initialize the newPart variable with the appropriate data.
  $scope.newWorkOrderLog = $scope.emptyWorkOrderLog();

  $scope.lineItemSubmissionDisabled = true; // initial UI config
  $scope.subtypeSelectionDisabled = true; // initial UI config
  $scope.systemSelectionDisabled = true; // initial UI config

  // Removes a part from the table on the parts.html page.
  $scope.removeLog = function (index) {
    $scope.workorder.workOrderLogs.splice(index,1);
  };

  // Adds the current part to the table and empties out the new part form.
  $scope.addNewLog = function () {
    var log = $scope.newWorkOrderLog;
    if (log.hours === 0 && log.minutes === 0) {
      var description = "You've added a workorder line item without times. " +
              "Please remove it and redo this line item if this was in error.";
      AlertService.add("danger", description, 15);
    }
    $scope.workorder.workOrderLogs.push(log);
    $scope.newWorkOrderLog = $scope.emptyWorkOrderLog();
  };

  $scope.$watch('newWorkOrderLog.system', function (newVal, oldVal) {
    if (newVal !== oldVal) {

      var system = $scope.newWorkOrderLog.system;

      if (system) {
        $scope.subsystemNames =
          $scope.enumeration.subsystemNames($scope.newWorkOrderLog);

        if (system !== 0) { // Optimization
          $scope.subsystemSelectionDisabled = false;
        }

      } else {
        $scope.subsystemSelectionDisabled = true;
        $scope.newWorkOrderLog.subsystem = null;
        $scope.newWorkOrderLog.subsystemNames = [];
      }
    }
  }, true);

  $scope.$watch('newWorkOrderLog.type', function (newVal, oldVal) {
    if (newVal !== oldVal) {

      var type = $scope.newWorkOrderLog.type;

      if (type) {

        $scope.subtypeNames =
          $scope.enumeration.subtypeNames($scope.newWorkOrderLog);

        $scope.lineItemSubmissionDisabled = false;

        if (type === 1) { // pm
          $scope.subtypeSelectionDisabled = true;
          $scope.systemSelectionDisabled = true;
          $scope.newWorkOrderLog.system = null;
          $scope.newWorkOrderLog.subsystem = null;
        } else if (type === 2 || type === 4) { // un-scheduled or shop work
          $scope.subtypeSelectionDisabled = false;
          $scope.systemSelectionDisabled = false;
        } else {
          $scope.subtypeSelectionDisabled = false;
          $scope.systemSelectionDisabled = true;
          $scope.newWorkOrderLog.system = null;
          $scope.newWorkOrderLog.subsystem = null;
        }

      } else {
        $scope.newWorkOrderLog.subtypeNames = [];
        $scope.lineItemSubmissionDisabled = true;
        $scope.systemSelectionDisabled = true;
        $scope.newWorkOrderLog.system = null;
        $scope.newWorkOrderLog.subsystem = null;
      }
    }
  }, true);

}]);
