angular.module('UnitApp.Controllers').controller('UnitViewCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'unit', 'Users',
  function ($scope, $route, $location, AlertService, LoaderService, unit, Users) {

  $scope.unit = unit;
  $scope.title = unit.number;

  $scope.user = {};
  $scope.supervisor = {};

  //fetch user info for PM Report
  Users.get({id: unit.pmReport.userId})
    .then(function (user) {
      $scope.user = user;

      return Users.get({id: user.supervisor});
    })
    .then(function (supervisor) {
      $scope.supervisor = supervisor;
    })
    .catch(err => AlertService.add('danger', "Could not populate user data for PM Report"));

}]);
