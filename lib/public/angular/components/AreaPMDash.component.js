angular.module("CommonComponents").component("areaPmDash", {
    templateUrl: "/lib/public/angular/views/component.views/areaPmDash.html",
    bindings: {
        units: "<",
        users: "<",
        areaName: "<"
    },
    controller: [
        "$location",
        "$timeout",
        "PmDashService",
        class AreaPmDashCtrl {
            // Create values to be shown --------------------------
            constructor($location, $timeout, PmDashService) {
                this.$location = $location;
                this.$timeout = $timeout;
                this.PMS = PmDashService;

                this.init = null;

                this.activePMStatus = 0;
                this.active = 0;
                this.test = 0;
                this.idle = 0;
                this.total = 0;
                this.activeReg = new RegExp("^Active", "i");
                this.testReg = new RegExp("Test", "i");
                this.idleReg = new RegExp("Idle", "i");

                this.usersUnits = [];
                this.displayUsers = [];
                this.activeUnits = [];
                this.usernames = [];
                this.sortReverse = false;
                this.sortType = "percent";
            }

            // ----------------------------------------------------

            setDisplayUnapproved() {
                this.displayUsers.forEach(du => {
                    this.users.forEach(user => {
                        if (du.username === user.username) {
                            // unapprovedCount added in super ctrl
                            du.unapproved = user.unapprovedCount;
                        }
                    });
                });
            }

            // Init values ----------------------------------------
            $onInit() {
                // get usernames from list of users and fill full name
                this.users.forEach(user => {
                    this.usernames.push(user.username);
                    // create new user display object
                    const thisUser = this.newDisplayUser();
                    if (user.hasOwnProperty("hours")) {
                        thisUser.totalHours = user.hours.total;
                    }
                    thisUser.username = user.username;
                    thisUser.name = user.firstName
                        .concat(" ")
                        .concat(user.lastName);
                    if (user.email) {
                        this.displayUsers.push(thisUser);
                    }
                });
                // for each user map through and add to users units
                this.displayUsers.forEach(user => {
                    this.units.forEach(unit => {
                        if (unit.assignedTo === user.username) {
                            this.usersUnits.push(unit);
                        }
                    });
                });

                // for each user map through associated units
                this.displayUsers.forEach(user => {
                    const thisUsersUnits = [];
                    // get all units for this user and add them to array
                    this.usersUnits.forEach(unit => {
                        if (unit.assignedTo === user.username) {
                            this.total += 1;
                            thisUsersUnits.push(unit);
                            if (unit.status.match(this.activeReg)) {
                                this.active += 1;
                                user.activeUnits += 1;
                            } else if (unit.status.match(this.testReg)) {
                                this.test += 1;
                                user.testUnits += 1;
                            } else if (unit.status.match(this.idleReg)) {
                                this.idle += 1;
                                user.idleUnits += 1;
                            }
                        }
                    });
                    // calc total user percentage
                    if (thisUsersUnits.length > 0) {
                        if (user.activeUnits === 0) {
                            user.percent = -1;
                        } else {
                            user.percent = +(
                                this.PMS.returnUnitsPmPercent(thisUsersUnits) *
                                100
                            ).toFixed(2);
                        }
                    } else {
                        user.percent = -1;
                    }
                });
                // remove user from list, has no active units or idle units
                /*this.displayUsers = this.displayUsers.filter((obj) => {
                    if (obj.idleUnits === 0 && obj.activeUnits === 0) {
                        return false;
                    } else {
                        return true;
                    }
                });*/

                // set activePMstatus for all users
                this.activePMStatus = this.PMS.totalPercent(
                    this.displayUsers
                ).toFixed(0);
                if (isNaN(this.activePMStatus)) {
                    this.activePMStatus = 0;
                }
            }
            // ----------------------------------------------------

            $doCheck() {
                if (
                    this.users[0].hasOwnProperty("unapprovedCount") &&
                    this.init === null
                ) {
                    this.$timeout(() => {
                        this.setDisplayUnapproved();
                    });
                    this.init = true;
                }
            }

            // Construct visual object for listing. and resort method
            resort(by) {
                this.sortType = by;
                this.sortReverse = !this.sortReverse;
            }

            newDisplayUser() {
                return {
                    username: "",
                    name: "",
                    unapproved: 0,
                    idleUnits: 0,
                    totalHours: 0.0,
                    activeUnits: 0,
                    testUnits: 0,
                    percent: 0
                };
            }

            // ----------------------------------------------------

            // Routing --------------------------------------------
            routeToUser(user) {
                const username = user.username;
                this.$location.url(
                    `/areapmreport/${this.areaName}/${username}`
                );
            }

            // ----------------------------------------------------
        }
    ]
});
