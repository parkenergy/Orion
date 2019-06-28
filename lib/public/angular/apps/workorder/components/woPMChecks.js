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
        return (wo, du, hu) => cb(wo, du, hu)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    changeThisCheckbox(data, select) {
        this.toCb((wo, du, hu) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woPmChecks', {
        templateUrl:   '/lib/public/angular/apps/workorder/views/component.views/woPmChecks.html', bindings: {
            callBack:  '&',
            workorder: '<',
            disabled:  '<',
        }, controller: ['$scope', '$timeout', 'Utils', 'ObjectService', woPmChecks]
    })
