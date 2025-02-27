class woChangeInfo {
    constructor ($scope, $timeout, ApiRequestService, Utils) {
        this.ARS = ApiRequestService
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils

        this.countiesArray = []
        this.unitLocationArray = []
        this.unitNumberArray = []
        this.yards = []
        this.swapUnitNumberChange = this.swapUnitNumberChange.bind(this)
        this.countyNameChange = this.countyNameChange.bind(this)
        this.leaseChange = this.leaseChange.bind(this)
    }

    $onChanges(changeObj) {
        if (changeObj.locations !== undefined && !this.utils.isEmpty(changeObj.locations.currentValue) && this.utils.isEmpty(changeObj.locations.previousValue)) {
            this.timeout(() => {
                changeObj.locations.currentValue.forEach((location) => {
                    if (location.name.indexOf(':') === -1) {
                        this.yards.push(location)
                    }
                })

            })
        }
    }

    /**
     * Static method with generic return method to
     * be used to solve issues
     * @param cb
     * @returns {function(*=): *}
     */
    dynamicCB (cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    /**
     * This method is used to send the object with cb
     * to the parent controller. The base method needs
     * to be static but the inards need to be dynamic
     * @param cb - where the cb needs to execute on (wo, du, he) -> (workorder, display unit,
     *   header unit)
     */
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    getAssetTypeNSID(ps) {
        let NSID = null
        this.assetTypes.forEach((asset) => {
            if (asset.type === ps) {
                NSID = asset.netsuiteId
            }
        })
        return NSID
    }

    countyNameChange(input) {
        this.timeout(() => {
            this.ARS.Counties({regexN: input, limit: 12})
                .then((counties) => {
                    this.countiesArray = counties
                })
                .catch(console.error)
        })
    }
    leaseChange(input) {
        this.timeout(() => {
            this.ARS.Units({regexL: input})
                .then((units) => {
                    this.unitLocationArray = units
                })
                .catch(console.error)
        })
    }
    swapUnitNumberChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.ARS.Units({regexN: input})
                    .then((units) => {
                        this.unitNumberArray = units
                        units.forEach((unit) => {
                            if (unit.number.toUpperCase() === input.toUpperCase()) {
                                state.swapUnitChange = true
                                const header = wo.header
                                wo.header = null
                                const thisUnit = unit
                                let engineObj
                                if (thisUnit.engineModel) {
                                    this.engineModels.forEach((engine) => {
                                        if (engine.netsuiteId === thisUnit.engineModel) {
                                            engineObj = engine
                                        }
                                    })
                                }
                                let frameObj
                                if (thisUnit.frameModel) {
                                    this.frameModels.forEach((frame) => {
                                        if (frame.netsuiteId === thisUnit.frameModel) {
                                            frameObj = frame
                                        }
                                    })
                                }
                                wo.header = header
                                wo.unitNumber = thisUnit.number
                                wo.assetType = this.getAssetTypeNSID(thisUnit.productSeries)
                                du = thisUnit
                                wo.unitReadings.engineSerial = thisUnit.engineSerial
                                wo.unitReadings.compressorSerial = thisUnit.compressorSerial
                                wo.unitChangeInfo.swapUnitNumber = thisUnit.number
                                wo.unitChangeInfo.swapUnitNSID = thisUnit.netsuiteId
                                wo.unitReadings.displayEngineModel = engineObj !== undefined ? engineObj.model : ''
                                wo.unitReadings.displayFrameModel = frameObj !== undefined ? frameObj.model : ''
                                wo.unitReadings.engineModel = engineObj !== undefined ? engineObj.netsuiteId : ''
                                wo.unitReadings.compressorModel = frameObj !== undefined ? frameObj.netsuiteId : ''
                                wo.unitSnapShot = thisUnit
                                this.unitNumberArray = []
                            }
                        })
                    })
                    .catch(console.error)
            })
        })
    }
}

angular
.module('WorkOrderApp.Components')
.component('woChangeInfo', {
    templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woChangeInfo.html',
    bindings: {
        callBack:     '&',
        workorder:    '<',
        engineModels: '<',
        frameModels:  '<',
        assetTypes:   '<',
        locations:    '<',
        states:       '<',
        counties:     '<',
        disabled:     '<',
    },
    controller: ['$scope', '$timeout', 'ApiRequestService', 'Utils', woChangeInfo],
})
