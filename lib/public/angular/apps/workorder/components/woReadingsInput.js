class woReadingsInput {
    constructor($scope, Utils) {
        this.scope = $scope
        this.utils = Utils
        this.block = {
            'display': 'flex', 'flex-wrap': 'wrap', 'flex-direction': 'row', 'justify-content': 'flex-start',
            'box-sizing': 'content-box'
        }
        this.inputStyling = {
            'flex': 1, 'flex-wrap': 'wrap', 'justify-content': 'flex-start',
        }
        this.inputStylingM = {
            'margin-left': '5px', 'margin-right': '5px', 'flex': 1, 'flex-wrap': 'wrap',
            'justify-content': 'flex-start', 'box-sizing': 'border-box'
        }
        this.inputStylingS = {
            'margin-right': '5px', 'flex': 1, 'flex-wrap': 'wrap', 'justify-content': 'flex-start',
            'box-sizing': 'border-box'
        }
        this.inputStylingE = {
            'margin-left': '5px', 'flex': 1, 'flex-wrap': 'wrap', 'justify-content': 'flex-start',
            'box-sizing': 'border-box'
        }
        /*this.tripleInputStyling = {
            'display': 'inline-block', 'width': '32%',
        }
        this.inputStyling = {
            'display': 'inline-block', 'width': '49%',
        }*/
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
