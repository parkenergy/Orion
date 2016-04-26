angular.module('WorkOrderApp.Directives')

.directive('reviewEmissionsLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woEmissionsLC.html',
    scope: true
  };
}]);
