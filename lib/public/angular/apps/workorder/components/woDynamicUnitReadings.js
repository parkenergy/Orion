class woDynamicUnitReadings {
    constructor ($sce, $scope, $timeout, ObjectService, Utils) {
        this.sce = $sce
        this.scope = $scope
        this.timeout = $timeout
        this.OS = ObjectService
        this.utils = Utils

        this.inputs = ''
        this.trippleInputStyling = {
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
        this.renderINputLists = this.renderINputLists.bind(this)
        this.engineInputs = this.engineInputs.bind(this)
        this.handleInputs = this.handleInputs.bind(this)
        this.inputGenerator = this.inputGenerator.bind(this)
        this.renderInputs = this.renderInputs.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
    }
    /**to
     * Static method with generic return method
     * be used to solve issues
     * @param cb
     * @returns {function(*=): *}
     */
    dynamicCB (cb) {
        return (wo, du, hu) => cb(wo, du, hu)
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
        this.toCb((wo, du, hu) => {
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
        this.toCb((wo, du, hu) => {
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
        this.toCb((wo, du, hu) => {
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
    sortInputs(a, b) {
        if (a.order < b.order) {
            return -1
        }
        if (a.order > b.order) {
            return 1
        }
        return 0
    }
    handleInputChange(value, path) {
        console.log(value)
        console.log(path)
    }
    renderInputs(inputs) {
        return inputs.reduce((acc, input) => {
            console.log(input)
            return acc.concat(`
            <div ng-style="${this.inputStyling}">
                <input type="text"
                    class="form-control"
                    ng-change="${input.onChange}"
                    ng-model="${this.workorder.unitReadings[input.name]}"
                    name="${input.name}"
                    placeholder="${input.placeholder}"
                    ng-disabled="${input.disabled}">
                <span class="text-muted"><small>${input.placeholder}</small></span><br>
            </div>
            `)
        }, '')
    }
    inputGenerator(inputObject, i) {
        if (this.utils.isEmpty(inputObject.inputs)) {
            return `<div></div>`
        } else {
            const compare = (a, b) => {
                if (a.one < b.one) {
                    return -1
                }
                if (a.one > b.one) {
                    return 1
                }
                return 0
            }
            return `
            
            <div class="col-xs-3">
                <label>${inputObject.label}</label>
                <div ng-style="{display: 'block'}">
                    <div ng-bind-html="${this.renderHtml(this.renderInputs(inputObject.inputs))}"></div>
                </div>
            </div>
            
            `
        }
    }
    handleInputs(inputs, label) {
        const obj = {}
        obj.label = label
        obj.inputs = []
        inputs.forEach((input) => {
            if (label === input.label) {
                obj.inputs.push(input)
            }
            input.disabled = this.disabled
            input.onChange = this.handleInputChange
            const temp = this.utils.getObjValue(this.workorder, input.path)
            input.value = temp === null || temp === undefined ? '' : temp
        })
        return obj
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
            }
            if (!this.utils.isEmpty(input.framesObj[frameModel])){
                if (!this.utils.isEmpty(input.pmType.match(pattern)) || !this.utils.isEmpty(input.pmType.match(always))) {
                    newInputs.push(input)
                }
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
                    const inputResponse = this.inputGenerator(this.handleInputs(newInputs, obj.label), i)
                    if (inputResponse.type !== 'div') {
                        return acc.concat(inputResponse)
                    } else {
                        return acc
                    }
                } else {
                    return acc
                }
            }, [])
    }
    renderINputLists(woUnitInputMatrixObject, unitReadings) {
        const inputData = this.engineInputs(woUnitInputMatrixObject, unitReadings.engineModel, unitReadings.compressorModel)
        this.inputs = inputData
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
        bindings: {
            callBack:   '&',
            workorder:  '<',
            woInputMatrix: '<',
            woUnitInputMatrixObject: '<',
            frameModels: '<',
            engineModels: '<',
            disabled: '<'
        },
        controller: ['$sce', '$scope', '$timeout', 'ObjectService', 'Utils', woDynamicUnitReadings]
    })
