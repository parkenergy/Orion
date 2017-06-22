angular.module('CommonControllers').controller('AreaPMReportCtrl',
['$window', '$scope', 'users', 'units', 'areaName',
function ($window, $scope, users, units, areaName) {
  
  $scope.users = users;
  $scope.units = units;
  $scope.areaName = areaName;
  
}]);
