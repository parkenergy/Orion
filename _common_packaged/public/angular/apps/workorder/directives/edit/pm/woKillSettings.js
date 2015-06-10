angular.module('WorkOrderApp.Directives')

.directive('workorderKillSettings', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/pm/woKillSettings.html',
    scope: true
  };
}]);
