class woTimeSubmittedView {
    constructor($scope, $timeout, TimeDisplayService) {
        this.TDS = TimeDisplayService
        this.scope = $scope
        this.timeout = $timeout
        this.elapsedSeconds = 0
        this.elapsedHours = 0
        this.elapsedMinutes = 0
        this.totalLaborTime = {hours: 0, minutes: 0}

        this.getTimeElapsed = this.getTimeElapsed.bind(this)
        this.getUsedLaborTime = this.getUsedLaborTime.bind(this)
    }
    dynamicCB (cb) {
        return (wo, du, u) => cb(wo, du, u)
    }
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }
    $onInit() {
        console.log('hello world')
        this.getTimeElapsed()
        this.getUsedLaborTime()
    }
    getTimeElapsed() {
        const start = new Date(this.workorder.timeStarted)
        const end = new Date(this.workorder.timeSubmitted)

        const milli = (end.getTime() - start.getTime()).toFixed()
        this.elapsedSeconds = Math.floor(((milli/1000) % 60))
        this.elapsedMinutes = Math.floor(((milli/6e4) % 60))
        this.elapsedHours = Math.floor(((milli/36e5)))
    }
    getUsedLaborTime() {
        let totalMin = 0
        const laborCodeKeys = Object.keys(this.workorder.laborCodes)
        laborCodeKeys.forEach((lc) => {
            const subLaborCodeKeys = Object.keys(this.workorder.laborCodes[lc])
            subLaborCodeKeys.forEach((slc) => {
                const laborCode = this.workorder.laborCodes[lc][slc]
                if ((laborCode.text !== 'negativeAdj') && (laborCode.text !== 'positiveAdj') && (laborCode.text !== 'lunch')) {
                    totalMin += laborCode.hours * 60
                    totalMin += laborCode.minutes
                }
            })
        })

        let hrs = Math.floor(totalMin / 60)
        let min = Math.floor(totalMin % 60)
        this.totalLaborTime = {hours: hrs, minutes: min}
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
        controller: ['$scope', '$timeout', 'TimeDisplayService', woTimeSubmittedView]
    })
