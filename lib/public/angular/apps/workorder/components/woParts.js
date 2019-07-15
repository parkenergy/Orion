class woParts {
    constructor($scope, $timeout) {
        this.scope = $scope
        this.timeout = $timeout

        this.orderByFieldSelect = 'description'
        this.orderByFieldResult = 'description'
        this.reverseSortSelect = false
        this.reverseSortResult = false

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
            console.log('change made')
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
                                console.log(code.text)
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
        /*
        MPN: "FC0120GI"
        __v: 0
        _id: "5bca7ea27f3179041ed0e032"
        componentName: "FC0120GI"
        description: "12 POINT CAPSCREW 1/2-13X1 1/2 G8"​
        isSynced: true
        netsuiteId: 10223
        */
        const number = part.MPN
        const smartPart = part.componentName
        const nsid = part.netsuiteId
        const woPart = {
            vendor:      '',
            number:      number,
            isWarranty:  false,
            isBillable:  false,
            isManual:    false,
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
        controller:  ['$scope', '$timeout', woParts],
    })
