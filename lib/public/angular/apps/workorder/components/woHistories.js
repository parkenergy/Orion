class woHistories {
    constructor($scope, ApiRequestService, EditHistories) {
        this.scope = $scope
        this.EH = EditHistories
        this.ARS = ApiRequestService
        this.displaySubmissions = []
        this.displayChanges = []
        this.editHistories = []
        this.editor = null
        this.editCount = 0
    }
    $onInit() {
        this.ARS.EditHistories({workOrder: this.workorder._id})
            .then((res) => {
                this.editHistories = res
                this.editHistories.forEach((edit) => {
                    if (this.workorder._id === edit.workOrder) {
                        const thisEdit = this.displayHistory()
                        thisEdit.panelName = edit.path[0]
                        thisEdit.itemName = edit.path.pop()
                        thisEdit.type = edit.editType
                        thisEdit.before = edit.before
                        thisEdit.after = edit.after
                        this.displayChanges.push(thisEdit)
                    }
                })
                if (this.editHistories.length !== 0) {
                    this.ARS.getUser({id: this.editHistories.pop().user})
                       .then((admin) => {
                           this.editor = admin
                       })
                       .catch((err) => {
                           console.log('Editor retrieval error')
                           console.log(err)
                       })
                    this.editCount = this.editHistories.length + 1
                }
            }).catch(console.error)
        this.ARS.getUser({id: this.workorder.techId})
            .then((user) => {
                let thisUser = user
                const techSubmission = this.submission()
                techSubmission.type = 'Submission'
                if (thisUser !== undefined) {
                    techSubmission.firstname = thisUser.firstName
                    techSubmission.lastname = thisUser.lastName
                } else {
                    techSubmission.firstname = this.workorder.techId
                }
                techSubmission.submissionTime = this.workorder.timeSubmitted
                this.displaySubmissions.push(techSubmission)
                this.isManager()
                this.isAdmin()
            })
            .catch((err) => {
                console.error(err)
                this.isManager()
                this.isAdmin()
            })
    }
    isManager() {
        if (this.workorder.timeApproved) {
            this.ARS.getUser({id: this.workorder.approvedBy})
               .then((manager) => {
                   let thisUser = manager
                   const managerSubmission = this.submission()
                   managerSubmission.type = 'Reviewed'
                   managerSubmission.firstname = thisUser.firstName
                   managerSubmission.lastname = thisUser.lastName
                   managerSubmission.submissionTime = this.workorder.timeApproved
                   this.displaySubmissions.push(
                       managerSubmission)
               })
               .catch((err) => console.log(err))
        }
    }
    isAdmin() {
        if (this.workorder.timeSynced) {
            this.ARS.getUser({id: this.workorder.syncedBy})
               .then((admin) => {
                   let thisUser = admin
                   const adminSubmission = this.submission()
                   adminSubmission.type = 'Synced'
                   adminSubmission.firstname = thisUser.firstName
                   adminSubmission.lastname = thisUser.lastName
                   adminSubmission.submissionTime = this.workorder.timeSynced
                   this.displaySubmissions.push(adminSubmission)
               })
               .catch((err) => console.log(err))
        }
    }
    submission() {
        return {
            type:           '',
            firstname:      '',
            lastname:       '',
            submissionTime: Date,
        }
    }
    displayHistory() {
        return {
            panelName: '',
            itemName:  '',
            type:      '',
            before:    '',
            after:     '',
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woHistories', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woHistories.html',
        bindings: {
            workorder: '<',
        },
        controller: ['$scope', 'ApiRequestService', 'EditHistories', woHistories]
    })
