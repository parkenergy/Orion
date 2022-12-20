class woJsaMisc {
    constructor($scope, $timeout, $uibModal, AlertService) {
        this.AS = AlertService
        this.modal = $uibModal
        this.scope = $scope
        this.timeout = $timeout
        this.modalInstance = null

        $scope.jsa_kpa = 'JSA'

        this.openLeaseNotes = this.openLeaseNotes.bind(this)
    }
    dynamicCB (cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }
    checkBoxChange(value, type) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.misc[type] = value
            })
        })
    }
    openLeaseNotes() {
        this.modalInstance = this.modal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLeaseNotesModal.html',
            controller:  'NotesModalCtrl',
            resolve:     {
                obj: () => {
                    return {
                        notes: this.workorder.misc.leaseNotes,
                        disabled: this.disabled
                    }
                },
            },
        })
        this.modalInstance.result
            .then((notes) => {
                this.workorder.misc.leaseNotes = notes
            })
    }
    openUnitNotes() {
        this.modalInstance = this.modal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/woUnitNotesModal.html',
            controller:  'NotesModalCtrl',
            resolve:     {
                obj: () => {
                    return {
                        notes: this.workorder.misc.unitNotes,
                        disabled: this.disabled
                    }
                }
            },
        })
        this.modalInstance.result
            .then((notes) => {
                this.workorder.misc.unitNotes = notes
            })
    }
    openUnitView() {
        if (this.displayUnit !== undefined) {
            this.modalInstance = this.modal.open({
                templateUrl: '/lib/public/angular/apps/workorder/views/modals/woLocationModal.html',
                controller:  'woLocationModalCtrl',
                resolve: {
                    obj: () => {
                        return {
                            unit: this.displayUnit,
                            geo: this.workorder.geo
                        }
                    }
                }
            })
        } else {
            this.AS.add('danger', 'No unit exists on this work order.')
        }
    }
    checkKPA() {
        if (this.workorder.jsa.emergencyEvac == '%KPA%' || this.containsNumber(this.workorder.jsa.customer)) {
            this.scope.jsa_kpa = `KPA: ${this.workorder.jsa.customer}`

            let jsaButton = document.getElementById('jsa_kpa_button')
            jsaButton.addEventListener("focus", function () {
                this.style.outline = "none" 
            })
            jsaButton.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#a4cf80'
                this.style.border = '1px solid #a4cf80'
            })
        } else {
            this.scope.jsa_kpa = "JSA"
        }
    }
    containsNumber (s) {
        let check = /\d/
        return check.test(s)
    }
    openJSA() {
        if (this.workorder.jsa.emergencyEvac == '%KPA%' || this.containsNumber(this.workorder.jsa.customer)) return

        this.modalInstance = this.modal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/woJsaModal.html',
            controller:  'JsaEditModalCtrl',
            windowClass: 'jsa-modal',
            resolve:     {
                jsa: () => {
                    return this.workorder.jsa
                },
            },
        })

        this.modalInstance.result
            .then((jsa) => {
                this.workorder.jsa = jsa
            })
    }
}
angular
    .module('WorkOrderApp.Components')
    .component('woJsaMisc', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woJsaMisc.html',
        bindings: {
            callBack:  '&',
            workorder: '<',
            disabled: '<',
            displayUnit: '<',
        },
        controller: ['$scope', '$timeout', '$uibModal', 'AlertService', woJsaMisc]
    })
