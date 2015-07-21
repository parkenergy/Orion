angular.module('TransferApp.Directives')

.directive('transferCustomer', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferCustomer.html',
    scope: true,
  };
}]);
