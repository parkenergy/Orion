angular.module('TransferApp.Controllers').controller('TransferEditCtrl',
['$scope', '$window', '$location', '$timeout', 'AlertService', 'transfer', 'units', 'customers', 'users','locations','states', 'counties',
  function ($scope, $window, $location, $timeout, AlertService, transfer, units, customers, users, locations, states, counties) {

    $scope.title = (transfer !== null ? "Edit " : "Create ") + "Transfer";

    $scope.transfer = transfer || newTransfer();

    $scope.loadingData = true;
    $scope.states = GeographyService.states;

    $scope.units = units;
    $scope.customers = customers;
    $scope.users = users;
    $scope.locations = locations;
    $scope.states = states;
    $scope.counties = counties;
    $window.scope = $scope;

    $scope.save = function () {
      $scope.submitting = true;
      console.log($scope.transfer);
      Transfers.save({_id: $scope.transfer._id}, $scope.transfer,
        function (response) {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/transfer");
        },
        function (err) {
          console.log(err);
          AlertService.add("danger", "An error occurred while attempting to save.");
          $scope.submitting = false;
        }
      );
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Transfers.destroy($scope.transfer,
        function (response) {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/transfer");
        },
        function (err) {
          console.log(err);
          AlertService.add("danger", "An error occurred while attempting to save.");
          $scope.submitting = false;
        }
      );
    };

    function newTransfer() {
      var newTrans =
      {
        transferDate : new Date(),

        unit : {},

        origin : {
          customer : {},
          location : {},
          county : {},
          state : {},
          legal : {}
        },

        destination : {
          customer : {},
          location : {},
          county : {},
          state : {},
          legal : {},
        },

        transferedBy : {},

        trasnferNote : ""

      }
      return newTrans;
    }
}]);
