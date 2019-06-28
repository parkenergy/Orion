class woParts {
    constructor($scope, $timeout) {
        this.scope = $scope
        this.timeout = $timeout

        this.orderByField = 'description'
        this.reverseSort = false

        this.fuse = null
        this.searchPhrase = ''
        this.selectableSearchedParts = []
        this.clearSearch = this.clearSearch.bind(this)
        this.sortPartsForSearch = this.sortPartsForSearch.bind(this)
        this.resort = this.resort.bind(this)
    }

    $doCheck() {
        if (this.searchPhrase.length >= 3) {
            this.selectableSearchedParts = this.fuse
                                               .search(this.searchPhrase)
                                               .slice(0, 100)
        } else {
            this.selectableSearchedParts = []
        }
    }

    $onChanges(ch) {
        if (ch.parts !== undefined && ch.parts.currentValue !== undefined && ch.parts.currentValue.length > 0) {
            this.sortPartsForSearch(this.parts)
        }
    }

    dynamicCB(cb) {
        return (wo, du, hu) => cb(wo, du, hu)
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

    resort(by) {
        this.orderByField = by
        this.reverseSort = !this.reverseSort
    }

    clearSearchPhraseAndSelect(part) {
        this.clearSearch()
        console.log(part)
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woParts', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woParts.html',
        bindings:    {
            callBack:  '&',
            parts:     '<',
            workorder: '<',
            disabled:  '<',
        },
        controller:  ['$scope', '$timeout', woParts],
    })
