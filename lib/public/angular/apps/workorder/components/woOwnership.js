class woOwnership {
    constructor($scope, $timeout) {
        this.scope = $scope
        this.timeout = $timeout
    }
    dynamicCB (cb) {
        return (wo, a, b) => cb(wo, a, b)
    }
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }
    checkBoxChange(value, type) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                wo.unitOwnership[type] = value
            })
        })
    }
}
angular
    .module('WorkOrderApp.Components')
    .component('woOwnership', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woOwnership.html',
        bindings: {
            callBack:  '&',
            workorder: '<',
            disabled: '<'
        },
        controller: ['$scope', '$timeout', woOwnership]
    })
