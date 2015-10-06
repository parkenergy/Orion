angular.module('WorkOrderApp.Directives')

.directive('workorderPartsList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/parts/woPartsList.html',
    scope: true
  };
}]);
