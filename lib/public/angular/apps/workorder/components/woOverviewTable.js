class WorkOrderOverviewTableCtrl {
    constructor ($window, $cookies, $uibModal, SessionService, TimeDisplayService, DateService, WorkOrders) {
        // Initialize all variables on component
        this.$window = $window
        this.$cookies = $cookies
        this.modal = $uibModal
        this.TDS = TimeDisplayService
        this.SS = SessionService
        this.DS = DateService
        this.dbWorkorders = WorkOrders

        this.orderByField = 'epoch'
        this.reverseSort = true
        this.unitNumber = this.SS.get('unitNumber') ? this.SS.get('unitNumber') : null
        this.techName = null
        this.type = null
        this.pm = false
        this.pmNa = true
        this.leaseName = null
        this.customerName = null
        this.billable = null
        this.billed = null
        this.billParts = null
        this.unapproved = false
        this.approved = false
        this.synced = false
        this.limit = 50
        this.skip = 0
        this.open = false
        this.pad = this.TDS.pad
        this.searchSupervisor = null
        this.role = 'admin'
        this.dates = {
            from:      null,
            to:        null,
            fromInput: null,
            toInput:   null,
        }
    }

    // -------------------------------------------------

    // set wo times for auto sync ----------------------
    setSave (wo) {
        /**
         * wo.timeStarted is the only time set to
         * displayLocal so it is the only time that
         * needs to be reset back to Orion time.
         * SEE: WorkOrderCtrl -> mapWorkorders func
         */
        if (wo.timeStarted) {
            wo.timeStarted = this.DS.saveToOrion(new Date(wo.timeStarted))
        }
    }

    // the only time that is displayed and used for sorting
    setDisplay (wo) {
        if (wo.timeStarted) {
            wo.timeStarted = this.DS.displayLocal(new Date(wo.timeStarted))
        }
    }

    // -------------------------------------------------

    // Initialize original state -----------------------
    $onInit () {
        this.role = this.$cookies.get('role')
        if (!this.SS.get('unitNumber')) {
            if (this.role === 'admin') {
                this.approved = true
                this.reverseSort = true
            }
            if (this.role === 'manager') {
                this.unapproved = true
                this.reverseSort = false
            }
        }

        this.submit()
    };

    // -------------------------------------------------

    clicked () {
        this.role = this.$cookies.get('role')
        if (this.role === 'admin') {
            this.approved = true
            this.unapproved = true
            this.synced = true
            this.reverseSort = true
            this.open = !this.open
        }
    }

    // Search Changes ----------------------------------
    changeTextField (changedData, selected) {
        this.onTextFieldChange({changedData, selected})
    }

    changeCheckBox (changedData, selected) {
        this.onCheckBoxChange({changedData, selected})
    }

    // -------------------------------------------------

    // Get start and end of Day ------------------------
    startOfDay (input) {
        this.dates.fromInput = input
        if (typeof input === 'object' && input !== null) {
            this.dates.from = new Date(new Date(input).setHours(0, 0, 0, 0))
        }
        if (input === null) {
            this.dates.from = null
        }
    };

    endOfDay (input) {
        this.dates.toInput = input
        if (typeof input === 'object' && input !== null) {
            this.dates.to = new Date(new Date(input).setHours(23, 59, 59, 999))
        }
        if (input === null) {
            this.dates.to = null
        }
    };

    // -------------------------------------------------
    // Can Sync checker --------------------------------
    canSyncWO (wo) {
        if (wo.billingInfo.billableToCustomer) {
            wo.canSync = false
        }
        // don't sync if wo is in this month
        const woMonth = wo.timeStarted.getMonth()
        if (woMonth === new Date().getMonth()) {
            wo.canSync = false
        }
    };

    // -------------------------------------------------

    // sync individual wo ------------------------------
    syncWO (wo) {
        return new Promise((resolve, reject) => {
            this.dbWorkorders.update({}, wo,
                (res) => {
                    // reset wo time to display time
                    // not the res. the wo passed in
                    // by reference
                    this.setDisplay(wo)
                    resolve(wo)
                },
                (err) => {
                    console.log(err)
                    // make sure to at least show an error
                    // in console.
                    return reject(err)
                })
        })
    }

    // -------------------------------------------------

    // Sync all Searched open modal warning ------------
    SyncAllSearched () {
        const modalInstance = this.modal.open({
            templateUrl: '/lib/public/angular/apps/workorder/views/modals/submitAllWarning.html',
            controller:  'SubmitAllModalCtrl',
        })

        /**
         * If user agrees to sync then this will execute
         */
        modalInstance.result.then(() => {
            // set should sync or not here
            const promises = []
            this.workorders.forEach((wo) => {
                wo.canSync = true
                this.canSyncWO(wo)
            })
            this.workorders.forEach((wo) => {
                if (wo.canSync) {
                    this.setSave(wo)
                    wo.netsuiteSyned = true
                    promises.push(this.syncWO(wo))
                }
            })
            Promise.all(promises)
                   .then((res) => {
                       console.log(res)
                       if (this.$window.confirm('Success fully synced all')) {
                           this.$window.location.reload()
                       } else {
                           this.$window.location.reload()
                       }
                   })
                   .catch((err) => {
                       if (this.$window.confirm(err)) {
                           this.$window.location.reload()
                       } else {
                           this.$window.location.reload()
                       }
                   })
        })
    }

    // -------------------------------------------------

    // Submit query to parent controller ---------------
    submit () {
        console.log('submit')
        this.limit = 50
        this.skip = 0

        const query = {
            limit: this.limit,
            skip:  this.skip,
        }

        if (this.dates.from && this.dates.to) {
            query.from = this.DS.saveToOrion(this.dates.from)
            query.to = this.DS.saveToOrion(this.dates.to)
        }
        if (this.endTime || this.startTime) {
            query.from = this.startTime
                ? new Date(this.startTime)
                : this.DS.saveToOrion(this.dates.from)
            query.to = this.endTime ? new Date(this.endTime) : (this.dates.to
                ? this.DS.saveToOrion(this.dates.to)
                : this.DS.saveToOrion(new Date()))
        }

        if (this.pmNa === false) {
            query.pm = this.pm
        }
        if (this.type) {
            query.type = this.type
        }
        if (this.unitNumber && (this.unitNumber === this.SS.get('unitNumber'))) {
            query.unit = this.unitNumber
        } else if (this.unitNumber !== this.SS.get('unitNumber')) {
            query.unit = this.unitNumber
            this.SS.drop('unitNumber')
        } else {
            this.SS.drop('unitNumber')
        }
        if (this.techId || this.techName) {
            this.techName = this.techId ? this.techId : this.techName.toUpperCase()
            query.tech = this.techName
        }
        if (this.leaseName) {
            query.loc = this.leaseName
        }
        if (this.searchSupervisor) {
            query.searchSupervisor = this.searchSupervisor.toUpperCase()
        }
        if (this.customerName) {
            query.cust = this.customerName
        }
        if (this.billed) {
            query.billed = this.billed
        }
        if (this.billable) {
            query.billable = this.billable
        }
        if (this.billParts) {
            query.billParts = this.billParts
        }
        if (this.unapproved || this.techId) {
            query.unapproved = this.techId ? true : this.unapproved
        }
        if (this.approved || this.techId) {
            query.approved = this.techId ? true : this.approved
        }
        if (this.synced || this.techId) {
            query.synced = this.techId ? true : this.synced
        }
        if (this.woType) {
            query.type = this.woType
        }

        console.log(query)
        this.contentSearch({query})
    };

    // -------------------------------------------------

    // Get Time Report of searched users ---------------
    report (type) {
        this.reportText = 'Loading...'
        this.reportDisabled = true

        const query = {}

        if (this.dates.from && this.dates.to) {
            query.from = this.DS.saveToOrion(this.dates.from)
            query.to = this.DS.saveToOrion(this.dates.to)
        }
        if (this.endTime || this.startTime) {
            query.from = this.startTime ? new Date(this.startTime) : this.DS.saveToOrion(this.dates.from)
            query.to = this.endTime ? new Date(this.endTime) : (this.dates.to
                ? this.DS.saveToOrion(this.dates.to)
                : this.DS.saveToOrion(new Date()))
        }
        /*
          if(this.unitNumber) {
            query.unit = this.unitNumber.toString();
          }
          if(this.techName) {
            query.tech = this.techName.toUpperCase();
          }*/
        if (this.pmNa === false) {
            query.pm = this.pm
        }
        if (this.type) {
            query.type = this.type
        }
        if (this.unitNumber && (this.unitNumber === this.SS.get('unitNumber'))) {
            query.unit = this.unitNumber
        } else if (this.unitNumber !== this.SS.get('unitNumber')) {
            query.unit = this.unitNumber
            this.SS.drop('unitNumber')
        } else {
            this.SS.drop('unitNumber')
        }
        if (this.techId || this.techName) {
            this.techName = this.techId ? this.techId : this.techName.toUpperCase()
            query.tech = this.techName
        }
        if (this.leaseName) {
            query.loc = this.leaseName.toString()
        }
        if (this.customerName) {
            query.cust = this.customerName.toString()
        }
        if (this.searchSupervisor) {
            query.searchSupervisor = this.searchSupervisor.toUpperCase()
        }
        if (this.billed) {
            query.billed = this.billed
        }
        if (this.billable) {
            query.billable = this.billable
        }
        if (this.billParts) {
            query.billParts = this.billParts
        }
        if (this.unapproved || this.techId) {
            query.unapproved = this.techId ? true : this.unapproved
        }
        if (this.approved || this.techId) {
            query.approved = this.techId ? true : this.approved
        }
        if (this.synced || this.techId) {
            query.synced = this.techId ? true : this.synced
        }
        if (this.woType) {
            query.type = this.woType
        }

        if (type === 'payrollDump') {
            this.payrollReport({query})
        } else if (type === 'woDump') {
            this.woDumpReport({query})
        } else if (type === 'woPartsDump') {
            this.woPartsDumpReport({query})
        }
    };
    // -------------------------------------------------

    // Sorting for Table -------------------------------
    resort (by) {
        this.orderByField = by
        this.reverseSort = !this.reverseSort
    };

    // -------------------------------------------------

    // Set billable background color for workorders
    setBillableBackgroundColor (wo) {
        if (wo.parts.length > 0) {
            const partBillable = wo.isPartBillable.color
            if (wo.billingInfo.billableToCustomer || (partBillable === '#a4cf80')) return '#a4cf80'
        } else {
            if (wo.billingInfo.billableToCustomer) return '#a4cf80'
        }
    };

    // -------------------------------------------------

    clearText (selected) {
        switch (selected) {
            case 'unitNumber':
                this.unitNumber = null
                break
            case 'leaseName':
                this.leaseName = null
                break
            case 'techName':
                this.techName = null
                break
            case 'customerName':
                this.customerName = null
                break
            case 'searchSupervisor':
                this.searchSupervisor = null
                break
            case 'type':
                this.type = null
                break
        }
    }

    // Routing to work order ---------------------------
    clickWorkOrder (wo) {
        this.$window.open('#/workorder/view/' + wo._id)
    };

    // -------------------------------------------------

}

angular.module('WorkOrderApp.Components')
       .component('woOverviewTable', {
           templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woOverviewTable.html',
           bindings:    {
               payrollReport:     '&',
               woDumpReport:      '&',
               woPartsDumpReport: '&',
               contentSearch:     '&',
               onTextFieldChange: '&',
               onCheckBoxChange:  '&',
               woSearchCount:     '<',
               reportDisabled:    '<',
               workorders:        '<',
               startTime:         '<',
               endTime:           '<',
               woType:            '<',
               techId:            '<',
           },
           controller:  ['$window', '$cookies', '$uibModal', 'SessionService', 'TimeDisplayService', 'DateService', 'WorkOrders', WorkOrderOverviewTableCtrl],
    });




/*
angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);

function clearSearch() {

  //let elements = [] ;
  const elements = document.getElementsByClassName("search");

  for(let i=0; i<elements.length ; i++){
    elements[i].value = "" ;
  }
}
*/
