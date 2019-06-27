class woLaborCodes {
    constructor($scope, $timeout, Utils, ObjectService) {
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils
        this.OS = ObjectService
        this.hours = woLaborCodes.getHours()
        this.minutes = woLaborCodes.getMinutes()
        this.changeThisTimeField = this.changeThisTimeField.bind(this)
        this.showUsed = this.showUsed.bind(this)
    }

    static getHours() {
        const hours = []
        for (let i = 0; i <= 24; i++) {
            hours.push(i)
        }
        return hours
    }

    static getMinutes() {
        const minutes = []
        for (let i = 0; i < 60; i += 5) {
            minutes.push(i)
        }
        return minutes
    }

    /**
     * return bool to show current time field. Only show
     * time fields that have time in them.
     * @param timeObj
     */
    showUsed(timeObj) {
        const {hours, minutes} = timeObj
        if (this.disabled) {
            return (hours > 0) || (minutes > 0)
        } else {
            return true
        }
    }
    dynamicCB(cb) {
        return (wo, du, hu) => cb(wo, du, hu)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    changeThisTimeField(data, select) {
        this.toCb((wo, du, hu) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woLaborCodes', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woLaborCodes.html', bindings: {
            callBack: '&', workorder: '<', disabled: '<',
        }, controller: ['$scope', '$timeout', 'Utils', 'ObjectService', woLaborCodes]
    })
