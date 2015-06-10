angular.module('TransferApp.Directives')

.directive('transferSwap', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferSwap.html',
    scope: true,
  };
}]);
