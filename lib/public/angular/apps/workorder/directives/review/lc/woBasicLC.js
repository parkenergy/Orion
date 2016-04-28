angular.module('WorkOrderApp.Directives')

.directive('reviewBasicLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woBasicLC.html',
    scope: true
  };
}]);
