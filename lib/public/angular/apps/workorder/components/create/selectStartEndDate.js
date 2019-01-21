class createStartEndDateCtrl {
    constructor ($window, TimeDisplayService, DateService) {
        this.dates = {
            endInput:   null,
            startInput: null,
        }
    }

    setStartTime (input) {
        this.dates.startInput = input
        if (input === null) {
            this.dates.date = null
        }
        if (typeof input === 'object' && input !== null) {
            this.setWoTimeStarted({time: input})
        }
    }

    setEndTime (input) {
        this.dates.endInput = input
        if (input === null) {
            this.dates.date = null
        }
        if (typeof input === 'object' && input !== null) {
            this.setWoTimeSubmitted({time: input})
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createStartEndDate', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/selectStartEndDate.html',
        bindings:    {
            setWoTimeStarted:   '&',
            setWoTimeSubmitted: '&',
            workorder:          '<',
        },
        controller:  ['$window', 'TimeDisplayService', 'DateService', createStartEndDateCtrl],
    })
