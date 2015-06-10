angular.module('TransferApp.Controllers').controller('TransferIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'transfers', 'ArrayFilterService',
  function ($scope, $route, $location, AlertService, LoaderService, transfers, ArrayFilterService) {

    $scope.title = "Transfers";

    $scope.transfers = transfers;

    $scope.editTransfer = function (id) {
      $location.path("/transfer/edit/" + (id || ""));
    };

    $scope.createTransfer = function () {
      $scope.editTransfer();
    };

    $scope.sort = {
      column: ["status", "date", "number"],
      descending: [true],
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.searchTransfers = function (searchPhrase) {
      if(!searchPhrase || searchPhrase === ""){
        $scope.transfers = transfers;
      } else {
        ArrayFilterService.filter(transfers, searchPhrase, function (err, results) {
          $scope.transfers = results;
        });
      }
    };

}]);
