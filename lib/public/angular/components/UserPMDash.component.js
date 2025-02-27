class UserPmDashCtrl {
    // Create values to be shown --------------------------
    constructor(
        $window,
        $timeout,
        $location,
        PmDashService,
        ApiRequestService,
        SessionService
    ) {
        this.$timeout = $timeout;
        this.$window = $window;
        this.$location = $location;
        this.PMS = PmDashService;
        this.ARS = ApiRequestService;
        this.SS = SessionService;
        this.isYard = false;

        this.fullName = "";

        this.activePMStatus = 0;
        this.active = 0;
        this.test = 0;
        this.idle = 0;
        this.total = 0;
        this.totalWorkorders = "..Loading";
        this.totalShownWOs = "..Loading";
        this.indirect = 0;

        this.days = 45;
        this.displayUnits = [];
        this.sortReverse = true;
        this.sortType = "nextPmDate";
        this.supervisor = "";
    }

    // ----------------------------------------------------

    // Init values ----------------------------------------
    $onInit() {
        this.fullName = this.user.firstName
            .concat(" ")
            .concat(this.user.lastName);

        if (this.user.supervisor !== null) {
            this.ARS.Users({ textId: this.user.supervisor })
                .then(res => {
                    if (res.length > 0) {
                        this.supervisor = res[0].firstName
                            .concat(" ")
                            .concat(res[0].lastName);
                    }
                })
                .catch(err => console.log(err));
        } else {
            this.supervisor = "none";
        }
        if (this.fullName.includes("YARD")) {
            this.isYard = true;
        }
    }

    // ----------------------------------------------------

    // On any one way data bound change -------------------
    $onChanges(changes) {
        this.createDisplayUnits(this.units);
        // this.createDisplayUnits(this.units);
        if (changes.hasOwnProperty("workorders")) {
            if (this.workorders) {
                this.totalWorkorders = this.workorders.length;
            }
        }
        if (changes.hasOwnProperty("units")) {
            // call method to rework display units info
            //this.createDisplayUnits(changes.units.currentValue);
            if (this.units) {
                this.setHeader(this.units);
                this.activePMStatus = +(
                    this.PMS.returnUnitsPmPercent(this.units) * 100
                ).toFixed(2);
            }
        }
    }

    // ----------------------------------------------------

    // Set Header -----------------------------------------
    setHeader(units) {
        // Set Header values
        const active = new RegExp("^Active", "i");
        const test = new RegExp("Test", "i");
        const idle = new RegExp("Idle", "i");
        units.forEach(unit => {
            this.total += 1;
            if (unit.status.match(active)) {
                this.active += 1;
            } else if (unit.status.match(test)) {
                this.test += 1;
            } else if (unit.status.match(idle)) {
                this.idle += 1;
            }
        });
    }

    // ----------------------------------------------------

    // Create Display Units from Units --------------------
    createDisplayUnits(units) {
        this.displayUnits = [];
        if (units) {
            units.forEach(unit => {
                const thisUnit = this.newDisplayUnit();
                if (!unit.locationName.includes("YARD")) {
                    thisUnit.customerName =
                        unit.customerName.substr(0, 17) + "...";
                } else {
                    thisUnit.productSeries = +unit.productSeries.substring(5);
                    thisUnit.customerName = unit.productSeries;
                }
                thisUnit.unitNumber = unit.number;
                thisUnit.status = unit.status;
                thisUnit.leaseName = unit.locationName;
                const nextD = new Date(unit.nextPM1Date).getTime();
                const nextd = new Date(unit.nextPmDate).getTime();
                if (nextD > nextd) {
                    thisUnit.nextPmDate = unit.nextPM1Date;
                } else {
                    thisUnit.nextPmDate = unit.nextPmDate;
                }
                thisUnit.nextPM2Date = unit.nextPM2Date;
                thisUnit.nextPM3Date = unit.nextPM3Date;
                thisUnit.nextPM4Date = unit.nextPM4Date;
                thisUnit.nextPM5Date = unit.nextPM5Date;
                thisUnit.engineHP = unit.engineHP;
                if (this.workorders) {
                    this.workorders.forEach(wo => {
                        if (wo.unitNumber && wo.unitNumber === unit.number) {
                            switch (wo.type) {
                                case "PM":
                                    thisUnit.PM += 1;
                                    break;
                                case "Trouble Call":
                                    if (wo.pm) {
                                        thisUnit.PM += 1;
                                    }
                                    break;
                                case "Transfer":
                                    if (wo.pm) {
                                        thisUnit.PM += 1;
                                    }
                                    break;
                                case "Swap":
                                    if (wo.pm) {
                                        thisUnit.PM += 1;
                                    }
                                    break;
                                case "Corrective":
                                    if (wo.pm) {
                                        thisUnit.PM += 1;
                                    }
                                    break;
                            }
                        }
                    });
                } else {
                    thisUnit.PM = 0;
                }
                this.displayUnits.push(thisUnit);
            });
        }
        this.totalShownWOs = 0;
        // fill out total # of shown workorders count
        this.displayUnits.forEach(unit => {
            this.totalShownWOs += unit.PM;
        });
    }

    // ----------------------------------------------------

    // Search & Changes -----------------------------------
    dayChange(changedData) {
        this.days = changedData;
    }

    search() {
        this.totalWorkorders = "...Loading";
        this.updateWorkOrders({ days: this.days });
    }

    // ----------------------------------------------------

    // Construct visual object for listing. and resort ----
    resort(by) {
        this.sortType = by;
        this.sortReverse = !this.sortReverse;
    }

    newDisplayUnit() {
        return {
            unitNumber: "",
            customerName: "",
            leaseName: "",
            PM: 0,
            status: "",
            unitHP: 0,
            nextPmDate: "",
            nextPM2Date: "",
            nextPM3Date: "",
            nextPM4Date: "",
            nextPM5Date: ""
        };
    }

    // ----------------------------------------------------

    // Routing --------------------------------------------
    searchUnits(unit) {
        this.SS.add("unitNumber", unit.unitNumber);
        this.$window.open(`#/workorder`);
    }

    // ----------------------------------------------------
}
angular.module("CommonComponents").component("userPmDash", {
    templateUrl: "/lib/public/angular/views/component.views/userPmDash.html",
    bindings: {
        updateWorkOrders: "&",
        spin: "<",
        loaded: "<",
        user: "<",
        units: "<",
        workorders: "<"
    },
    controller: [
        "$window",
        "$timeout",
        "$location",
        "PmDashService",
        "ApiRequestService",
        "SessionService",
        UserPmDashCtrl
    ]
});
