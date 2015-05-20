angular.module('TransferApp.Directives')

.directive('transferCustomer', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/transfer/views/transferCustomer.html',
    scope: true,
  };
}]);
