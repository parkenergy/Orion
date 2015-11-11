angular.module('WorkOrderApp.Directives')

.directive('reviewPartsList', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/parts/woPartsList.html',
    scope: true
  };
}]);
