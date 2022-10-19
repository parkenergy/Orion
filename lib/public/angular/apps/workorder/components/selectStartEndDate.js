class createStartEndDateCtrl {
    constructor () {
        this.dates = {
            endInput:   null,
            startInput: null,
        }
    }

    setStartTime (input) {
        this.dates.startInput = input
        this.dates.endInput = input
        if (input === null) {
            this.dates.date = null
        }
        if (typeof input === 'object' && input !== null) {
            this.setWoTimeStarted({time: input})
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
        controller:  [createStartEndDateCtrl],
    })
