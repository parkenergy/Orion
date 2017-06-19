angular.module('CommonControllers').controller('AreaPMReportCtrl',
['$window', '$scope', 'users',
function ($window, $scope, users) {
  $scope.users = users;
}]);
