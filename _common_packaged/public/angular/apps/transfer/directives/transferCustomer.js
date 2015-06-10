angular.module('TransferApp.Directives')

.directive('transferCustomer', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferCustomer.html',
    scope: true,
  };
}]);
