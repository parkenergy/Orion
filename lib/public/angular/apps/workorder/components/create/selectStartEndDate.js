class createStartEndDateCtrl {
    constructor ($window, TimeDisplayService, DateService) {
        console.log('in createStartEndDateCtrl')
    }

    $onInit () {
        console.log(this.workorder)
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createStartEndDate', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/selectStartEndDate.html',
        bindings:    {
            workorder: '<',
        },
        controller:  ['$window', 'TimeDisplayService', 'DateService', createStartEndDateCtrl],
    })
