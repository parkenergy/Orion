angular.module('TransferApp.Directives')

.directive('transferSimple', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/transfer/views/transferSimple.html',
    scope: true,
  };
}]);
