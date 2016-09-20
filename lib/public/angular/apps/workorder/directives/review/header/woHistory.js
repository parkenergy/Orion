angular.module('WorkOrderApp.Directives')

.directive('reviewDataHistory', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woDataHistory.html',
    scope: true
  };
}]);
