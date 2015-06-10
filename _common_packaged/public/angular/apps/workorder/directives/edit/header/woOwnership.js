angular.module('WorkOrderApp.Directives')

.directive('workorderOwnership', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/header/woOwnership.html',
    scope: true
  };
}]);
