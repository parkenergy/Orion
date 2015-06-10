angular.module('WorkOrderApp.Directives')

.directive('workorderLaborCodes', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/lc/workorderLaborCodes.html',
    scope: true
  };
}]);
