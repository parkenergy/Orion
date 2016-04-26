angular.module('TransferApp.Directives')

.directive('transferComments', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/transfer/views/edit/transferComments.html',
    scope: true
  };
}]);
