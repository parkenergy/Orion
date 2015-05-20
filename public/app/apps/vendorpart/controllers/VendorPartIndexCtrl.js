angular.module('VendorPartApp.Controllers').controller('VendorPartIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'vendorparts',
  function ($scope, $route, $location, AlertService, LoaderService, vendorparts) {

    $scope.title = "Vendor Parts";

    $scope.vendorparts = vendorparts;

    $scope.editVendorPart = function (id) {
      $location.path("/vendorpart/edit/" + (id || ""));
    };

    $scope.createVendorPart = function () {
      $scope.editVendorPart();
    };

    $scope.sort = {
      column: "name",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

}]);
