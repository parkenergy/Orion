angular.module('TransferApp.Directives')

.directive('transferYard', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/transfer/views/transferYard.html',
    scope: true,
  };
}]);
