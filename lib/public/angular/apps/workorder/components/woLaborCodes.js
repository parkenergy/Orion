class woLaborCodes {
    constructor($scope, $timeout, Utils, ObjectService, CommonWOfunctions, TimeDisplayService) {
        this.TDS = TimeDisplayService
        this.CWF = CommonWOfunctions
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils
        this.OS = ObjectService
        this.hours = woLaborCodes.getHours()
        this.minutes = woLaborCodes.getMinutes()
        this.elapsedTime = {
            hours:   0,
            minutes: 0,
            seconds: 0
        }
        this.changeThisTimeField = this.changeThisTimeField.bind(this)
        this.showUsed = this.showUsed.bind(this)
    }

    static getHours() {
        const hours = []
        for (let i = 0; i <= 24; i++) {
            hours.push(i)
        }
        return hours
    }

    static getMinutes() {
        const minutes = []
        for (let i = 0; i < 60; i += 5) {
            minutes.push(i)
        }
        return minutes
    }

    $onInit() {
        this.elapsedTime = this.CWF.getTimeElapsed(this.workorder)
        this.calcTime = this.CWF.getTotalLaborTime(this.workorder)
        this.unaccountedTime =
            this.CWF.getUnaccountedTime(this.elapsedTime.hours, this.elapsedTime.minutes, this.calcTime.laborH,
                this.calcTime.laborM)
    }

    /**
     * return bool to show current time field. Only show
     * time fields that have time in them.
     * @param timeObj
     */
    showUsed(timeObj) {
        const {hours, minutes} = timeObj
        if (this.disabled) {
            return (hours > 0) || (minutes > 0)
        } else {
            return true
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    timeChange() {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.elapsedTime = this.CWF.getTimeElapsed(wo)
                this.calcTime = this.CWF.getTotalLaborTime(this.workorder)
                this.unaccountedTime =
                    this.CWF.getUnaccountedTime(this.elapsedTime.hours, this.elapsedTime.minutes, this.calcTime.laborH,
                        this.calcTime.laborM)
            })
        })
    }

    changeThisTimeField(data, select) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select)
                state.laborCodeTimeChange = true
                state.laborCodeSelectionChange = true
                this.timeChange()
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woLaborCodes', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woLaborCodes.html',
        bindings:    {
            callBack:  '&',
            state:     '<',
            workorder: '<',
            disabled:  '<',
        },
        controller:  ['$scope', '$timeout', 'Utils', 'ObjectService', 'CommonWOfunctions', 'TimeDisplayService',
            woLaborCodes]
    })
