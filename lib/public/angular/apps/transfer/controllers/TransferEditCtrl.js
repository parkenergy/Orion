angular.module('TransferApp.Controllers').controller('TransferEditCtrl',
['$scope', '$window', '$location', '$timeout', 'AlertService', 'Transfers', 'transfer', 'units', 'customers', 'users', 'states', 'counties',
  function ($scope, $window, $location, $timeout, AlertService, Transfers, transfer, units, customers, users, states, counties) {

    $scope.message = (transfer !== null ? "Edit " : "Create ") + "Transfer";
    $scope.transfer = transfer || newTransfer();

    $scope.units = units;
    $scope.customers = customers;
    users.forEach(function (u){
      u.fullname = u.firstName + ' ' + u.lastName;
    });
    $scope.users = users;
    $scope.states = states;
    $scope.counties = counties;

    $scope.today =  Date.now();

    $scope.status = {
      opened: false
    };

    $scope.open = function ($event) {
      $scope.status.opened = true;
    };

    $scope.$watch(
      function () { return $scope.transfer.unit; },
      function ( newValue, oldValue) {
        $scope.transfer.origin.customer = $scope.transfer.unit.Customer;
        $scope.transfer.origin.county = $scope.transfer.unit.county;
        $scope.transfer.origin.state = $scope.transfer.unit.state;
        $scope.transfer.origin.location = $scope.transfer.unit.locationName;
        $scope.transfer.origin.legal = $scope.trasnfer.unit.legalDescription;
      }, true );


    $scope.save = function () {
      console.log('Saving');
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
          $location.path("/myaccount");
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
        transferDate :  new Date(),

        unit: {number: ''},

        origin : {
          customer : {},
          county : {},
          state : {},
          location: '',
          legal : '',
        },

        destination : {
          customer : {},
          location: '',
          legal : '',
        },

        transferedBy : {},

        transferNote : ""

      };
      return newTrans;
    }
}]);
