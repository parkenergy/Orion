angular.module('WorkOrderApp.Directives')

.directive('workorderCompressorLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/workorder/views/edit/lc/woCompressorLC.html',
    scope: true
  };
}]);
