class createTypeSelector {
    constructor ($scope, $timeout, ApiRequestService, CommonWOfunctions) {
        this.type = [
            {text: 'Corrective', value: false},
            {text: 'Trouble Call', value: false},
            {text: 'New Set', value: false},
            {text: 'Transfer', value: false},
            {text: 'Swap', value: false},
            {text: 'Release', value: false},
            {text: 'Indirect', value: false},
        ]
        this.scope = $scope
        this.timeout = $timeout
        this.ARS = ApiRequestService
        this.common = CommonWOfunctions
        /**
         *
         * this.scope.$ctrl.callBack({cb: cbmethod})
         *
         * is the format to send execute a method on
         * the parent controller and call $timeout
         * to reset and call $apply to remake view
         *
         * params include (workorder, displayUnit, HeaderUnit)
         *
         *
         */
    }

    /**
     * Static method with generic return method to
     * be used to solve issues
     * @param cb
     * @returns {function(*=): *}
     */
    dynamicCB (cb) {
        return (wo, a, b) => cb(wo, a, b)
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

    setType (type) {
        this.toCb((wo, a, b) => {
            this.timeout(() => {
                wo.type = type
            })
        })
    }

    /**
     * Set all wo pm types to false and set
     * the specific PM to true/false
     * @param type
     * @param value
     */
    setPM (type, value) {
        this.toCb((wo, a, b) => {
            wo.pm = false
            wo.pm2 = false
            wo.pm3 = false
            wo.pm4 = false
            wo.pm5 = false
            this.timeout(() => {
                wo[type.toLowerCase()] = value
            })
        })
    }

    /**
     * Set the WO type and set this states types
     * also set the PM type
     * @param type
     * @param value
     */
    doItAll (type, value) {
        this.toCb((wo, a, b) => {
            this.timeout(() => {
                wo.type = type
                this.type = [...this.type.map((obj) => {
                    obj.value = false
                    return obj
                })]
                wo.pm = false
                wo.pm2 = false
                wo.pm3 = false
                wo.pm4 = false
                wo.pm5 = false
                wo[type.toLowerCase()] = value
            })
        })
    }

    /**
     * Set local states type
     * @param text
     * @param value
     */
    setTypeObj (text, value) {
        this.timeout(() => {
            this.type = [...this.type.map((obj) => {
                if (obj.text === text) {
                    obj.value = value
                }
                return obj
            })]
        })
    }

    /**
     * Reset Local States types
     */
    wipeTypeObj () {
        this.timeout(() => {
            this.type = [...this.type.map((obj) => {
                obj.value = false
                return obj
            })]
        })
    }

    pmChange (value, text) {
        this.typeChange({value, text})
    }

    /**
     * Run all operations on selected types
     * and then call appropriate methods to change
     * state and wo type
     * @param obj
     */
    typeChange (obj) {
        this.toCb((wo, a, b) => {
            const type = wo.type
            if (obj.text === 'PM' ||
                obj.text === 'PM2' ||
                obj.text === 'PM3' ||
                obj.text === 'PM4' ||
                obj.text === 'PM5') {
                if (type === 'New Set' ||
                    type === 'Release' ||
                    type === 'Indirect') {
                    this.doItAll(obj.text, obj.value)
                } else if ((type === 'Corrective' ||
                    type === 'Trouble Call' ||
                    type === 'Transfer' ||
                    type === 'Swap') &&
                    (!obj.value)) {
                    this.timeout(() => {
                        wo.pm = false
                        wo.pm2 = false
                        wo.pm3 = false
                        wo.pm4 = false
                        wo.pm5 = false
                    })
                } else {
                    if (obj.text !== type) {
                        if (type !== 'Corrective' &&
                            type !== 'Trouble Call' &&
                            type !== 'Transfer' &&
                            type !== 'Swap') {
                            this.setType(obj.text)
                        }
                        this.setPM(obj.text, obj.value)
                    } else {
                        if (type === 'Corrective' ||
                            type === 'Trouble Call' ||
                            type === 'Transfer' ||
                            type === 'Swap') {
                        } else {
                            if (!obj.value) {
                                this.setPM(obj.text, !obj.value)
                            }
                        }
                    }
                }
            } else {
                this.wipeTypeObj()
                if (obj.text === 'New Set' ||
                    obj.text === 'Release' ||
                    obj.text === 'Indirect') {
                    if (obj.text !== wo.type) {
                        this.setType(obj.text)
                        this.setTypeObj(obj.text, obj.value)
                    } else {
                        this.setType(obj.text)
                        this.setTypeObj(obj.text, !obj.value)
                    }
                    wo.pm = false
                    wo.pm2 = false
                    wo.pm3 = false
                    wo.pm4 = false
                    wo.pm5 = false
                } else if (obj.text === 'Corrective' ||
                    obj.text === 'Trouble Call' ||
                    obj.text === 'Transfer' ||
                    obj.text === 'Swap') {
                    if (wo.pm || wo.pm2 ||
                        wo.pm3 || wo.pm4 ||
                        wo.pm5) {
                        if ((type !== 'PM' &&
                            type !== 'PM2' &&
                            type !== 'PM3' &&
                            type !== 'PM4' &&
                            type !== 'PM5') && !obj.value) {
                            wo.type = wo.pm
                                ? 'PM' : (wo.pm2
                                    ? 'PM2' : (wo.pm3
                                        ? 'PM3' : (wo.pm4
                                            ? 'PM4' : (wo.pm5
                                                ? 'PM5' : obj.text))))
                            this.setTypeObj(obj.text, obj.value)
                        } else {
                            wo.type = obj.text
                            this.setTypeObj(obj.text, obj.value)
                        }
                    } else {
                        if (obj.text !== wo.type) {
                            this.setType(obj.text)
                            this.setTypeObj(obj.text, obj.value)
                        } else {
                            this.setType(obj.text)
                            this.setTypeObj(obj.text, !obj.value)
                        }
                    }
                }
            }
            this.runHeaderValidation()
        })
    }

    /**
     * Method used to change header information
     * depending on the type that is selected.
     */
    runHeaderValidation () {
        this.toCb((wo, a, b) => this.common.runHeaderValidation(wo, a, b))
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createTypeSelector', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/typeSelector.html',
        bindings:    {
            callBack:  '&',
            workorder: '<',
        },
        controller:  ['$scope', '$timeout', 'ApiRequestService', 'CommonWOfunctions', createTypeSelector],
    })
