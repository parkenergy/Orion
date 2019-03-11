function WorkOrderCreateCtrlFunc ($window, $q, $scope, $location, $timeout, $uibModal, $cookies, AlertService, ApiRequestService, GeneralPartSearchService, ObjectService, CommonWOfunctions, Utils, me) {


    const {debounce} = Utils
    // set variables on scope to be passed down
    const ARS = ApiRequestService
    $scope.locations = []
    $scope.woInputMatrix = []
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
           $scope.setParstModel($scope.parts)
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
     * Used in selectStartEndDate Component
     * @param input
     */
    $scope.setWOTimeStarted = (input) => {
        $scope.workorder.timeStarted = input
    }
    /**
     * Used in selectStartEndDate Component
     * @param input
     */
    $scope.setWOTimeSubmitted = (input) => {
        $scope.workorder.timeSubmitted = input
    }

    $scope.removePart = (part) => {
        const index = $scope.workorder.parts.indexOf(part)
        $scope.workorder.parts.splice(index, 1)
    }

    $scope.setParstModel = (parts) => {
        $scope.partsTableModel = GeneralPartSearchService.partTableModel(parts, 'wo', $scope.workorder)
    }

    $scope.setParstModel($scope.parts)
    /**
     * submit admin work order to back end Orion
     * back end save to mongodb
     * then sync to netsuite
     * then save the netsuite Id to the workorder
     */
    $scope.submit = () => {
        const now = new Date()
        $scope.workorder.approvedBy =  $scope.me.username
        $scope.workorder.syncedBy = $scope.me.username
        $scope.workorder.timeApproved = now
        $scope.workorder.timeSynced = now
        $scope.workorder.managerApproved = true
        $scope.netsuiteSyned = true
        ARS.http.post.AdminWorkorder($scope.workorder)
            .then((res) => {
                console.log('this is the response')
                console.log(res)
            }, (err) => {
                console.log('this is the error')
                console.error(err)
            })
    }
    $scope.debounceSubmit = debounce($scope.submit, 10000, true)

}

angular
    .module('WorkOrderApp.Controllers')
    .controller('WorkOrderCreateCtrl', ['$window', '$q', '$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'ApiRequestService', 'GeneralPartSearchService', 'ObjectService', 'CommonWOfunctions', 'Utils', 'me', WorkOrderCreateCtrlFunc])
