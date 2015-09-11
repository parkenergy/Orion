angular.module('InventoryTransferApp.Directives')

.directive('partsList', [function(){
  return{
    restrict: 'E',
    templateUrl: '_common_packaged/public/angular/apps/inventorytransfer/views/edit/partslist.html',
    scope: true
  };
}]);
