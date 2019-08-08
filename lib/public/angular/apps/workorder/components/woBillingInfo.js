class woBillingInfo {
    constructor($scope, $timeout) {
        this.scope = $scope
        this.timeout = $timeout
    }
    dynamicCB (cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }
    checkBoxChange(value, type) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.billingInfo[type] = value
            })
        })
    }
}
angular
    .module('WorkOrderApp.Components')
    .component('woBillingInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woBillingInfo.html',
        bindings: {
            callBack:  '&',
            workorder: '<',
            disabled: '<'
        },
        controller: ['$scope', '$timeout', woBillingInfo]
    })
