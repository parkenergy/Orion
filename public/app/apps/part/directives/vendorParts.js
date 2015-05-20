angular.module('PartApp.Directives')

.directive('vendorParts', [function() {
  return {
    restrict: 'E',
    templateUrl: '/app/apps/part/views/vendorparts.html',
    scope: true,
    controller: 'PartsVendorPartsCtrl'
  };
}]);
