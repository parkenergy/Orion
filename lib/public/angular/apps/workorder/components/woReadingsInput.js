class woReadingsInput {
    constructor($scope, Utils) {
        this.scope = $scope
        this.utils = Utils
        this.tripleInputStyling = {
            'display': 'inline-block', 'width': '32%',
        }
        this.inputStyling = {
            'display': 'inline-block', 'width': '49%',
        }
        this.inputSetup = this.inputSetup.bind(this)
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woReadingsInput', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woReadingsInput.html',
        bindings: {
            workorder: '<',
            inputObject: '<',
            disabled: '<',
        }, controller: ['$scope', 'Utils', woReadingsInput]
    })
