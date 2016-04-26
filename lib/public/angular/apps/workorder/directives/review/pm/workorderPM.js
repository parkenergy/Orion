angular.module('WorkOrderApp.Directives')

.directive('reviewPm', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woPM.html',
    scope: true
  };
}]);
