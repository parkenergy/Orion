angular.module('TransferApp.Directives')

.directive('transferOrigin', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/transfer/views/edit/transferOrigin.html',
    scope: true
  };
}]);
