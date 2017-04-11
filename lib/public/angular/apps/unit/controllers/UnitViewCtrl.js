angular.module('UnitApp.Controllers').controller('UnitViewCtrl',
  ['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'ApiRequestService', 'unit',
function ($scope, $route, $location, AlertService, LoaderService, ApiRequestService, unit) {
  
  // Variables ------------------------------------------
  const ARS = ApiRequestService;
  $scope.unit = unit;
  $scope.title = unit.number;
  $scope.user = {};
  $scope.supervisor = {};
  // ----------------------------------------------------
  
  //fetch user info for PM Report
  if(unit.assignedTo) {
    ARS.getUser({id: unit.assignedTo})
      .then((user) => {
        $scope.user = user;
        return ARS.getUser({ id: user.supervisor });
      })
      .then((supervisor) => {
        $scope.supervisor = supervisor;
      })
      .catch((err) => {
        AlertService.add('danger',"Could not populate user data for PM Report");
        console.log(err);
      })
  }
}]);
