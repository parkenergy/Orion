angular.module('WorkOrderApp.Directives')

.directive('workorderGeneralChecks', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/pm/woGeneralChecks.html',
    scope: true
  };
}]);
