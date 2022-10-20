class woPmChecks {
    constructor($scope, $timeout, Utils, ObjectService) {
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils
        this.OS = ObjectService
        this.block = {
            'display':         'flex',
            'flex-wrap':       'wrap',
            'flex-direction':  'row',
            'justify-content': 'flex-start',
            'box-sizing':      'content-box'
        }
        this.inline = {
            'margin-top':      0,
            'flex':            1,
            'flex-wrap':       'wrap',
            'justify-content': 'flex-start',
        }
        this.changeThisCheckbox = this.changeThisCheckbox.bind(this)
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    changeThisCheckbox(data, select) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woPmChecks', {
        templateUrl:   '/lib/public/angular/apps/workorder/views/component.views/woPMChecks.html', bindings: {
            callBack:  '&',
            workorder: '<',
            disabled:  '<',
        }, controller: ['$scope', '$timeout', 'Utils', 'ObjectService', woPmChecks]
    })
