class woTimeSubmittedView {
    constructor($scope, $timeout, TimeDisplayService, CommonWOfunctions, ObjectService) {
        this.OS = ObjectService
        this.CWF = CommonWOfunctions
        this.TDS = TimeDisplayService
        this.scope = $scope
        this.timeout = $timeout
        this.elapsedTime = {hours: 0, minutes: 0, seconds: 0}
        this.totalLaborTime = {hours: 0, minutes: 0}
        this.timeChange = this.timeChange.bind(this)
    }
    dynamicCB (cb) {
        return (wo, du, u) => cb(wo, du, u)
    }
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }
    $onInit() {
        this.elapsedTime = this.CWF.getTimeElapsed(this.workorder)
        this.totalLaborTime = this.CWF.getPaidForLaborTime(this.workorder)
    }

    $onChanges(ch) {
        if (ch.workorder !== undefined && ch.workorder.previousValue !== undefined) {
            if (!this.OS.equal(ch.workorder.previousValue.laborCodes, ch.workorder.currentValue.laborCodes)) {
                this.timeChange()
            }
        }
    }

    timeChange() {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.elapsedTime = this.CWF.getTimeElapsed(wo)
                this.totalLaborTime = this.CWF.getPaidForLaborTime(wo)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woTimeSubmittedView', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woTimeSubmittedView.html',
        bindings:    {
            callBack:   '&',
            workorder:  '<',
        },
        controller:  ['$scope', '$timeout', 'TimeDisplayService', 'CommonWOfunctions', 'ObjectService',
            woTimeSubmittedView]
    })
