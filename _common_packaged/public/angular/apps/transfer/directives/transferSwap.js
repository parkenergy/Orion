angular.module('TransferApp.Directives')

.directive('transferSwap', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferSwap.html',
    scope: true,
  };
}]);
