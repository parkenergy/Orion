class createComment {
    constructor ($scope, $timeout, ObjectService) {
        this.scope = $scope
        this.timeout = $timeout
        this.OS = ObjectService
    }
    /**to
     * Static method with generic return method
     * be used to solve issues
     * @param cb
     * @returns {function(*=): *}
     */
    dynamicCB (cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
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

    /**
     * Used to change data on the work order
     * @param changedData
     * @param selected
     */
    changeThisField (changedData, selected) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, changedData, selected)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createComment', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/comment.html',
        bindings: {
            callBack: '&',
            workorder: '<',
        },
        controller: ['$scope', '$timeout', 'ObjectService', createComment]
    })
