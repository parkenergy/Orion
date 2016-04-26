angular.module('InventoryTransferApp.Directives')

.directive('partsList', [function (){
  return{
    restrict: 'E',
    templateUrl: 'lib/public/angular/apps/inventorytransfer/views/edit/partslist.html',
    scope: true
  };
}]);
