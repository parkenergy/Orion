class createTypeSelector {
    constructor () {

    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createTypeSelector', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/typeSelector.html',
        bindings:    {
            workorder: '<',
        },
        controller:  [createTypeSelector],
    })
