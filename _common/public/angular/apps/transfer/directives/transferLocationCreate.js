angular.module('TransferApp.Directives')

.directive('transferLocationCreate', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferLocationCreate.html',
    scope: true,
  };
}]);
