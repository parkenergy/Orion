angular.module('WorkOrderApp.Directives')

.directive('workorderPartsList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/parts/woPartsList.html',
    scope: true
  };
}]);
