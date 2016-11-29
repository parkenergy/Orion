/**
 *            PartOrderReviewCtrl
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers')
.controller('PartOrderReviewCtrl',
  ['$scope', '$location', 'partorder', 'locations',
function ($scope, $location, $timeout, partorder, locations) {

  // Variables -------------------------------------
  $scope.locations = locations;
  $scope.partorder = partorder;
  // -----------------------------------------------
}]);
