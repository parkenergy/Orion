angular.module('TransferApp.Controllers').controller('TransferIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'transfers',
  function ($scope, $route, $location, AlertService, LoaderService, transfers) {

    $scope.title = "Transfers";

    //$scope.transfers = transfers;

    $scope.editTransfer = function (id) {
      $location.path("/transfer/edit/" + (id || ""));
    };

    $scope.createTransfer = function () {
      $scope.editTransfer();
    };

}]);
