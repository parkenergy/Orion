angular.module('WorkOrderApp.Directives')

.directive('workorderCompressorLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/workorder/views/edit/lc/woCompressorLC.html',
    scope: true
  };
}]);
