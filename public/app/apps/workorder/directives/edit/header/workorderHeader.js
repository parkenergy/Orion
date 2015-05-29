angular.module('WorkOrderApp.Directives')

.directive('workorderHeader', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/header/workorderheader.html',
    scope: true
  };
}]);
