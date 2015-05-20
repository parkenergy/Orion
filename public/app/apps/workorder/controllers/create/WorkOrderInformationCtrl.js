angular.module('WorkOrderApp.Controllers').controller('WorkOrderInformationCtrl',
['$scope', 'AlertService', 'Users',
  function ($scope, AlertService, Users) {

  // Watches the unit number to prefil the form data
  $scope.$watch('workorder.unit.number', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      for (var i = 0, len = $scope.units.length; i < len; i++) {
        if ($scope.units[i].number === newVal) {
          // deep copy the unit from the collection to prevent the data
          // from being overwritten by the ng-model bindings on the form.
          $scope.workorder.unit = angular.copy($scope.units[i]);
        }
      }
    }
  }, true);

  $scope.$watch('workorder.unit', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      var id = $scope.workorder.unit.ServicePartnerId;
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

  // Watches the Technician and loads the object onto the workorder.
  $scope.$watch('workorder.TechnicianId', function (newVal, oldVal) {
    if (newVal !== oldVal) {
      $scope.technicians.forEach(function (element, index, array) {
        if (element.id === $scope.workorder.TechnicianId) {
          $scope.workorder.technician = element;
        }
      });
    }
  }, true);

}]);
