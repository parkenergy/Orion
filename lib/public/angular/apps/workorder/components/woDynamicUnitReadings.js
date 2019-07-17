class woDynamicUnitReadings {
    constructor($sce, $scope, $timeout, ObjectService, Utils, CommonWOfunctions, AlertService) {
        this.AS = AlertService
        this.CWF = CommonWOfunctions
        this.sce = $sce
        this.scope = $scope
        this.timeout = $timeout
        this.OS = ObjectService
        this.utils = Utils
        this.spotCheck = false
        this.noSpotCheck = false
        this.lastCaliDate = null

        this.newEngine = false
        this.newCompressor = false

        this.rowsObj = {}

        this.engineModelChange = this.engineModelChange.bind(this)
        this.frameModelChange = this.frameModelChange.bind(this)
        this.renderINputLists = this.renderINputLists.bind(this)
        this.engineInputs = this.engineInputs.bind(this)
        this.handleInputs = this.handleInputs.bind(this)
        this.lastCal = this.lastCal.bind(this)
        this.spotChange = this.spotChange.bind(this)
        this.clearEngine = this.clearEngine.bind(this)
        this.clearFrame = this.clearFrame.bind(this)
    }

    $onInit() {
        if (this.workorder.emissionsReadings.lastCalibration) {
            this.lastCal(new Date(this.workorder.emissionsReadings.lastCalibration))
        }
        if (this.CWF.engineReplace(this.workorder)) {
            this.newEngine = true
        }
        if (this.CWF.frameReplace(this.workorder)) {
            this.newCompressor = true
        }
    }

    $doCheck() {
        if (this.newEngine !== this.state.laborCodeReplaceEngine) {
            if (!this.state.laborCodeReplaceEngine) {
                this.clearEngine()
            } else {
                this.AS.add('info', 'Please Add New Engine Serial #')
            }
            this.newEngine = this.state.laborCodeReplaceEngine
        }
        if (this.newCompressor !== this.state.laborCodeReplaceFrame) {
            if (!this.state.laborCodeReplaceFrame) {
                this.clearFrame()
            } else {
                this.AS.add('info', 'Please Add New Compressor Serial #')
            }
            this.newCompressor = this.state.laborCodeReplaceFrame
        }
    }

    clearEngine() {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.newEngineSerial = ''
            })
        })
    }

    clearFrame() {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.newCompressorSerial = ''
            })
        })
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

    renderHtml(code) {
        return this.sce.trustAsHtml(code)
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
                            this.renderINputLists(this.woUnitInputMatrixObject, this.workorder.unitReadings)
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
                            this.renderINputLists(this.woUnitInputMatrixObject, this.workorder.unitReadings)
                        }
                    })
                } else {
                    wo.unitReadings.displayFrameModel = ''
                    wo.unitReadings.engineModel = ''
                }
            })
        })
    }

    lastCal(value) {
        this.toCb((wo, displayUnit, unit) => {
            this.timeout(() => {
                wo.emissionsReadings.lastCalibration = value
                this.lastCaliDate = value
            })
        })
    }
    spotChange (value, text) {
        this.toCb((wo, displayUnit, unit) => {
            this.timeout(() => {
                switch (text) {
                    case 'spotCheck':
                        this.spotCheck = value
                        this.noSpotCheck = !value
                        if (value) {
                            wo.emissionsReadings.noSpotCheck = false
                            wo.emissionsReadings.spotCheck = true
                        } else {
                            wo.emissionsReadings.spotCheck = false
                            wo.emissionsReadings.NOxAllowable = ''
                            wo.emissionsReadings.COAllowable = ''
                            wo.emissionsReadings.NOxGrams = ''
                            wo.emissionsReadings.COGrams = ''
                            this.lastCaliDate = null
                            wo.emissionsReadings.lastCalibration = null
                        }
                        break;
                    case 'noSpotCheck':
                        this.spotCheck = !value
                        this.noSpotCheck = value
                        if (value) {
                            wo.emissionsReadings.spotCheck = false
                            wo.emissionsReadings.noSpotCheck = true
                            wo.emissionsReadings.NOxAllowable = ''
                            wo.emissionsReadings.COAllowable = ''
                            wo.emissionsReadings.NOxGrams = ''
                            wo.emissionsReadings.COGrams = ''
                            this.lastCaliDate = null
                            wo.emissionsReadings.lastCalibration = null
                        } else {
                            wo.emissionsReadings.noSpotCheck = false
                        }
                        break;
                    default:
                        break;
                }
            })
        })
    }
    getPMType(wo) {
        if (wo.pm) {
            return '1'
        } else if (wo.pm2) {
            return '2'
        } else if (wo.pm3) {
            return '3'
        } else if (wo.pm4) {
            return '4'
        } else if (wo.pm5) {
            return '5'
        } else {
            return '-'
        }
    }

    handleInputs(inputs, label, panel) {
        const obj = {}
        obj.label = label
        obj.panel = panel
        obj.inputs = []
        inputs.forEach((input) => {
            if (label === input.label) {
                obj.inputs.push(input)
            }
            input.disabled = this.disabled
        })

        return obj
    }

    sortInputs(a, b) {
        if (a.order < b.order) {
            return -1
        }
        if (a.order > b.order) {
            return 1
        }
        return 0
    }

    filterInputs(inputObjs, panel) {
        return inputObjs.reduce((acc, cur) => {
            if (cur.panel === panel) {
                return acc.concat(cur)
            } else {
                return acc
            }
        }, [])
    }
    engineInputs(inputMatrix, engineModel, frameModel) {
        let newInputs = []
        const pmType = this.getPMType(this.workorder)
        const pattern = new RegExp(pmType)
        const always = new RegExp('-')
        inputMatrix.forEach((input) => {
            if (!this.utils.isEmpty(input.enginesObj[engineModel])) {
                if (!this.utils.isEmpty(input.pmType.match(pattern)) || !this.utils.isEmpty(input.pmType.match(always))) {
                    newInputs.push(input)
                }
            } else if (!this.utils.isEmpty(input.pmType.match(always))) {
                newInputs.push(input)
            }
            if (!this.utils.isEmpty(input.framesObj[frameModel])){
                if (!this.utils.isEmpty(input.pmType.match(pattern)) || !this.utils.isEmpty(input.pmType.match(always))) {
                    newInputs.push(input)
                }
            } else if (!this.utils.isEmpty((input.pmType.match(always)))) {
                newInputs.push(input)
            }
        })
        // remove dups
        newInputs = this.utils.rmArrObjDups(newInputs, 'path')
        // sort based on order type
        newInputs = newInputs.sort(this.sortInputs)
        const tempArray = []
        return inputMatrix
            .sort(this.sortInputs)
            .reduce((acc, obj, i) => {
                if (tempArray.indexOf(obj.label) === -1) {
                    tempArray.push(obj.label)
                    const inputObject = this.handleInputs(newInputs, obj.label, obj.panel)

                    if (inputObject.inputs.length > 0) {
                        return acc.concat(inputObject)
                    } else {
                        return acc
                    }
                } else {
                    return acc
                }
            }, [])
    }

    isFound(input) {
        let show
        const frameModel = this.workorder.unitReadings.compressorModel
        if (frameModel && !this.utils.isEmpty(this.woInputMatrix)) {
            this.woInputMatrix.forEach((matrix) => {
                matrix.compressors.forEach((frame) => {
                    if (frame.netsuiteId === frameModel && matrix.name === input) {
                        show = true
                    }
                })
            })
        }
        const engineModel = this.workorder.unitReadings.engineModel
        if (engineModel && !this.utils.isEmpty(this.woInputMatrix)) {
            this.woInputMatrix.forEach((matrix) => {
                matrix.engines.forEach((engine) => {
                    if (engine.netsuiteId === engineModel && matrix.name === input) {
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
    renderINputLists(woUnitInputMatrixObject, unitReadings) {
        let inputObjects = this.engineInputs(woUnitInputMatrixObject, unitReadings.engineModel,
            unitReadings.compressorModel)
        this.rowsObj = {}
        inputObjects.forEach((inputObj) => {
            const panelName = inputObj.panel
            if (this.utils.isEmpty(this.rowsObj[panelName])) {
                this.rowsObj[panelName] = [inputObj]
            } else if (!this.utils.isEmpty(this.rowsObj[panelName])) {
                this.rowsObj[panelName].push(inputObj)
            }
        })

    }
    $onChanges(changeObj) {
        if (changeObj.woUnitInputMatrixObject !== undefined && !this.utils.isEmpty(changeObj.woUnitInputMatrixObject.currentValue) && this.utils.isEmpty(changeObj.woUnitInputMatrixObject.previousValue)) {
            this.renderINputLists(this.woUnitInputMatrixObject, this.workorder.unitReadings)
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woDynamicUnitReadings', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woDynamicUnitReadings.html',
        bindings:    {
            callBack:                '&',
            state:                   '<',
            workorder:               '<',
            woInputMatrix:           '<',
            woUnitInputMatrixObject: '<',
            frameModels:             '<',
            engineModels:            '<',
            disabled:                '<'
        },
        controller:  ['$sce', '$scope', '$timeout', 'ObjectService', 'Utils', 'CommonWOfunctions', 'AlertService',
            woDynamicUnitReadings]
    })

