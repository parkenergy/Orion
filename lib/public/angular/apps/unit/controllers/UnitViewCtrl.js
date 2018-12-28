function UnitViewCtrl ($window, $scope, $route, $location, AlertService, SessionService, ApiRequestService, unit, states, counties) {

    // Variables ------------------------------------------
    const ARS = ApiRequestService
    const SS = SessionService
    $scope.unit = unit
    $scope.states = states
    $scope.counties = counties
    $scope.title = unit.number
    $scope.user = {}
    $scope.supervisor = {}
    // ----------------------------------------------------

    // Populate state and County --------------------------
    if (unit.state) {
        $scope.states.forEach((state) => {
            if (state._id === unit.state) {
                unit.state = state
            }
        })
    }
    if (unit.county) {
        $scope.counties.forEach((county) => {
            if (county._id === unit.county) {
                unit.county = county
            }
        })
    }
    // ----------------------------------------------------

    //fetch user info for PM Report -----------------------
    if (unit.assignedTo) {
        ARS.getUser({id: unit.assignedTo})
           .then((user) => {
               $scope.user = user
               return ARS.getUser({id: user.supervisor})
           })
           .then((supervisor) => {
               $scope.supervisor = supervisor
           })
           .catch((err) => {
               AlertService.add('danger', 'Could not populate user data for PM Report')
               console.log(err)
           })
    }
    // ----------------------------------------------------

    // Routes ---------------------------------------------
    $scope.searchUnits = () => {
        SS.add('unitNumber', $scope.unit.number)
        $window.open(`#/workorder`)
    }
    // ----------------------------------------------------
}

angular.module('UnitApp.Controllers')
       .controller('UnitViewCtrl',
           ['$window', '$scope', '$route', '$location', 'AlertService', 'SessionService', 'ApiRequestService', 'unit', 'states', 'counties', UnitViewCtrl])
