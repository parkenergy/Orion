angular.module('TransferApp.Directives')

.directive('transferNewset', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferNewset.html',
    scope: true,
  };
}]);
