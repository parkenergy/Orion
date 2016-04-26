angular.module('TransferApp.Directives')

.directive('transferDetails', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/transfer/views/edit/transferDetails.html',
    scope: true
  };
}]);
