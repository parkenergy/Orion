angular.module('InventoryTransferApp.Directives')

.directive('inventoryTransferDetails', [ function(){
  return{
    restrict: 'E',
    templateUrl: '_common_packaged/public/angular/apps/inventorytransfer/views/edit/inventorytransferDetails.html',
    scope: true
  };
}]);
