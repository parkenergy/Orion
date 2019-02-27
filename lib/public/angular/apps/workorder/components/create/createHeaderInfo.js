class createHeaderInfo {
    constructor ($scope, $timeout) {
        this.scope = $scope
        this.timeout = $timeout
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
}

angular
    .module('WorkOrderApp.Components')
    .component('createHeaderInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/headerInfo.html',
        bindings:    {
            callBack:  '&',
            workorder: '<',
        },
        controller:  ['$scope', '$timeout', createHeaderInfo],
    })
