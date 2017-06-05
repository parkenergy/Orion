angular.module('UnitApp.Controllers').controller('UnitViewCtrl',
  ['$window', '$scope', '$route', '$location', 'AlertService', 'SessionService', 'ApiRequestService', 'unit',
function ($window, $scope, $route, $location, AlertService, SessionService, ApiRequestService, unit) {
  
  // Variables ------------------------------------------
  const ARS = ApiRequestService;
  const SS = SessionService;
  $scope.unit = unit;
  $scope.title = unit.number;
  $scope.user = {};
  $scope.supervisor = {};
  // ----------------------------------------------------
  
  //fetch user info for PM Report -----------------------
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
  // ----------------------------------------------------
  
  // Routes ---------------------------------------------
  $scope.searchUnits = () => {
    SS.add("unitNumber",$scope.unit.number);
    $window.open(`#/myaccount`);
  }
  // ----------------------------------------------------
}]);
