angular.module('TransferApp.Controllers').controller('TransferIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'transfers',
  function ($scope, $route, $location, AlertService, transfers) {

    $scope.title = "Transfers";

    $scope.editTransfer = function (id) {
      $location.path("/transfer/edit/" + (id || ""));
    };

    $scope.createTransfer = function () {
      $scope.editTransfer();
    };

}]);
