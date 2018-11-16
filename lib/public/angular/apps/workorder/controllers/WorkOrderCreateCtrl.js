function WorkOrderCreateCtrlFunc ($window, $q, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, ApiRequestService, GeneralPartSearchService, ObjectService, CommonWOfunctions, assettypes, me, parts, states, counties, applicationtypes, DateService, locations, woInputMatrixes, frameModels, engineModels, woSOPChecks, customers, users) {

    // set variables on scope to be passed down
    $scope.locations = locations
    $scope.woInputMatrix = woInputMatrixes
    $scope.frameModels = frameModels
    $scope.engineModels = engineModels
    $scope.assetTypes = assettypes
    $scope.parts = parts
    $scope.states = states
    $scope.counties = counties
    $scope.applicationTypes = applicationtypes
    $scope.woSOPChecks = woSOPChecks
    $scope.customers = customers
    $scope.users = users

    $scope.workorder = CommonWOfunctions.defaultWO()

}

angular
    .module('WorkOrderApp.Controllers')
    .controller('WorkOrderCreateCtrl', ['$window', '$q', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'ApiRequestService', 'GeneralPartSearchService', 'ObjectService', 'CommonWOfunctions', 'assettypes', 'me', 'parts', 'states', 'counties', 'applicationtypes', 'DateService', 'locations', 'woInputMatrixes', 'frameModels', 'engineModels', 'woSOPChecks', 'customers', 'users', WorkOrderCreateCtrlFunc])
