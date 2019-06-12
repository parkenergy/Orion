class woTimeSubmittedView {
    constructor($scope, $timeout, TimeDisplayService, CommonWOfunctions) {
        this.CWF = CommonWOfunctions
        this.TDS = TimeDisplayService
        this.scope = $scope
        this.timeout = $timeout
        this.elapsedTime = {hours: 0, minutes: 0, seconds: 0}
        this.totalLaborTime = {hours: 0, minutes: 0}

    }
    dynamicCB (cb) {
        return (wo, du, u) => cb(wo, du, u)
    }
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }
    $onInit() {
        this.elapsedTime = this.CWF.getTimeElapsed(this.workorder)
        this.totalLaborTime = this.CWF.getUsedLaborTime(this.workorder)
    }

}

angular
    .module('WorkOrderApp.Components')
    .component('woTimeSubmittedView', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woTimeSubmittedView.html',
        bindings: {
            callBack:   '&',
            workorder:  '<',
        },
        controller: ['$scope', '$timeout', 'TimeDisplayService', 'CommonWOfunctions', woTimeSubmittedView]
    })
