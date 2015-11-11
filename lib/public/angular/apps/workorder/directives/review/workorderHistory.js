angular.module('WorkOrderApp.Directives')

.directive('reviewHistory', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/woHistory.html',
    scope: true
  };
}]);
