function WorkOrderViewCtrl($scope, $location, $timeout, $uibModal, $cookies, AlertService, ApiRequestService, GeneralPartSearchService, CommonWOfunctions, Utils, me, workorder) {
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
    $scope.disabled = true

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

    $scope.edit = () => {
        $scope.disabled = !$scope.disabled
    }

    // set display unit
    const setDisplayUnit = (number) => {
        ARS.Units({regexN: number})
           .then((units) => {
               if (units.length === 1) {
                   $timeout(() => {
                       $scope.headerUnit = units[0]
                       $scope.displayUnit = units[0]
                   })
               }
           })
           .catch((err) => console.log(err))
    }
    if ($scope.workorder.unitNumber) {
        setDisplayUnit($scope.workorder.unitNumber)
    }

    ARS.http.get.locations({size: 1000, page: 0})
        .then((res) => {
            $scope.locations = res.data
        }, (err) => {
            console.log(err)
        })
    ARS.WoUnitInputMatrixes({})
        .then((res) => {
            $scope.woInputMatrixes = res
            $scope.woUnitInputMatrixObject = $scope.woInputMatrixes.reduce((acc, cur) => {
                cur.enginesObj = {}
                cur.framesObj = {}
                cur.engines.forEach((engine) => {
                    cur.enginesObj[engine.netsuiteId] = engine
                })
                cur.compressors.forEach((compressor) => {
                    cur.framesObj[compressor.netsuiteId] = compressor
                })
                return acc.concat(cur)
            }, [])
        })
       .catch(console.error)
    ARS.FrameModels({})
        .then((res) => {
            $scope.frameModels = res
            $scope.frameModelsObj = $scope.frameModels.reduce((acc, cur) => {
                acc[cur.netsuiteId] = cur
                return acc
            }, {})
        }).catch(console.error)
    ARS.EngineModels({})
        .then((res) => {
            $scope.engineModels = res
            $scope.engineModelsObj = $scope.engineModels.reduce((acc, cur) => {
                acc[cur.netsuiteId] = cur
                return acc
            }, {})
        }).catch(console.error)
    ARS.AssetTypes({})
        .then((res) => {
            $scope.assetTypes = res
        }).catch(console.error)
    ARS.Parts({})
       .then((res) => {
           $scope.parts = res
           // $scope.setParstModel($scope.parts)

       }).catch(console.error)
    ARS.States({})
       .then((res) => {
           $scope.states = res
       }).catch(console.error)
    ARS.Counties({})
       .then((res) => {
           $scope.counties = res
       }).catch(console.error)
    ARS.ApplicationTypes({})
       .then((res) => {
           $scope.applicationTypes = res
       }).catch(console.error)
    ARS.Customers({})
       .then((res) => {
           $scope.customers = res
       }).catch(console.error)
    ARS.Users({})
       .then((res) => {
           $scope.users = res
       }).catch(console.error)

    // $scope.debounceSubmit = debounce($scope.submit, 10000, true)
}

angular
    .module('WorkOrderApp.Controllers')
    .controller('WorkOrderViewCtrl', ['$scope', '$location', '$timeout', '$uibModal', '$cookies', 'AlertService', 'ApiRequestService', 'GeneralPartSearchService', 'CommonWOfunctions', 'Utils', 'me', 'workorder', WorkOrderViewCtrl])
