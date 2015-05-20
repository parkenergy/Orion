angular.module('TransferApp.Directives')

.directive('transferSwap', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferSwap.html',
    scope: true,
  };
}]);
