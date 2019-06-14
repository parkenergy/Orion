class woReadingsInput {
    constructor($scope) {
        this.scope = $scope
    }
    handleInputChange(value, name) {
        console.log(value)
        console.log(name)
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
        },
        controller: ['$scope', woReadingsInput]
    })
