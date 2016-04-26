angular.module('WorkOrderApp.Directives')

.directive('workorderBasicLc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/lc/woBasicLC.html',
    scope: true
  };
}]);
