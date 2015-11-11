angular.module('WorkOrderApp.Directives')

.directive('reviewCompressorLc', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/review/lc/woCompressorLC.html',
    scope: true
  };
}]);
