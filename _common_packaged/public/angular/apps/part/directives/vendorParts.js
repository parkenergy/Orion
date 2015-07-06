angular.module('PartApp.Directives')

.directive('vendorParts', [function() {
  return {
    restrict: 'E',
    templateUrl: '/Common/public/angular/apps/part/views/vendorparts.html',
    scope: true,
    controller: 'PartsVendorPartsCtrl'
  };
}]);
