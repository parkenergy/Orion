angular.module('WorkOrderApp.Directives')

.directive('workorderVesselLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/lc/woVesselLC.html',
    scope: true
  };
}]);
