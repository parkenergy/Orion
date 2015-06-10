angular.module('TransferApp.Directives')

.directive('transferYard', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferYard.html',
    scope: true,
  };
}]);
