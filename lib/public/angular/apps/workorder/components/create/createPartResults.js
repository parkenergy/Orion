class createPartResults {
    constructor ($scope, $timeout, Utils) {
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils
    }

    /**to
     * Static method with generic return method
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

    removePart(part) {
        this.toCb((wo, du, hu) => {
            this.timeout(() => {
                const index = wo.parts.indexOf(part)
                wo.parts.splice(index, 1)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createPartResults', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/partResults.html',
        bindings: {
            callBack: '&',
            workorder: '<',
        },
        controller: ['$scope', '$timeout', 'Utils', createPartResults]
    })
