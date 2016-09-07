angular.module('WorkOrderApp.Directives')

.directive('editDataHistory', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/edit/header/woDataHistory.html',
    scope: true
  };
}]);
