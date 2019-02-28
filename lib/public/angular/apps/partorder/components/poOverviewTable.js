class PoOverviewCtrl {
    constructor ($window, $timeout, LocationItemService, DateService) {
        this.$timeout = $timeout
        this.$window = $window
        this.LIS = LocationItemService
        this.DS = DateService

        this.sortType = 'epoch'
        this.sortReverse = false
        this.searchFilter = ''
        this.isLoaded = false

        // query params
        this.username = null
        this.destination = null
        this.pending = true
        this.backorder = true
        this.ordered = true
        this.completed = false
        this.canceled = false
        this.limit = 50
        this.skip = 0
        this.allChecked = false

        this.dates = {
            from:      null,
            fromInput: null,
            to:        null,
            toInput:   null,
        }
        this.changeAllCheckBoxes = this.changeAllCheckBoxes.bind(this)
        this.changeThisCheckbox = this.changeThisCheckbox.bind(this)
        this.routeToPartOrder = this.routeToPartOrder.bind(this)
    }

    // Initializes original search ---------------------
    $onInit () {
        this.submit()
    };

    // -------------------------------------------------

    // Sorting for Table -------------------------------
    resort (by) {
        this.sortType = by
        this.sortReverse = !this.sortReverse
    };

    // -------------------------------------------------

    // Get start and end of Day ------------------------
    postartOfDay (input) {
        this.dates.fromInput = input
        if (typeof input === 'object') {
            this.dates.from = new Date(new Date(input).setHours(0, 0, 0, 0))
        }
    };

    poendOfDay (input) {
        this.dates.toInput = input
        if (typeof input === 'object') {
            this.dates.to = new Date(new Date(input).setHours(23, 59, 59, 999))
        }
    };

    // -------------------------------------------------

    changeThisCheckbox (selected) {
        this.listIt({po: selected})
    };

    // Query Constructor -------------------------------
    queryConstruct (limit, skip) {
        const query = {
            limit: limit,
            skip:  skip,
        }

        // gather query params
        if (this.dates.from && this.dates.to) {
            query.from = this.DS.saveToOrion(this.dates.from)
            query.to = this.DS.saveToOrion(this.dates.to)
        }
        if (this.username) {
            query.techId = this.username.toUpperCase()
        }
        if (this.destination) {
            query.destination = this.LIS.getTruckFromString(this.destination, this.locations).netsuiteId
        }
        if (this.pending) {
            query.pending = this.pending
        }
        if (this.ordered) {
            query.ordered = this.ordered
        }
        if (this.backorder) {
            query.backorder = this.backorder
        }
        if (this.canceled) {
            query.canceled = this.canceled
        }
        if (this.completed) {
            query.completed = this.completed
        }

        return query
    };

    // -------------------------------------------------

    // Load content on scroll from Parent Controller ---
    loadOnScroll () {
        console.log('Scrolling...')
        this.skip += this.limit

        const query = this.queryConstruct(this.limit, this.skip)
        this.scrollContentSearch({query})
    };

    // -------------------------------------------------

    // Submit Query to Parent Controller ---------------
    submit () {
        this.limit = 50
        this.skip = 0

        const query = this.queryConstruct(this.limit, this.skip)
        this.contentSearch({query})
    };

    // -------------------------------------------------

    // Submit Query to get Report to Parent Controller -
    getReport () {
        const query = this.queryConstruct(this.limit, this.skip)

        query.report = true

        this.getPartOrderReport({query})
    };

    // -------------------------------------------------

    // clear -------------------------------------------
    clearText (selected) {
        switch (selected) {
            case 'username':
                this.username = null
                break
            case 'destination':
                this.destination = null
                break
        }
    }

    // -------------------------------------------------

    // Routing -----------------------------------------
    changeAllCheckBoxes () {
        this.allChecked = !!this.allChecked
        const pos = this.partorders.reduce((acc, po) => {
            return acc.concat(po._id)
        }, [])
        this.$window.open('#/partorder/editMany/' + JSON.stringify(pos))
    }

    routeToPartOrder (po) {
        if (!po.inList) {
            if (po.status !== 'canceled' && po.status !== 'completed') {
                this.$window.open('#/partorder/edit/' + po.orderId)
            } else {
                this.$window.open('#/partorder/review/' + po.orderId)
            }
        } else {
            const pos = []
            this.partorders.forEach((p) => {
                if (p.inList) {
                    pos.push(p._id)
                }
            })
            if (po.inList) {
                this.$window.open('#/partorder/editMany/' + JSON.stringify(pos))
            }
        }
    };

    // -------------------------------------------------

}
angular.module('PartOrderApp.Components')
       .component('poOverviewTable', {
           templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poOverviewTable.html',
           bindings:    {
               partorders:          '<',
               locations:           '<',
               poSearchCount:       '<',
               listIt:              '&',
               scrollContentSearch: '&',
               getPartOrderReport:  '&',
               contentSearch:       '&',
           },
           controller:  ['$window', '$timeout', 'LocationItemService', 'DateService', PoOverviewCtrl],
       });
