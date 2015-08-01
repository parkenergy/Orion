angular.module('TransferApp.Directives')

.directive('transferDestination', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/edit/transferDestination.html',
    scope: true
  };
}]);
