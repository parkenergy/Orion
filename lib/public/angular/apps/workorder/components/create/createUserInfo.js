class createUserInfo {
    constructor ($scope, $timeout, ObjectService, Utils) {
        this.utils = Utils
        this.OS = ObjectService
        this.scope = $scope
        this.timeout = $timeout
        this.hours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
        this.minutes = [5,10,15,20,25,30,35,40,45,50,55]
        this.techChange = this.techChange.bind(this)
        this.trucks = []
        this.techs = []
    }
    /**to
     * Static method with generic return method
     * be used to solve issues
     * @param cb
     * @returns {function(*=): *}
     */
    dynamicCB (cb) {
        return (wo, du, hu) => cb(wo, du, hu)
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
        if (changeObj.locations !== undefined && !this.utils.isEmpty(changeObj.locations.currentValue) && this.utils.isEmpty(changeObj.locations.previousValue)) {
            this.timeout(() => {
                changeObj.locations.currentValue.forEach((location) => {
                    this.trucks.push(location)
                })

            })
        }
        if (changeObj.users !== undefined && !this.utils.isEmpty(changeObj.users.currentValue) && this.utils.isEmpty(changeObj.users.previousValue)) {
            this.timeout(() => {
                changeObj.users.currentValue.forEach((user) => {
                    this.techs.push(user)
                })

            })
        }
    }

    changeThisField (changedData, selected) {
        this.toCb((wo, du, hu) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, changedData, selected)
            })
        })
    }
    techChange(input) {
        this.toCb((wo, du, hu) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(this.users)) {
                    this.users.forEach((user) => {
                        if (user.username === input) {
                            wo.techId = input
                        }
                    })
                }
            })
        })
    }
    truckChange(input) {
        this.toCb((wo, du, hu) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(this.locations)) {
                    this.locations.forEach((location) => {
                        if (location.name === input) {
                            wo.truckId = input
                            wo.truckNSID = location.netsuiteId
                        }
                    })
                }
            })
        })
    }
}

angular
.module('WorkOrderApp.Components')
.component('createUserInfo', {
    templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/userInfo.html',
    bindings: {
        callBack: '&',
        workorder: '<',
        users: '<',
        locations: '<',
    },
    controller: ['$scope', '$timeout', 'ObjectService', 'Utils', createUserInfo],
})
