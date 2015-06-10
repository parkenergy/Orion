angular.module('WorkOrderApp.Directives')

.directive('workorderKillSettings', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/pm/woKillSettings.html',
    scope: true
  };
}]);
