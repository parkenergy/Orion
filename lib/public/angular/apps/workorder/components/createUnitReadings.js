class createUnitReadings {
    constructor ($scope, $timeout, ObjectService, Utils) {
        this.scope = $scope
        this.timeout = $timeout
        this.OS = ObjectService
        this.utils = Utils

        this.tripleInputStyling = {
            'display': 'inline-block',
            'width':   '32%',
        }
        this.inputStyling = {
            'display': 'inline-block',
            'width':   '49%',
        }

        this.engineModelChange = this.engineModelChange.bind(this)
        this.frameModelChange = this.frameModelChange.bind(this)
        this.isFound = this.isFound.bind(this)
    }
    /**to
     * Static method with generic return method
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

    /**
     * Used to change data on the work order
     * @param changedData
     * @param selected
     */
    changeThisField (changedData, selected) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (selected === 'unitReadings.engineSerial' || selected === 'unitReadings.compressorSerial' || selected === 'newEngineSerial' || selected === 'newCompressorSerial') {
                    this.OS.updateNestedObjectValue(wo, changedData.toUpperCase(), selected)
                } else {
                    this.OS.updateNestedObjectValue(wo, changedData, selected)
                }
            })
        })
    }
    engineModelChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(input) && !this.utils.isEmpty(this.engineModels)) {
                    this.engineModels.forEach((engine) => {
                        if (engine.model === input) {
                            wo.unitReadings.displayEngineModel = engine.model
                            wo.unitReadings.engineModel = engine.netsuiteId
                        }
                    })
                } else {
                    wo.unitReadings.displayEngineModel = ''
                    wo.unitReadings.engineModel = ''
                }
            })
        })
    }
    frameModelChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(input) && !this.utils.isEmpty(this.frameModels)) {
                    this.frameModels.forEach((frame) => {
                        if (frame.model === input) {
                            wo.unitReadings.displayFrameModel = frame.model
                            wo.unitReadings.compressorModel = frame.netsuiteId
                        }
                    })
                } else {
                    wo.unitReadings.displayFrameModel = ''
                    wo.unitReadings.engineModel = ''
                }
            })
        })
    }
    isFound(input) {
        let show
        const frameModel = this.workorder.unitReadings.compressorModel
        if (frameModel && !this.utils.isEmpty(this.woInputMatrix)) {
            this.woInputMatrix.forEach((matrix) => {
                matrix.compressors.forEach((frame) => {
                    if (frame.netsuiteId === frameModel) {
                        show = true
                    }
                })
            })
        }
        const engineModel = this.workorder.unitReadings.engineModel
        if (engineModel && !this.utils.isEmpty(this.woInputMatrix)) {
            this.woInputMatrix.forEach((matrix) => {
                matrix.engines.forEach((engine) => {
                    if (engine.netsuiteId === engineModel) {
                        show = true
                    }
                })
            })
        }
        if (!engineModel && !frameModel) {
            show = false
        }
        return show
    }

    spotChange (value, text) {
        this.toCb((wo, displayUnit, unit) => {
           this.timeout(() => {
               switch (text) {
                   case 'checked':
                       wo.unitReadings.noSpotCheck = false
                       if (!value) {
                           wo.unitReadings.NOxAllowable = ''
                           wo.unitReadings.COAllowable = ''
                           wo.unitReadings.NOxGrams = ''
                           wo.unitReadings.COGrams = ''
                           wo.unitReadings.lastCalibration = null
                       }
                       break;
                   case 'not_checked':
                       wo.unitReadings.spotCheck = false
                       wo.unitReadings.NOxAllowable = ''
                       wo.unitReadings.COAllowable = ''
                       wo.unitReadings.NOxGrams = ''
                       wo.unitReadings.COGrams = ''
                       wo.unitReadings.lastCalibration = null
                       break;
                   default:
                       break;
               }
           })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createUnitReadings', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/unitReadings.html',
        bindings: {
            callBack:   '&',
            workorder:  '<',
            woInputMatrix: '<',
            frameModels: '<',
            engineModels: '<',
        },
        controller: ['$scope', '$timeout', 'ObjectService', 'Utils', createUnitReadings]
    })
