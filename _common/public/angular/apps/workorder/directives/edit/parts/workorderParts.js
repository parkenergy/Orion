angular.module('WorkOrderApp.Directives')

.directive('workorderParts', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/parts/workorderParts.html',
    scope: true
  };
}]);
