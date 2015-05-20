angular.module('TransferApp.Directives')

.directive('transferNewset', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferNewset.html',
    scope: true,
  };
}]);
