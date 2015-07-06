angular.module('WorkOrderApp.Directives')

.directive('workorderLaborCodes', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/lc/workorderLaborCodes.html',
    scope: true
  };
}]);
