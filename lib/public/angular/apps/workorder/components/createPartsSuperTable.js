class createPartSuperTable {
    constructor ($scope, $timeout, Utils) {
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils

        this.orderByField = ''
        this.reverseSort = false

        this.searchedParts = []
        this.initParts = []
        this.searchPhrase = ''

        this.searchPart = this.searchPart.bind(this)
        this.filterParts = this.filterParts.bind(this)
    }

    /**to
     * Static method with generic return method
     * be used to solve issues
     * @param cb
     * @returns {function(*=): *}
     */
    dynamicCB (cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    /**
     * This method is used to send the object with cb
     * to the parent controller. The base method needs
     * to be static but the inards need to be dynamic
     * @param cb - where the cb needs to execute on (wo, du, he) -> (workorder, display unit,
     *   header unit)
     */
    toCb (cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }
    resort(by) {
        this.orderByField = by
        this.reverseSort = !this.reverseSort
    }

    $onChanges(changeObj) {
        if (changeObj.parts !== undefined && !this.utils.isEmpty(changeObj.parts.currentValue) && this.utils.isEmpty(changeObj.parts.previousValue)) {
            this.timeout(() => {
                this.initParts = changeObj.parts.currentValue
            })
        }
    }

    addPart(part) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                const newPart = {
                    vendor: part.vendor ? part.vendor : '',
                    number: part.number ? part.number : '',
                    MPN: part.MPN ? part.MPN : '',
                    smartPart: part.componentName ? part.componentName : '',
                    componentName: part.componentName ? part.componentName : '',
                    description: part.description ? part.description : part.description,
                    quantity: 0,
                    isBillable: false,
                    isWarranty: false,
                    isManual: false,
                    netsuiteId: part.netsuiteId,
                }
                console.log(JSON.stringify(part)); 
                wo.parts.push(newPart)
                this.searchedParts = []
                this.searchPhrase = ''
            })
        })
    }

   filterParts(obj) {
        if (!this.utils.isEmpty(this.searchPhrase) && this.searchPhrase.length >= 3) {
            const pattern2 = new RegExp(this.searchPhrase, 'i');
            const mpn = obj.MPN ? obj.MPN : '';
            const desc = obj.description ? obj.description : '';
            const compN = obj.componentName ? obj.componentName : '';
            const full = `${mpn} ${desc} ${compN}`;
            const pattern = new RegExp( '(?=.*\\b' + this.searchPhrase.split(' ').join('\\b)(?=.*\\b') + '\\b)', 'i');
            if (mpn.match(pattern) || desc.match(pattern) || compN.match(pattern) || full.match(pattern) || mpn.match(pattern2) || desc.match(pattern2) || compN.match(pattern2) || full.match(pattern2)) {
                return true;
            }
        } else {
            return false
        }
    }
    searchPart(input) {
        if (!this.utils.isEmpty(input) && input.length >= 3) {
            this.timeout(() => {
                this.searchedParts = this.initParts.filter(this.filterParts)
            })
        }
    }
}


angular
    .module('WorkOrderApp.Components')
    .component('createPartSuperTable', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/partsSuperTable.html',
        bindings: {
            callBack: '&',
            workorder: '<',
            parts: '<',
        },
        controller: ['$scope', '$timeout', 'Utils', createPartSuperTable]
    })
