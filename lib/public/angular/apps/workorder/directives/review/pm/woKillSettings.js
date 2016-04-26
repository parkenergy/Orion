angular.module('WorkOrderApp.Directives')

.directive('reviewKillSettings', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/pm/woKillSettings.html',
    scope: true
  };
}]);
