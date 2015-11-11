angular.module('WorkOrderApp.Directives')

.directive('reviewGeneralChecks', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woGeneralChecks.html',
    scope: true
  };
}]);
