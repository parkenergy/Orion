angular.module('CommonControllers').controller('MyAccountCtrl',
['$window', '$scope', 'users', 'units',
function ($window, $scope, users, units) {

  $scope.units = units;
  $scope.users = users;

}]);
