angular.module('PartOrderApp.Controllers')
.controller('PartOrderReviewCtrl',
  ['$scope', 'partorder', 'locations',
function ($scope, partorder, locations) {

  // Variables -------------------------------------
  $scope.locations = locations;
  $scope.partorder = partorder;
  // -----------------------------------------------
}]);
