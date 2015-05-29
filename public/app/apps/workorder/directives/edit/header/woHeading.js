angular.module('WorkOrderApp.Directives')

.directive('workorderHeading', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/header/woHeading.html',
    scope: true
  };
}]);
