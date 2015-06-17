angular.module('TransferApp.Directives')

.directive('transferLocationCreate', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferLocationCreate.html',
    scope: true,
  };
}]);
