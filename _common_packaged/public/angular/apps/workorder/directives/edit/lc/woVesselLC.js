angular.module('WorkOrderApp.Directives')

.directive('workorderVesselLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/workorder/views/edit/lc/woVesselLC.html',
    scope: true
  };
}]);
