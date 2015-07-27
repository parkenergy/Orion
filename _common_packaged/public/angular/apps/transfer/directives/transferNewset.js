angular.module('TransferApp.Directives')

.directive('transferNewset', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferNewset.html',
    scope: true,
  };
}]);
