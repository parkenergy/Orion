angular.module('InventoryTransferApp.Directives')

.directive('inventoryTransferDetails', [ function(){
  return{
    restrict: 'E',
    templateUrl: 'lib/public/angular/apps/inventorytransfer/views/edit/inventorytransferDetails.html',
    scope: true
  };
}]);
