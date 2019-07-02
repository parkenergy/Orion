class woTimeSubmittedView {
    constructor($scope, $timeout, TimeDisplayService, CommonWOfunctions, ObjectService) {
        this.OS = ObjectService
        this.CWF = CommonWOfunctions
        this.TDS = TimeDisplayService
        this.scope = $scope
        this.timeout = $timeout
        this.elapsedTime = {
            hours:   0,
            minutes: 0,
            seconds: 0
        }
        this.calcTime = {
            hours:   0,
            minutes: 0
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    $onInit() {
        this.elapsedTime = this.CWF.getTimeElapsed(this.workorder)
        this.calcTime = this.CWF.getTotalLaborTime(this.workorder)
    }

    $doCheck() {
        if (this.state.laborCodeTimeChange) {
            this.toCb((wo, du, u, state) => {
                this.timeout(() => {
                    state.laborCodeTimeChange = false
                    this.elapsedTime = this.CWF.getTimeElapsed(wo)
                    this.calcTime = this.CWF.getTotalLaborTime(wo)
                })
            })
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woTimeSubmittedView', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woTimeSubmittedView.html',
        bindings:    {
            callBack:  '&',
            state:     '<',
            workorder: '<',
        },
        controller:  ['$scope', '$timeout', 'TimeDisplayService', 'CommonWOfunctions', 'ObjectService',
            woTimeSubmittedView]
    })
