angular.module('InventoryTransferApp.Controllers').controller('InventoryTransferIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'inventoryTransfers',
  function ($scope, $route, $location, AlertService, LoaderService, inventoryTransfers){

    $scope.title = "Inventory Transfers";

    $scope.editInventoryTransfer = function (id){
      $location.path('/inventoryTransfer/edit/' + (id || ''));
    };

    $scope.createInventoryTransfer = function (){
      $scope.editInventoryTransfer();
    };

  }]);
