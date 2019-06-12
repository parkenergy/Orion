class woNotes {
    constructor($scope, ApiRequestService, ReviewNotes) {
        this.RV = ReviewNotes
        this.scope = $scope
        this.ARS = ApiRequestService
        this.sendingNote = false
        this.reviewNotes = []

        this.classNote = this.classNote.bind(this)
        this.newNote = this.newNote.bind(this)
        this.comment = {}
    }
    $onInit() {
        this.ARS.ReviewNotes({workOrder: this.workorder._id})
           .then((res) => {
               this.reviewNotes = res
           }).catch(console.error)
        this.comment = this.classNote()
    }
    classNote() {
        return {
            note: '',
            workOrder: this.workorder._id
        }
    }
    newNote() {
        if (this.comment.note) {
            this.sendingNote = true
            this.RV.save({}, this.comment, (res) => {
                this.sendingNote = false
                this.ARS.ReviewNotes({workOrder: res.workOrder})
                    .then((res) => {
                        this.reviewNotes = res
                    }).catch(console.error)
                this.comment.note = null
            }, (err) => {
                console.error(err)
                this.sendingNote = false
                this.comment.note = null
            })
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woNotes', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woNotes.html',
        bindings: {
            workorder: '<',
        },
        controller: ['$scope', 'ApiRequestService', 'ReviewNotes', woNotes]
    })
