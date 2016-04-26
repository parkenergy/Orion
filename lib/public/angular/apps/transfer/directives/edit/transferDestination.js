angular.module('TransferApp.Directives')

.directive('transferDestination', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/transfer/views/edit/transferDestination.html',
    scope: true
  };
}]);
