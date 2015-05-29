angular.module('WorkOrderApp.Directives')

.directive('workorderType', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/header/woType.html',
    scope: true
  };
}]);
