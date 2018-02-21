angular.module('PartOrderApp.Controllers')
.controller('PartOrderReviewCtrl',
  ['$scope', 'partorder', 'locations', 'DateService',
function ($scope, partorder, locations, DateService) {

  // Variables -------------------------------------
  const DS = DateService;
  $scope.locations = locations;
  $scope.partorder = partorder;
  // -----------------------------------------------

  // init
  if ($scope.partorder.timeCreated) {
    $scope.partorder.timeCreated = DS.displayLocal(new Date($scope.partorder.timeCreated));
  }
  if ($scope.partorder.timeSubmitted) {
    $scope.partorder.timeSubmitted = DS.displayLocal(new Date($scope.partorder.timeSubmitted));
  }
  if ($scope.partorder.timeShipped) {
    $scope.partorder.timeShipped = DS.displayLocal(new Date($scope.partorder.timeShipped));
  }
  if ($scope.partorder.timeComplete) {
    $scope.partorder.timeComplete = DS.displayLocal(new Date($scope.partorder.timeComplete));
  }
}]);
