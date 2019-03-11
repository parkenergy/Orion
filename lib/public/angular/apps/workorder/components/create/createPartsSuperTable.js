class createPartSuperTable {
    constructor ($scope, $timeout, Utils) {
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils

        this.searchParts = []
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

    $onChanges(changeObj) {
        if (changeObj.parts !== undefined && !this.utils.isEmpty(changeObj.parts.currentValue) && this.utils.isEmpty(changeObj.parts.previousValue)) {
            this.timeout(() => {
                this.searchParts = changeObj.parts.currentValue
            })
        }
    }

    changeSorting(column) {
        const sort =
    }
}


angular
    .module('WorkOrderApp.Components')
    .component('createPartSuperTable', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/partsSuperTable.html',
        bindings: {
            callBack: '&',
            workorder: '<',
            parts: '<',
        },
        controller: ['$scope', '$timeout', 'Utils', createPartSuperTable]
    })
