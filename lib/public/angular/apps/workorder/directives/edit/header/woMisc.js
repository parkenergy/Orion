angular.module('WorkOrderApp.Directives')

.directive('workorderMisc', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woMisc.html',
    scope: true
  };
}]);
