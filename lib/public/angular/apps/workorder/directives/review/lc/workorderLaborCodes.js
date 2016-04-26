angular.module('WorkOrderApp.Directives')

.directive('reviewLaborCodes', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/workorderLaborCodes.html',
    scope: true
  };
}]);
