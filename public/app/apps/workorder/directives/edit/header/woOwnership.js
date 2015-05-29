angular.module('WorkOrderApp.Directives')

.directive('workorderOwnership', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/header/woOwnership.html',
    scope: true
  };
}]);
