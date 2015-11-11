angular.module('WorkOrderApp.Directives')

.directive('reviewVesselLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woVesselLC.html',
    scope: true
  };
}]);
