angular.module('WorkOrderApp.Directives')

.directive('workorderVesselLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/lc/woVesselLC.html',
    scope: true
  };
}]);
