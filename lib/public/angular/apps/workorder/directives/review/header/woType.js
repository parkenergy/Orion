angular.module('WorkOrderApp.Directives')

.directive('reviewType', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/header/woType.html',
    scope: true
  };
}]);
