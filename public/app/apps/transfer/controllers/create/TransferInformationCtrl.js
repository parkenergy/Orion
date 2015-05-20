angular.module('TransferApp.Controllers').controller('TransferInformationCtrl',
['$scope', 'AlertService', 'LoaderService', 'TransferAccordionService', 'Users', 'role',
  function ($scope, AlertService, LoaderService, TransferAccordionService, Users, role) {

  // Watches the transfer to control form navigation and validation.
  $scope.$watch('transfer', function (newVal, oldVal) {
    var validate = TransferAccordionService.sectionIsValid;
    for (var key in $scope.accordion) {
      var isValid = validate(key, $scope.accordion, $scope.transfer);
      $scope.accordion[key].valid = isValid;
    }
  }, true);

  // Watches the unit number to prefil the form data

  $scope.$watch('transfer.unit.number', function (newVal, oldVal) {
    if (newVal !== oldVal && $scope.loadingData !== true) {
      for (var i = 0, len = $scope.units.length; i < len; i++) {
        if ($scope.units[i].number === newVal) {
          // deep copy the unit from the collection to prevent the data
          // from being overwritten by the ng-model bindings on the form.
          $scope.transfer.unit = angular.copy($scope.units[i]);
          if ($scope.transfer.unit.location) {
            $scope.transfer.oldLocation = $scope.transfer.unit.location;
            $scope.transfer.OldLocationId = $scope.transfer.unit.location.id;
          }
          if ($scope.transfer.transferType === "REASSIGNMENT") {
            $scope.transfer.OldServicePartnerId = $scope.transfer.unit.ServicePartnerId;
          }
        }
      }
    }
  }, true);

  $scope.$watch('transfer.unit', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      var id = $scope.transfer.unit.ServicePartnerId;
      $scope.techniciansLoading = true;
      var obj = { ServicePartnerId: id, role: "TECHNICIAN" };
      Users.query({ where: obj },
        function (response) {
          $scope.technicians = response;
          obj = { ServicePartnerId: id, role: "REVIEWER" };
          Users.query({ where: obj },
            function (response) {
              $scope.technicians = $scope.technicians.concat(response);
              $scope.techniciansLoading = false;
            },
            function (err) {
              AlertService.add("danger", err);
            });
        },
        function (err) {
          AlertService.add("danger", err);
        });
    }
  }, true);

  $scope.$watch('transfer.TechnicianId', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      $scope.technicians.forEach(function (element, index, array) {
        if (element.id === $scope.transfer.TechnicianId) {
          $scope.transfer.technician = element;
        }
      });
    }
  }, true);

  $scope.filterNewSet = function (transfer) {
    return (transfer === "CONTRACT" || transfer === "TEST");
  };

  $scope.filterUnitMove = function (transfer) {
    return (transfer !== "CONTRACT" && transfer !== "TEST" &&
            transfer !== "REASSIGNMENT");
  };

  $scope.filterReassignment = function (transfer) {
    return (transfer === "REASSIGNMENT");
  };

}]);
