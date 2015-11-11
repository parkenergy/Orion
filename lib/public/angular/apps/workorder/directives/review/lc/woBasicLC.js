angular.module('WorkOrderApp.Directives')

.directive('BasicLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woBasicLC.html',
    scope: true
  };
}]);
