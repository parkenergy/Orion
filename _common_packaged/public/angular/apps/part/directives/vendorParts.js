angular.module('PartApp.Directives')

.directive('vendorParts', [function() {
  return {
    restrict: 'E',
    templateUrl: '/_common_packaged/public/angular/apps/part/views/vendorparts.html',
    scope: true,
    controller: 'PartsVendorPartsCtrl'
  };
}]);
