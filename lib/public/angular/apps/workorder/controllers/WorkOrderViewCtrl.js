function WorkOrderReviewCtrlFunc2($scope, $location, $timeout, $uibModal, $cookies, AlertService, ApiRequestService, GeneralPartSearchService, CommonWOfunctions, Utils, me, workorder) {
    const {debounce, isEmpty} = Utils
    const ARS = ApiRequestService
    $scope.locations = []
    $scope.woInputMatrixes = []
    $scope.frameModels = []
    $scope.engineModels = []
    $scope.assetTypes = []
    $scope.parts = []
    $scope.states = []
    $scope.counties = []
    $scope.applicationTypes = []
    $scope.customers = []
    $scope.users = []
    $scope.me = me
    $scope.workorder = workorder
    $scope.displayUnit = null
    $scope.headerUnit = null

    /**
     *
     * Generic cb method to be called in child components
     * Pass in the callback method and have the wo available
     * to edit and $timeout to execute changes.
     * @param cb
     * @returns {*}
     */
    $scope.runCb = (cb) => cb($scope.workorder, $scope.displayUnit, $scope.headerUnit)

}

angular
    .module('WorkOrderApp.Controllers')
    .controller('WorkOrderViewCtrl', ['$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'ApiRequestService', 'GeneralPartSearchService', 'CommonWOfunctions', 'Utils', 'me', 'workorder', WorkOrderReviewCtrlFunc2])
