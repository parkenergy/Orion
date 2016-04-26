angular.module('PartApp.Directives')

.directive('vendorParts', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/part/views/vendorparts.html',
    scope: true,
    controller: 'PartsVendorPartsCtrl'
  };
}]);
