angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$scope', '$location', 'AlertService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts', 'WorkOrderEditService', 'WorkOrderAccordionService', 'role', '$window',
  function ($scope, $location, AlertService, WorkOrders, workorder, units, customers, users, parts, WorkOrderEditService, WorkOrderAccordionService, role, $window) {

    $scope.title = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    // Assign all of the objects.
    WorkOrderEditService.load(workorder, function (err) {
      if (err) {
        AlertService.add("danger", err);
      } else {
        $scope.workorder = WorkOrderEditService.workorder;
        $scope.technicians = WorkOrderEditService.technicians;
        // Setup the button text.
        $scope.submitButtonText =
          WorkOrderEditService.submitButtonText($scope.workorder);
        $scope.rejectButtonText =
          WorkOrderEditService.rejectButtonText($scope.workorder);
          // Set up the accordion.
        $scope.accordion = WorkOrderAccordionService.instantiate($scope.workorder);
        $scope.activePanel = "general-information";
        $scope.oneAtATime = !$scope.workorder.id;
      }
    });

    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.parts = parts;
    $scope.role = role;
    $window.scope = $scope;

    // Watches the workorder to control form navigation and validation.
    $scope.$watch('workorder', function (newVal, oldVal) {
      var validate = WorkOrderAccordionService.sectionIsValid;
      for (var key in $scope.accordion) {
        var isValid = validate(key, $scope.accordion, $scope.workorder);
        $scope.accordion[key].valid = isValid;
      }
    }, true);


    $scope.crossPopulate = function () {
      var engineHours = $scope.workorder.engineHours;
      var compressorHours = $scope.workorder.compressorHours;
      if (engineHours && !compressorHours) {
        $scope.workorder.compressorHours = $scope.workorder.engineHours;
        return;
      }
      if (compressorHours && !engineHours) {
        $scope.workorder.engineHours = $scope.workorder.compressorHours;
        return;
      }
    };

    // Opens all of the accordion tabs. This breaks inside the service.
    $scope.toggleAll = function () {
      $scope.oneAtATime = !$scope.oneAtATime;
      if ($scope.oneAtATime) {
        $scope.accordion.genInfo.open = false;
        $scope.accordion.hardware.open = false;
        $scope.accordion.logs.open = false;
        $scope.accordion.callOut.open = false;
        $scope.accordion.highPressure.open = false;
        $scope.accordion.parts.open = false;
      } else {
        $scope.accordion.genInfo.open = true;
        $scope.accordion.hardware.open = true;
        $scope.accordion.logs.open = true;
        $scope.accordion.callOut.open = true;
        $scope.accordion.highPressure.open = true;
        $scope.accordion.parts.open = true;
      }
    };

    $scope.showHistory = false;
    $scope.toggleHistory = function () {
      $scope.showHistory = !$scope.showHistory;
    };


    $scope.save = function () {
      $scope.submitting = true;
      WorkOrderEditService.save($scope.workorder, $scope.role, function (err, data) {
        if (err) {
          AlertService.add("danger", err);
          $scope.submitting = false;
        } else {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        }
      });
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      WorkOrderEditService.destroy($scope.workorder, $scope.role, function (err, data) {
        if (err) {
          AlertService.add("danger", err);
          $scope.submitting = false;
        } else {
          AlertService.add("success", $scope.submitButtonText + " was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        }
      });
    };

}]);
