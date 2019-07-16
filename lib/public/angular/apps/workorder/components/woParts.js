class woParts {
    constructor($scope, $timeout, $uibModal) {
        this.scope = $scope
        this.timeout = $timeout
        this.modal = $uibModal

        this.orderByFieldSelect = 'description'
        this.orderByFieldResult = 'description'
        this.reverseSortSelect = false
        this.reverseSortResult = false
        this.modalInstance = null

        this.fuse = null
        this.searchPhrase = ''

        this.selectableSearchedParts = []
        this.selectedPartsObjs = []
        this.usedLaborCodes = []
        this.clearSearch = this.clearSearch.bind(this)
        this.sortPartsForSearch = this.sortPartsForSearch.bind(this)
        this.resortSelect = this.resortSelect.bind(this)
        this.resortResult = this.resortResult.bind(this)
        this.removePart = this.removePart.bind(this)
        this.getUsedLaborCodes = this.getUsedLaborCodes.bind(this)
        this.openManualPartModal = this.openManualPartModal.bind(this)
    }

    $onInit() {
        this.selectedPartsObjs = this.workorder.parts
        this.getUsedLaborCodes()
    }

    $doCheck() {
        if (this.searchPhrase.length >= 3) {
            this.selectableSearchedParts = this.fuse
                                               .search(this.searchPhrase)
                                               .slice(0, 50)
        } else {
            this.selectableSearchedParts = []
        }
        if (this.state.laborCodeSelectionChange) {
            this.getUsedLaborCodes()
        }
    }

    $onChanges(ch) {
        if (ch.parts !== undefined && ch.parts.currentValue !== undefined && ch.parts.currentValue.length > 0) {
            this.sortPartsForSearch(this.parts)
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    sortPartsForSearch(parts) {
        const options = {keys: ['componentName', 'MPN', 'description']}
        try {
            this.fuse = new Fuse(parts, options)
        } catch (e) {
            console.error(e)
        }
    }

    clearSearch() {
        this.searchPhrase = ''
    }

    resortSelect(by) {
        this.orderByFieldSelect = by
        this.reverseSortSelect = !this.reverseSortSelect
    }

    resortResult(by) {
        this.orderByFieldResult = by
        this.reverseSortResult = !this.reverseSortResult
    }

    getUsedLaborCodes() {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                const usedLaborCoes = []
                state.laborCodeSelectionChange = false
                _.forEach(wo.laborCodes, (lc) => {
                    _.forEach(lc, (code) => {
                        if (code.hours > 0 || code.minutes > 0) {
                            if (usedLaborCoes.indexOf(code.text) === -1) {
                                usedLaborCoes.push(code.text)
                            }
                        }
                    })
                })
                this.usedLaborCodes = usedLaborCoes
            })
        })
    }

    removePart(part) {
        this.timeout(() => {
            this.selectedPartsObjs.forEach((woPart, index, array) => {
                if ((part.netsuiteId !== undefined && part.netsuiteId !== null && part.netsuiteId !== 0 &&
                    part.netsuiteId !== '') &&
                    (woPart.netsuiteId !== undefined && woPart.netsuiteId !== null && woPart.netsuiteId !== 0 &&
                        woPart.netsuiteId !== '')) {
                    if (part.netsuiteId === woPart.netsuiteId) {
                        array.splice(index, 1)
                    }
                } else {
                    if (part.number === woPart.number) {
                        array.splice(index, 1)
                    }
                }
            })
        })
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.parts.forEach((woPart, index, array) => {
                    if ((part.netsuiteId !== undefined && part.netsuiteId !== null && part.netsuiteId !== 0 &&
                        part.netsuiteId !== '') &&
                        (woPart.netsuiteId !== undefined && woPart.netsuiteId !== null && woPart.netsuiteId !== 0 &&
                            woPart.netsuiteId !== '')) {
                        if (part.netsuiteId === woPart.netsuiteId) {
                            array.splice(index, 1)
                        }
                    } else {
                        if (part.number === woPart.number) {
                            array.splice(index, 1)
                        }
                    }
                })
            })
        })
    }

    clearSearchPhraseAndSelect(part) {
        this.clearSearch()
        // manual part needs to match
        // this is a regular part
        /*
        * _id: 0u2lkjw3;lkj39sj
        * cost: 0
        * description: "WATER PUMP, GM 1.6L (PSI)"​​
        * isBillable: false​​​
        * isManual: false​​​
        * isWarranty: false​​​
        * laborCode: "Cooling System"​​​
        * netsuiteId: "2674"
        * ​​​number: "GAT41018"
        * ​​​quantity: 1​​​
        * smartPart: "GAT41018"
        * */
        /*
        *  -> manual part
        * description: "test"
        * number: "test"
        * quantity: 3
        *
        * */
        let number
        let smartPart
        let nsid
        let manual
        if (part._id !== undefined) {
            number = part.MPN
            smartPart = part.componentName
            nsid = part.netsuiteId
            manual = false
        } else {
            number = part.number
            smartPart = part.number
            nsid = 0
            manual = true
        }
        const woPart = {
            vendor:      '',
            number:      number,
            isWarranty:  false,
            isBillable:  false,
            isManual:    manual,
            quantity:    0,
            smartPart:   smartPart,
            laborCode:   '',
            cost:        0,
            description: part.description,
            netsuiteId:  nsid
        }
        let canAdd = true
        this.selectedPartsObjs.forEach((part) => {
            if ((part.netsuiteId !== undefined && part.netsuiteId !== null && part.netsuiteId !== 0 &&
                part.netsuiteId !== '') &&
                (woPart.netsuiteId !== undefined && woPart.netsuiteId !== null && woPart.netsuiteId !== 0 &&
                    woPart.netsuiteId !== '')) {
                if (part.netsuiteId === woPart.netsuiteId) {
                    canAdd = false
                }
            } else {
                if (part.number === woPart.number) {
                    canAdd = false
                }
            }
        })
        if (canAdd) {
            this.toCb((wo, du, u, state) => {
                this.timeout(() => {
                    // this.selectedPartsObjs.push(woPart)
                    wo.parts.push(woPart)
                })
            })
        }
    }

    openManualPartModal() {
        this.clearSearch()
        this.modalInstance = this.modal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/woManualAddModal.html',
            controller:  'AddPartEditModalCtrl',
        })

        this.modalInstance.result
            .then((part) => {
                this.clearSearchPhraseAndSelect(part)
            })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woParts', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woParts.html',
        bindings:    {
            callBack:  '&',
            state:     '<',
            parts:     '<',
            workorder: '<',
            disabled:  '<',
        },
        controller:  ['$scope', '$timeout', '$uibModal', woParts],
    })
