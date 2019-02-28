class createHeaderInfo {
    constructor ($scope, $timeout, ObjectService) {
        this.scope = $scope
        this.timeout = $timeout
        this.OS = ObjectService
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

    changeThisField (changedData, selected) {
        this.toCb((wo, a, b) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, changedData, selected)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createHeaderInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/headerInfo.html',
        bindings:    {
            callBack:         '&',
            workorder:        '<',
            applicationtypes: '<',
        },
        controller:  ['$scope', '$timeout', 'ObjectService', createHeaderInfo],
    })
