angular.module('WorkOrderApp.Directives')

.directive('workorderMisc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/header/woMisc.html',
    scope: true
  };
}]);
