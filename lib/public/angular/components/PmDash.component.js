angular.module('CommonComponents').component('pmDash', {
    templateUrl: '/lib/public/angular/views/component.views/pmReport.html',
    bindings: {
        units: '<',
        users: '<',
        unapproved: '<',
    },
    controller: [
        '$timeout',
        '$location',
        'PmDashService',
        'SessionService',
        class PmDashCtrl {
            // Create values to be shown --------------------------
            constructor ($timeout, $location, PmDashService, SessionService) {
                this.$timeout = $timeout;
                this.$location = $location;
                this.PMS = PmDashService;
                this.SS = SessionService;

                this.activePMStatus = 0;
                this.activeUnitPMStatus = 0;
                this.active = 0;
                this.test = 0;
                this.idle = 0;
                this.total = 0;
                this.activeReg = new RegExp('Active', 'i')
                this.testReg = new RegExp('Test', 'i')
                this.idleReg = new RegExp('Idle', 'i')
                this.soldReg = new RegExp('Sold', 'i')

                this.areas = [];
                this.activeUnits = [];
                this.userAreas = [];
                this.fullNameAreas = [];
                this.displayUsers = [];
                this.sortReverse = false;
                this.sortType = 'percent';

                // lifecycle check
                this.didCheck = false;
            }

            // ----------------------------------------------------

            // Init values ----------------------------------------
            $onInit () {
                // fill all areas from users to be shown. Don't need Corporate
                this.users.forEach((user) => {
                    if (user.area && user.email) {
                        const thisUser = this.newUser();
                        thisUser.username = user.username;
                        thisUser.area = user.area.split(':')[0].slice(2).trim();
                        if (user.hasOwnProperty('hours')) {
                            thisUser.totalHours = +user.hours.total;
                        }
                        const area = user.area.split(':')[0].slice(2).trim();
                        this.displayUsers.push(thisUser);

                        if (this.userAreas.indexOf(area) === -1 && area !==
                            'CORPORATE') {
                            this.userAreas.push(area);
                            this.fullNameAreas.push(user.area);
                            // Create list of areas
                            const thisArea = this.newArea();
                            thisArea.locationName = area;
                            this.areas.push(thisArea);
                        }
                    }
                });

                this.areas.forEach((area) => {
                    this.displayUsers.forEach((user) => {
                        if (area.locationName === user.area) {
                            area.users.push(user);
                        }
                    });
                });

                // for each area map users and get associated units and users.
                this.areas.forEach((area) => {
                    let areaAvg = 0.00;
                    let userCount = 0;
                    const areaUnits = [];
                    area.users.forEach((user) => {
                        if (user.hasOwnProperty('totalHours')) {
                            if (+user.totalHours !== 0.00) {
                                userCount += 1;
                                areaAvg += +user.totalHours;
                            }
                        }
                        const thisUsersUnits = [];
                        // get all units for this user and add them to array
                        this.units.forEach((unit) => {
                            if (unit.assignedTo === user.username) {
                                thisUsersUnits.push(unit);
                                areaUnits.push(unit);
                                if (unit.status.match(this.activeReg)) {
                                    user.activeUnits += 1;
                                } else if (unit.status.match(this.testReg)) {
                                    user.testUnits += 1;
                                } else if (unit.status.match(this.idleReg)) {
                                    user.idleUnits += 1;
                                }
                            }
                        });
                        // push 1 or 0 into a new array to get a percentage.
                        // depends on unit nextPM time
                        if (thisUsersUnits.length > 0) {
                            // areaPercentages.push(this.PMS.returnUnitsPmPercent(thisUsersUnits));
                            user.percent = +(this.PMS.returnUnitsPmPercent(
                                thisUsersUnits) * 100).toFixed(2);
                        }
                        const activeUnits = this.PMS.returnActiveUnits(
                            thisUsersUnits);
                        const idleUnits = this.PMS.returnIdleUnits(
                            thisUsersUnits);
                        area.idleUnits += idleUnits.length;
                        area.activeUnits += activeUnits.length;
                    });

                    const afterFilter = area.users.filter((obj) => {
                        if (obj.idleUnits === 0 && obj.activeUnits === 0) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                    // get percent of area
                    if (areaUnits.length > 0) {
                        area.unitPercent = +(this.PMS.returnUnitsPmPercent(
                            areaUnits) * 100).toFixed(0);
                    }
                    // avg out the area avg total hours
                    area.areaAvg = (areaAvg === 0.00)
                        ? +(0.00).toFixed(2)
                        : +(+areaAvg / +userCount).toFixed(2);
                    // calc total area percentages
                    area.percent = +this.PMS.totalPercent(afterFilter)
                        .toFixed(0);
                    if (isNaN(area.percent)) {
                        area.percent = 0
                    }
                });

                // remove area from the list, has no active units
                // const toDelete = new Set([0]);
                // this.areas = this.areas.filter((obj) => !toDelete.has(obj.activeUnits));

                // Set heading information, Total, Idle, Active, Percent
                this.setHeader();
            }

            // ----------------------------------------------------

            // Changes due to async code --------------------------
            $doCheck () {
                if (this.areas.length > 0 && this.unapproved.length > 0 &&
                    this.didCheck === false) {
                    this.didCheck = true;
                    this.areas.forEach((a) => {
                        this.unapproved.forEach((u) => {
                            if (a.locationName === u.area) {
                                a.unapproved = u.count;
                            }
                        });
                    });
                }
            }

            // ----------------------------------------------------

            // Construct visual object for listing. and resort method
            resort (by) {
                this.sortType = by;
                this.sortReverse = !this.sortReverse;
            }

            newArea () {
                return {
                    locationName: '',
                    unapproved: 0,
                    areaAvg: 0.00,
                    idleUnits: 0,
                    activeUnits: 0,
                    unitPercent: 0,
                    users: [],
                    percent: 0,
                };
            }

            newUser () {
                return {
                    username: '',
                    area: '',
                    idleUnits: 0,
                    totalHours: 0.00,
                    activeUnits: 0,
                    testUnits: 0,
                    percent: 0,
                };
            }

            // ----------------------------------------------------

            // Set header information -----------------------------
            setHeader () {
                this.units.forEach((unit) => {
                    if (!unit.status.match(this.soldReg)) {
                        this.total += 1;
                    }
                    if (unit.status.match(this.activeReg)) {
                        this.active += 1;
                    } else if (unit.status.match(this.testReg)) {
                        this.test += 1;
                    } else if (unit.status.match(this.idleReg)) {
                        this.idle += 1;
                    }
                });
                this.activeUnitPMStatus = (this.PMS.totalUnitPercent(
                    this.areas)).toFixed(0);
                this.activePMStatus = (this.PMS.totalPercent(
                    this.areas)).toFixed(0);
            }

            // ----------------------------------------------------

            // Routing --------------------------------------------
            routeToArea (area) {
                const location = area.locationName;
                this.$location.path(`/areapmreport/${location}`);
            }

            // ----------------------------------------------------
        }],
});
