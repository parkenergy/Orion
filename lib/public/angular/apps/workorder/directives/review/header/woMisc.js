angular.module('WorkOrderApp.Directives')

.directive('reviewMisc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woMisc.html',
    scope: true
  };
}]);
