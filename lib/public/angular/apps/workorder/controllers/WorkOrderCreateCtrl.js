function WorkOrderCreateCtrlFunc ($window, $q, $scope, $location, $timeout, $uibModal, $cookies, AlertService, TimeDisplayService, ApiRequestService, GeneralPartSearchService, ObjectService, CommonWOfunctions, me) {

    // set variables on scope to be passed down
    const ARS = ApiRequestService
    $scope.pad = TimeDisplayService.pad
    $scope.locations = []
    $scope.woInputMatrix = []
    $scope.frameModels = []
    $scope.engineModels = []
    $scope.assetTypes = []
    $scope.parts = []
    $scope.states = []
    $scope.counties = []
    $scope.applicationTypes = []
    $scope.woPMChecks = []
    $scope.customers = []
    $scope.users = []
    $scope.me = me
    $scope.workorder = CommonWOfunctions.defaultWO()
    $scope.loading = true
    $scope.displayUnit = null
    $scope.headerUnit = null
    console.log($scope.workorder)
    /**
     *
     * Generic cb method to be called in child components
     * Pass in the callback method and have the wo available
     * to edit and $timeout to execute changes.
     * @param cb
     * @returns {*}
     */
    $scope.runCb = (cb) => cb($scope.workorder, $scope.displayUnit, $scope.headerUnit)

    /**
     * load variables asynchronously then stop loading symbol
     */
    ARS.http.get.locations({size: 1000, page: 0})
       .then((res) => {
           $scope.locations = res.data
       }, (err) => {
           console.error(err)
       })
    ARS.WoUnitInputMatrixes({})
       .then((res) => {
           $scope.woInputMatrix = res
           return ARS.FrameModels({})
       })
       .then((res) => {
           $scope.frameModels = res
           return ARS.EngineModels({})
       })
       .then((res) => {
           $scope.engineModels = res
           return ARS.AssetTypes({})
       })
       .then((res) => {
           $scope.assetTypes = res
           return ARS.Parts({})
       })
       .then((res) => {
           $scope.parts = res
           return ARS.States({})
       })
       .then((res) => {
           $scope.states = res
           return ARS.Counties({})
       })
       .then((res) => {
           $scope.counties = res
           return ARS.ApplicationTypes({})
       })
       .then((res) => {
           $scope.applicationTypes = res
           return ARS.WOPMCheck({})
       })
       .then((res) => {
           $scope.woPMChecks = res
           return ARS.Customers({})
       })
       .then((res) => {
           $scope.customers = res
           return ARS.Users({})
       })
       .then((res) => {
           $scope.users = res
           $scope.loading = false
       })
       .catch(console.error)
    /**
     * Get elapsed time only if time Submitted exists and
     * time Started exists
     */
    $scope.callGetTime = () => {
        if (($scope.workorder.timeSubmitted !== null || $scope.workorder.timeSubmitted !==
            undefined) &&
            ($scope.workorder.timeStarted !== null || $scope.workorder.timeStarted !== undefined)) {
            $scope.getTimeElapsed()
        }
    }
    /**
     * Used in selectStartEndDate Component
     * @param input
     */
    $scope.setWOTimeStarted = (input) => {
        $scope.workorder.timeStarted = input
        $scope.callGetTime()
    }
    /**
     * Used in selectStartEndDate Component
     * @param input
     */
    $scope.setWOTimeSubmitted = (input) => {
        $scope.workorder.timeSubmitted = input
        $scope.callGetTime()
    }
    /**
     * Used in selectStartEndDate Component
     */
    $scope.getTimeElapsed = () => {
        const start = new Date($scope.workorder.timeStarted)
        const now = $scope.workorder.timeSubmitted ?
            new Date($scope.workorder.timeSubmitted) :
            new Date()
        // e short for elapsed
        $scope.eMilli = (now.getTime() - start.getTime()).toFixed()
        $scope.eSeconds = Math.floor((($scope.eMilli / 1000) % 60))
        $scope.eMinutes = Math.floor((($scope.eMilli / (6e4) % 60)))
        $scope.eHours = Math.floor((($scope.eMilli / (36e5))))
        // $scope.getTotalLaborTime()
        // $scope.getUnaccountedTime()
    }
}

angular
    .module('WorkOrderApp.Controllers')
    .controller('WorkOrderCreateCtrl', ['$window', '$q', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'TimeDisplayService', 'ApiRequestService', 'GeneralPartSearchService', 'ObjectService', 'CommonWOfunctions', 'me', WorkOrderCreateCtrlFunc])
