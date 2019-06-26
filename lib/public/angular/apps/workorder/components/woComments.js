class woComments {
    constructor($scope, $timeout, Utils, ObjectService) {
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils
        this.OS = ObjectService
        this.timeAdjustment = false
        this.changeThisTextAreaField = this.changeThisTextAreaField.bind(this)
    }

    $onChanges(changes) {
        if (!this.utils.isEmpty(changes.workorder) && !this.utils.isEmpty(changes.workorder.previousValue) &&
            ((changes.workorder.currentValue.laborCodes.basic.positiveAdj.hours !==
                changes.workorder.previousValue.laborCodes.basic.positiveAdj.hours) ||
                (changes.workorder.currentValue.laborCodes.basic.positiveAdj.minutes !==
                    changes.workorder.previousValue.laborCodes.basic.positiveAdj.minutes))) {
            if (this.workorder.laborCodes.basic.positiveAdj.hours > 0 ||
                this.workorder.laborCodes.basic.negativeAdj.hours > 0 ||
                this.workorder.laborCodes.basic.positiveAdj.minutes > 0 ||
                this.workorder.laborCodes.basic.negativeAdj.minutes > 0) {
                this.timeAdjustment = true
            } else {
                this.timeAdjustment = false
            }
        }
    }

    dynamicCB(cb) {
        return (wo, du, hu) => cb(wo, du, hu)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    changeThisTextAreaField(data, select) {
        this.toCb((wo, du, hu) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woComments', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woComments.html', bindings: {
            callBack: '&', workorder: '<', disabled: '<',
        }, controller: ['$scope', '$timeout', 'Utils', 'ObjectService', woComments]
    })
