angular.module("Orion.Controllers", []);
angular.module("Orion.Components", []);
angular.module("Orion.Directives", []);
angular.module("CommonControllers", []);
angular.module("CommonComponents", []);
angular.module("CommonDirectives", []);
angular.module("CommonServices", ["ngRoute", "ngResource", "ngCookies"]);
angular.module("Orion.Services", [
    "ngRoute",
    "ngResource",
    "ngCookies",
    "ui.utils"
]);
//  *********test uri

function getRedirectUri(uri) {
	try {
    return (!isUndefined(uri))
      ? ("" + ($window.location.origin) + uri)
      : $window.location.origin
  } catch (e) {}

  return uri || null;
}


angular.module("Orion", [
    "CommonControllers",
    "CommonComponents",
    "CommonDirectives",
    "CommonServices",
    "Orion.Controllers",
    "Orion.Components",
    "Orion.Directives",
    "Orion.Services",
    "UnitApp",
    "InventoryTransfersApp",
    "PartOrderApp",
    "CallReportApp",
    "WorkOrderApp",
    "MCDiligenceApp",
    "ui.bootstrap",
    "ui.utils",
    "satellizer"
]);

angular
    .module("Orion")
    .config([
        "$routeProvider",
        "$authProvider",
        function($routeProvider, $authProvider) {
            $routeProvider

                .when("/", {
                    controller: "LoginCtrl",
                    templateUrl:
                        "/lib/public/angular/views/controller.views/clientLogin.html"
                })

                .when("/myaccount", {
                    needsLogin: true,
                    controller: "MyAccountCtrl",
                    templateUrl:
                        "/lib/public/angular/views/controller.views/myaccount.html",
                    resolve: {
                        users: function($route, $q, Users) {
                            return Users.query({ size: 100000 }).$promise;
                        },
                        units: function($route, $q, Units) {
                            return Units.query({ size: 100000 }).$promise;
                        }
                    }
                })

                .when("/areapmreport/:name", {
                    needsLogin: true,
                    controller: "AreaPMReportCtrl",
                    templateUrl:
                        "/lib/public/angular/views/controller.views/areapmreport.html",
                    resolve: {
                        users: function($route, $q, Users) {
                            let locationName = $route.current.params.name;
                            return Users.query({
                                regexArea: locationName,
                                size: 100000
                            }).$promise;
                        },
                        units: function($route, $q, Units) {
                            return Units.query({ size: 100000 }).$promise;
                        },
                        areaName: function($route) {
                            return $route.current.params.name;
                        }
                    }
                })

                .when("/areapmreport/:name/:user", {
                    needsLogin: true,
                    controller: "UserPMReportCtrl",
                    templateUrl:
                        "/lib/public/angular/views/controller.views/userpmreport.html",
                    resolve: {
                        users: function($route, $q, Users) {
                            let username = $route.current.params.user;
                            return Users.query({ userName: username }).$promise;
                        }
                    }
                });
//  redirectUri: window.location.origin,    ***********  getRedirectUri(),
            $authProvider.google({
                url: "/auth/google",
                authorizationEndpoint:
                    "https://accounts.google.com/o/oauth2/auth",
                redirectUri: window.location.origin,//"http://orion.parkenergyservices.com/#/",
                requiredUrlParams: ["scope"],
                optionalUrlParams: ["display"],
                scope: ["profile", "email"],
                scopePrefix: "openid",
                scopeDelimiter: " ",
                display: "popup",
                type: "2.0",
                setApprovalPrompt: "force",
                popupOptions: { width: 452, height: 833 },
                clientId:
                    "24229647507-pvt4ttv086umiomjpgv7f1r2d5rc9nr7.apps.googleusercontent.com",
                client_secret: "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",
                responseType: "token"
            });
            // clientId:                     "402483966217-5crk767d69pcn25dhds4htv3o67kdpuc.apps.googleusercontent.com",
//                client_secret: "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",
            $authProvider.httpInterceptor = function() {
                return true;
            };
            $authProvider.withCredentials = true;
            $authProvider.tokenRoot = null;
            $authProvider.baseUrl = "/";
            $authProvider.loginUrl = "/auth/login";
$authProvider.tokenPath = "access_token"; 
            $authProvider.signupUrl = "/auth/signup";
            $authProvider.unlinkUrl = "/auth/unlink/";
            $authProvider.tokenName = "token";
            $authProvider.tokenPrefix = "satellizer";
            $authProvider.authHeader = "Authorization";
            $authProvider.authToken = "Bearer";
            $authProvider.storageType = "localStorage";
        }
    ])
    .factory("authProvider", [
        "$cookies",
        "$location",
        "SessionService",
        function($cookies, $location, SessionService) {
            return {
                isLoggedIn: function() {
                    const currentPath = $location.path();
                    const SS = SessionService;

                    if (
                        !$cookies.get("tech") ||
                        !localStorage.getItem("satellizer_token") ||
                        !SS.get("loggedIn")
                    ) {
                        if (currentPath !== "/") {
                            SS.add("loggedIn", true);
                            $cookies.put("OrionNotLoggedInRoute", currentPath);
                        }
                        return false;
                    } else {
                        return true;
                    }
                }
            };
        }
    ])
    .run([
        "$rootScope",
        "$location",
        "authProvider",
        function($rootScope, $location, authProvider) {
            $rootScope.$on("$routeChangeStart", function(event) {
                const currentPath = $location.path();
                const regex = new RegExp("/wpi", "i");
                if (!regex.test(currentPath)) {
                    if (!authProvider.isLoggedIn()) {
                        // event.preventDefault();
                        $location.path("/");
                    } else {
                        console.log("here?");
                    }
                }
            });
        }
    ]);

/* Handle errors from the server side
  ----------------------------------------------------------------------------- */
// angular.module('Orion').config(['$httpProvider',
// function ($httpProvider) {
//   $httpProvider.interceptors.push('Handler401');
// }]);

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

class PmDashCtrl {
    // Create values to be shown --------------------------
    constructor($timeout, $location, PmDashService, SessionService) {
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
        this.activeReg = new RegExp("^Active", "i");
        this.testReg = new RegExp("Test", "i");
        this.idleReg = new RegExp("Idle", "i");
        this.soldReg = new RegExp("Sold", "i");
        this.saleReg = new RegExp("Sale", "i");

        this.areas = [];
        this.activeUnits = [];
        this.userAreas = [];
        this.fullNameAreas = [];
        this.displayUsers = [];
        this.sortReverse = false;
        this.sortType = "percent";

        // lifecycle check
        this.didCheck = false;
    }

    // ----------------------------------------------------

    // Init values ----------------------------------------
    $onInit() {
        // fill all areas from users to be shown. Don't need Corporate
        this.users.forEach(user => {
            if (user.area && user.email) {
                const thisUser = this.newUser();
                thisUser.username = user.username;
                thisUser.area = user.area
                    .split(":")[0]
                    .slice(2)
                    .trim();
                if (user.hasOwnProperty("hours")) {
                    thisUser.totalHours = +user.hours.total;
                }
                const area = user.area
                    .split(":")[0]
                    .slice(2)
                    .trim();
                this.displayUsers.push(thisUser);

                if (
                    this.userAreas.indexOf(area) === -1 &&
                    area !== "CORPORATE"
                ) {
                    this.userAreas.push(area);
                    this.fullNameAreas.push(user.area);
                    // Create list of areas
                    const thisArea = this.newArea();
                    thisArea.locationName = area;
                    this.areas.push(thisArea);
                }
            }
        });

        this.areas.forEach(area => {
            this.displayUsers.forEach(user => {
                if (area.locationName === user.area) {
                    area.users.push(user);
                }
            });
        });

        // for each area map users and get associated units and users.
        this.areas.forEach(area => {
            let areaAvg = 0.0;
            let userCount = 0;
            const areaUnits = [];
            area.users.forEach(user => {
                if (user.hasOwnProperty("totalHours")) {
                    if (+user.totalHours !== 0.0) {
                        userCount += 1;
                        areaAvg += +user.totalHours;
                    }
                }
                const thisUsersUnits = [];
                // get all units for this user and add them to array
                this.units.forEach(unit => {
                    if (unit.locationName == "HINTON MANUFACTURING")
                        console.log(unit, area);
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
                    user.percent = +(
                        this.PMS.returnUnitsPmPercent(thisUsersUnits) * 100
                    ).toFixed(2);
                }
                const activeUnits = this.PMS.returnActiveUnits(thisUsersUnits);
                const idleUnits = this.PMS.returnIdleUnits(thisUsersUnits);
                area.idleUnits += idleUnits.length;
                area.activeUnits += activeUnits.length;
            });

            const afterFilter = area.users.filter(obj => {
                if (obj.idleUnits === 0 && obj.activeUnits === 0) {
                    return false;
                } else {
                    return true;
                }
            });
            // get percent of area
            if (areaUnits.length > 0) {
                area.unitPercent = +(
                    this.PMS.returnUnitsPmPercent(areaUnits) * 100
                ).toFixed(0);
            } else {
                area.unitPercent = 0;
            }
            // avg out the area avg total hours
            area.areaAvg =
                areaAvg === 0.0
                    ? +(0.0).toFixed(2)
                    : +(+areaAvg / +userCount).toFixed(2);
            // calc total area percentages
            area.percent = +this.PMS.totalPercent(afterFilter).toFixed(0);
            if (isNaN(area.percent)) {
                area.percent = 0;
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
    $doCheck() {
        if (
            this.areas.length > 0 &&
            this.unapproved.length > 0 &&
            this.didCheck === false
        ) {
            this.didCheck = true;
            this.areas.forEach(a => {
                this.unapproved.forEach(u => {
                    if (a.locationName === u.area) {
                        a.unapproved = u.count;
                    }
                });
            });
        }
    }

    // ----------------------------------------------------

    // Construct visual object for listing. and resort method
    resort(by) {
        this.sortType = by;
        this.sortReverse = !this.sortReverse;
    }

    newArea() {
        return {
            locationName: "",
            unapproved: 0,
            areaAvg: 0.0,
            idleUnits: 0,
            activeUnits: 0,
            unitPercent: 0,
            users: [],
            percent: 0
        };
    }

    newUser() {
        return {
            username: "",
            area: "",
            idleUnits: 0,
            totalHours: 0.0,
            activeUnits: 0,
            testUnits: 0,
            percent: 0
        };
    }

    // ----------------------------------------------------

    // Set header information -----------------------------
    setHeader() {
        this.units.forEach(unit => {
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
        this.activeUnitPMStatus = this.PMS.totalUnitPercent(this.areas).toFixed(
            0
        );
        this.activePMStatus = this.PMS.totalPercent(this.areas).toFixed(0);
    }

    // ----------------------------------------------------

    // Routing --------------------------------------------
    routeToArea(area) {
        const location = area.locationName;
        this.$location.path(`/areapmreport/${location}`);
    }

    // ----------------------------------------------------
}
angular.module("CommonComponents").component("pmDash", {
    templateUrl: "/lib/public/angular/views/component.views/pmReport.html",
    bindings: {
        units: "<",
        users: "<",
        unapproved: "<"
    },
    controller: [
        "$timeout",
        "$location",
        "PmDashService",
        "SessionService",
        PmDashCtrl
    ]
});

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

angular.module('CommonControllers').controller('AreaPMReportCtrl', [
    '$scope',
    'users',
    'units',
    'areaName',
    'ApiRequestService',
    function ($scope, users, units, areaName, ApiRequestService) {

        const ARS = ApiRequestService;
        const searchedUsers = [];
        $scope.users = users;
        $scope.units = units;
        $scope.areaName = areaName;

        $scope.users.forEach((user) => {
            if (user.role !== 'admin') {
                searchedUsers.push(user);
            }
        });

        const obj = {users: JSON.stringify(searchedUsers)};
        ARS.http.get.WorkOrdersUnapprovedByUser(obj)
            .then((res) => {
                res.data.forEach((unapprovedObj) => {
                    $scope.users.forEach((user) => {
                        if (user.username === unapprovedObj.user) {
                            user.unapprovedCount = unapprovedObj.count;
                        }
                    });
                });
            }, (err) => {
                console.log(`Error retrieving unapproved for user: ${err}`);
            });
}]);

angular.module('CommonControllers').controller('LoginCtrl',
    ['$scope', '$http', '$location', '$routeParams', '$window', '$cookies', 'AlertService', 'Users', '$auth',
        function ($scope, $http, $location, $routeParams, $window, $cookies, AlertService, Users, $auth) {

            $scope.hideLocalLogin = false;
            $scope.title = "Login";
            $scope.message = "Use your local login to access the system.";

            $scope.returnUrl = $routeParams.returnUrl;
          
            $scope.fragment = $routeParams.fragment;
            console.log($scope.returnUrl );
            console.log($scope.fragment);
            
            $location.search({});

            if ($routeParams.failure === "true") {
                AlertService.add("info", "We were unable to log you in. Please try again.");
            }

            /*$scope.localLogin = function () {
                console.log("localLogin");
               $scope.username =document.getElementById('username').value; 
                $scope.username = $scope.username.toUpperCase();
                console.log($scope.username);
                  $cookies.put('tech', $scope.username);
                 $cookies.put('role', res.data.role);
                console.log('cookie' + $scope.username);
                AlertService.add("info", "Local Login Successful!", 1000);
                  $http.get('/api/identify')
                            .then(function (res) {
                                console.log('authorized');
                                console.log("Authed as: ", res.data.username);
                                $cookies.put('tech', res.data.username || "Logged Out");
                                $cookies.put('role', res.data.role);
                                const OrionNotLoggedInRoute = $cookies.get('OrionNotLoggedInRoute');
                                if (OrionNotLoggedInRoute) {
                                    $cookies.remove('OrionNotLoggedInRoute');
                                    $location.path(OrionNotLoggedInRoute);
                                } else {
                                    $location.path('myaccount');
                                }
                      
                $location.path($scope.fragment || "myaccount");
            };*/

            $scope.localLogin = function () {
                console.log("localLogin");
                $scope.username = $scope.username.toUpperCase();
                console.log($scope.username);
                AlertService.add("info", "Login Successful!", 1000);
                $location.path($scope.fragment || "myaccount");
            };

            $scope.authenticate = function (provider) {
                console.log("authenticate called");
                $auth.authenticate(provider)
                    .then(function () {
                        $http.get('/api/identify')
                            .then(function (res) {
                                console.log('authorized');
                                console.log("Authed as: ", res.data.username);
                                $cookies.put('tech', res.data.username || "Logged Out");
                                $cookies.put('role', res.data.role);
                                
                                    $cookies.remove('OrionNotLoggedInRoute');
                            
                                    $location.path('myaccount');
                                
                            }).catch(function (res) {
                            console.log('did not auth');
                            AlertService.add("danger", res, 1000);
                        })
                    })
                    .catch(function (err) {
                        console.log(err);
                        AlertService.add("danger", "Login Failed!", 1000);
                    });
            };

            $scope.showLocalLogin = function () {
                $scope.hideLocalLogin = false;
            };
        }]);

function MyAccountCtrl(
    $window,
    $scope,
    users,
    units,
    ApiRequestService,
    SessionService
) {
    // Variables ------------------------------------------
    const ARS = ApiRequestService; // local
    const SS = SessionService; // local
    const searchUsers = []; // local
    const searchedAreas = []; // local
    const resData = []; // local
    $scope.units = units; // to PmDash
    $scope.users = users; // to PmDash
    $scope.areas = []; // to PmDash
    // ----------------------------------------------------

    $window.onhashchange = () => SS.drop("unitNumber");

    // lookup unapproved work orders count ----------------
    // get non admins
    const Area = () => ({ area: "", count: 0 });
    const updateArea = () => {
        searchedAreas.forEach(name => {
            const thisArea = Area();
            thisArea.area = name;
            resData.forEach(a => {
                if (a.area === name) {
                    thisArea.count += a.count;
                }
            });
            $scope.areas.push(thisArea);
        });
    };
    $scope.users.forEach(user => {
        if (user.role !== "admin") {
            let newUser = { username: user.username, area: user.area };
            searchUsers.push(newUser);
        }
    });

    const obj = { users: searchUsers };
    ARS.http.get.WorkOrdersUnapprovedArea(obj).then(
        res => {
            res.data.forEach(a => {
                const thisArea = Area();
                thisArea.area = a.area
                    .split(":")[0]
                    .slice(2)
                    .trim();
                thisArea.count = a.count;
                if (
                    searchedAreas.indexOf(thisArea.area) === -1 &&
                    thisArea.area !== ""
                ) {
                    searchedAreas.push(thisArea.area);
                }
                resData.push(thisArea);
            });
            updateArea();
        },
        err => {
            console.log(`Error retrieving unapproved by area: ${err}`);
            console.log(err);
        }
    );
    // ----------------------------------------------------
}
angular
    .module("CommonControllers")
    .controller("MyAccountCtrl", [
        "$window",
        "$scope",
        "users",
        "units",
        "ApiRequestService",
        "SessionService",
        MyAccountCtrl
    ]);

angular.module('CommonControllers').controller('UserPMReportCtrl',
['$window', '$scope', 'users', 'ApiRequestService', 'AlertService',
function ($window, $scope, users, ApiRequestService, AlertService) {
  // Variables ------------------------------------------
  $scope.user = users[0];             // to component
  $scope.spinner = true;              // to component
  $scope.loaded = true;               // to component
  const ARS = ApiRequestService;      // local
  const hour = 3600000;               // local
  const day = hour * 24;              // local
  //-----------------------------------------------------

  // Loading Spinner on and off -------------------------
  $scope.spinnerOff = () => {
    $scope.spinner = false;
  };
  $scope.spinnerOn = () => {
    $scope.spinner = true;
  };
  // ----------------------------------------------------

  // Search work orders with units and day limit --------
  $scope.getWorkOrders = (days) => {
    $scope.loaded = false;
    $scope.spinnerOn();

    const now = new Date().getTime();
    const query = {};
    query.tech = $scope.user.username;
    query.noSplitInfo = true; // do not split info because of role.
    if(days === 0) {
      // only get work orders from today.
      const todayHours = now.getHours() * hour;
      query.from = now - todayHours;
      query.to = now;
    } else {
      const minusDays = day * days;
      query.from = new Date(now - minusDays);
      query.to = new Date(now);
    }
    query.limit = 100000;
    // Get units assigned to user
    ARS.Units({tech: $scope.user.username, size: 500})
      .then((res) => $scope.units = res)
      .catch((err) => console.log(err));
    // get all work orders done by user.
    ARS.WorkOrders(query)
      .then((res) => {
        $scope.workorders = res;
        $scope.spinnerOff();
        $scope.loaded = true;
        if(res.length === 0) {
          AlertService.add("info",`No work orders found from ${days} days ago`);
        }
      })
      .catch((err) => console.log(err));
  };
  // ----------------------------------------------------

  // Initiate a search of at least 150 days prior -------
  $scope.getWorkOrders(45);
  // ----------------------------------------------------
}]);

angular.module('CommonDirectives')

.directive('alerts', ['AlertService', function (AlertService) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/directive.views/alerts.html',
    link: function (scope, elem, attrs, ctrl) {
      scope.closeAlert = function (obj) {
      	return AlertService.closeAlert(obj);
      };
  	}
  };
}]);

angular.module('CommonDirectives')
.directive('customValidation', function () {
  return {
    require: 'ngModel',
    scope: true,
    link: function (scope, element, attr, ngModelCtrl) {

      element.bind('focus', function () {
        if (element.context.value === "0") {
          element.context.value = "";
        }
      });


      function fromUser (text) {
        var originalText = text;
        var isNumber = attr.number !== undefined;
        var isTextOnly = attr.textonly !== undefined;
        var isNonNegative = attr.nonNegative === "true";
        var isIntegerOnly = attr.integerOnly === "true";
        console.log(attr.integerOnly);

        if (isNumber) {
          text = text.replace(/[^-?\d+\.?\d*$]/g,'');
          var decimalCount = 0;

          for (var i = 0; i < text.length; i++) { // because regex is fucky

            if (i === 0 && text[i] === '-') {
              continue;
            } // skip the first negative

            if (text[i] === '-') { // remove subsequent minus signs
              text = text.slice(0, i) + text.slice(i+1, text.length);
            } else if (text[i] === '.') {
              if (decimalCount > 0) { // remove subsequent decimal points
                text = text.slice(0, i) + text.slice(i+1, text.length);
              } else { // there can be only 1
                decimalCount = 1;
              }
            }

          }

          if (isNonNegative) {
            text = text.split('-').join();
          }

          if (isIntegerOnly) {
            text = text.split('.')[0];
          }

        }

        if (isTextOnly) {
          console.log("text only validation not implemented");
        }

        if(text !== originalText) {
            ngModelCtrl.$setViewValue(text);
            ngModelCtrl.$render();
        }
        return text;
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  };
});

angular.module('CommonDirectives')

.directive('header', ['$window', '$location', '$cookies', function ($window, $location, $cookies) {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/directive.views/header.html',
    link: function (scope, elem, attrs, ctrl) {

      function getnavItems() {
        return [
          {
          text: "User: " + $cookies.get('tech') || "Logged Out",
          action: function () { $location.path('/support'); }
          }
        ];
      }

      scope.navItems = getnavItems();
  	}
  };
}]);

/**
 * This service handles server side error responses for the whole app.
 * If a route has needsLogin: true, this will ensure the user is logged in.
 */

angular.module('CommonServices')
.factory('Handler401', ['$q', '$cookies', '$window', '$injector', '$location',
function ($q, $cookies, $window, $injector, $location) {

  // Make them log in again.
  function logInAgain() {
    var url = $window.location.toString().split('#'),
        returnUrl = url[0],
        fragment = url[1];

    $location
    .search('returnUrl', returnUrl)
    .search('fragment', fragment)
    .path('/login');
  }

  // Pass an $http and $route.current.
  // Set the cookies if the user is logged in!
  function checkAuthorization(httpService, currentRoute) {
    var deferred = $q.defer();

    if ($cookies.get('userId') !== null &&
        $cookies.get('userId') !== undefined &&
        $cookies.get('userId') !== 0 &&
        $cookies.get('userId') !== "undefined") {
          deferred.resolve($cookies.get('userId'));
    } else {

      httpService.get('/authorized').success(function (user) {
        if (user !== '0' && user !== undefined && user !== null && user !== "undefined") {
          $cookies.put('userId', user._id);
          $cookies.put('userName', user.userName);
          deferred.resolve($cookies.get('userId'));
        } else {
          $cookies.remove('userId');
          $cookies.remove('user');
          deferred.reject("Unauthorized");
        }
      }).error(function (err) {
        $cookies.remove('userId');
        $cookies.remove('user');
        deferred.reject(err);
      });

    }

    return deferred.promise;

  }

  return {

    // Cool hax, bro.
    // Inject $http and $route to get around circular dependencies.
    // On each request, we want to check the user's cookie is set.
    request: function (config) {
      return $injector.invoke(function ($http, $route) {
        if ($route.current.needsLogin === true) {

          $route.current.needsLogin = false; //prevent infinite callback loop.

          checkAuthorization($http, $route.current)
          .then(function (resolveValue) {
            console.log("Resolve Value: ", resolveValue);
          }, function (rejectionReason) {
            console.log("Rejection Reason: ", rejectionReason);
            logInAgain();
          });
        }

        return config || $q.when(config);

      });
    },

    requestError: function (rejection) {
      logInAgain();
      return $q.reject(rejection);
    },

    response: function (response) {
      return response || $q.when(response);
    },

    // If the user is not logged in on the server side,
    // we're returning a 401 error code, so this will catch that.
    responseError: function (rejection) {
      if (rejection.status === 401) { logInAgain(); }
      return $q.reject(rejection);
    }
  };
}]);

angular.module('CommonServices')
.factory('AlertService', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

  var AlertService = {};
  // create an array of alerts available globally
  $rootScope.alerts = [];

  AlertService.add = function (type, message, timeout) {
    if(!timeout) { timeout = 5000; }
    if (timeout < 100) { timeout *= 1000; }
    var alert = {'type': type, 'message': message};
    $rootScope.alerts.push(alert);
    $timeout(function () {
      AlertService.closeAlert(alert);
    }, timeout);
  };

  AlertService.closeAlert = function (alert) {
    var indexOfAlert = $rootScope.alerts.indexOf(alert);
    AlertService.closeAlertIndex(indexOfAlert);
  };

  AlertService.closeAlertIndex = function (index) {
    $rootScope.alerts.splice(index, 1);
  };

  return AlertService;

}]);

function ApiRequestService ($q, $http, Units, Users, Customers, EditHistories, ReviewNotes, Locations, CallReports, PartOrders, Parts, EngineModels, FrameModels, WorkOrders, WoUnitInputMatrixes, WOPMCheck,
    PaidTimeOffs, States, Counties, AssetTypes, ApplicationTypes, MCUnitDiligenceForms, KillCodes) {

    const ARS = {}
    ARS.types = {
        GET: 'GET',
        POST: 'POST',
    }
    ARS.http = {
        get:  {},
        post: {},
    }

    // CallReports
    ARS.CallReports = (obj) => CallReports.query(obj).$promise

    // Counties
    ARS.Counties = (obj) => Counties.query(obj).$promise

    // Edit Histories
    ARS.EditHistories = (obj) => EditHistories.query(obj).$promise

    // States
    ARS.States = (obj) => States.query(obj).$promise

    // Customers
    ARS.Customers = (obj) => Customers.query(obj).$promise

    // PaidTimeOffs
    ARS.PaidTimeOffs = (obj) => PaidTimeOffs.query(obj).$promise

    // PartOrders
    ARS.PartOrders = (obj) => PartOrders.query(obj).$promise

    // ReviewNotes
    ARS.ReviewNotes = (obj) => ReviewNotes.query(obj).$promise

    // Units
    ARS.Units = (obj) => Units.query(obj).$promise

    // WoInputMatrixes
    ARS.WoUnitInputMatrixes = (obj) => WoUnitInputMatrixes.query(obj).$promise

    // WOSOPChecks
    ARS.WOPMCheck = (obj) => WOPMCheck.query(obj).$promise

    // Engine Models
    ARS.EngineModels = (obj) => EngineModels.query(obj).$promise

    // Frame Models
    ARS.FrameModels = (obj) => FrameModels.query(obj).$promise

    // Parts
    ARS.Parts = (obj) => Parts.query(obj).$promise

    // Asset Types
    ARS.AssetTypes = (obj) => AssetTypes.query(obj).$promise

    // Application Types
    ARS.ApplicationTypes = (obj) => ApplicationTypes.query(obj).$promise

    // Kill Codes
    ARS.KillCodes = (obj) => KillCodes.query(obj).$promise

    // Locations
    ARS.Locations = (obj) => Locations.query(obj).$promise

    // Users
    ARS.Users = (obj) => Users.query(obj).$promise

    // getUser usage: send {id: 'ABC001'}
    ARS.getUser = (obj) => Users.get(obj).$promise

    // WorkOrders
    ARS.WorkOrders = (obj) => WorkOrders.query(obj).$promise

    // MCUnitDiligenceForms
    ARS.MCUnitDiligenceForms = (obj) => MCUnitDiligenceForms.query(obj).$promise

    // HTTP Create WorkOrder
    ARS.http.post.Workorder = (obj) => $http({
        url:    '/api/WorkOrders',
        method: ARS.types.POST,
        params: obj,
    })

    // HTTP Admin Create WorkOrder
    ARS.http.post.AdminWorkorder = (obj) => $http.post('/api/WorkOrdersAdminCreate', obj)

    // HTTP Unit WorkOrders
    ARS.http.get.UnitWorkOrders = (obj) => $http({
        url:    '/api/Unit/Workorders',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP MCUnitDiligenceForms Count
    ARS.http.get.MCUnitDiligenceFormCount = (obj) => $http({
        url:    '/api/MCUnitDiligenceFormsNoIdentityCount',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP WorkOrders Count
    ARS.http.get.WorkOrderCount = (obj) => $http({
        url:    '/api/workorderscount',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP no Auth WorkOrders Count
    ARS.http.get.WorkOrdersNoIdentityCount = (obj) => $http({
        url:    '/api/workordersnoidentitycount',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP unapproved by area WorkOrders
    ARS.http.get.WorkOrdersUnapprovedArea = (obj) => $http({
        url:    '/api/workordersunapprovedarea',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP unapproved by user WorkOrders
    ARS.http.get.WorkOrdersUnapprovedByUser = (obj) => $http({
        url:    '/api/workordersunapprovedbyuser',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP unaproved by user PartOrders
    ARS.http.get.PartOrdersNoIdentityCount = (obj) => $http({
        url:    '/api/partordersnoidentitycount',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP no Auth Unit Count
    ARS.http.get.UnitsNoIdentityCount = (obj) => $http({
        url:    '/api/unitnoidentitycount',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP for counties
    ARS.http.get.countiesSplit = (obj) => $http({
        url:    '/api/counties',
        method: ARS.types.GET,
        params: obj,
    })

    // HTTP for County
    ARS.http.get.county = (id) => $http({
        url: `/api/counties/${id}`,
        method: ARS.types.GET,
    })

    // HTTP for State
    ARS.http.get.state = (id) => $http({
        url: `/api/states/${id}`,
        method: ARS.types.GET,
    })

    // HTTP for Locations
    ARS.http.get.locations = (obj) => $http({
        url:    '/api/locations',
        method: ARS.types.GET,
        params: obj,
    })

    return ARS
}

angular.module('CommonServices')
       .factory('ApiRequestService', [
           '$q',
           '$http',
           'Units',
           'Users',
           'Customers',
           'EditHistories',
           'ReviewNotes',
           'Locations',
           'CallReports',
           'PartOrders',
           'Parts',
           'EngineModels',
           'FrameModels',
           'WorkOrders',
           'WoUnitInputMatrixes',
           'WOPMCheck',
           'PaidTimeOffs',
           'States',
           'Counties',
           'AssetTypes',
           'ApplicationTypes',
           'MCUnitDiligenceForms',
           'KillCodes',
           ApiRequestService])

angular.module("CommonServices").factory("DateService", [
    function() {
        return {
            startOfDay(a) {
                const From = new Date(a);
                return new Date(From.setHours(0, 0, 0, 0));
            },

            endOfDay(b) {
                const To = new Date(b);
                return new Date(To.setHours(23, 59, 59, 999));
            },
            addHours(d, h) {
                if (typeof d === "object") {
                    return new Date(
                        d.setTime(d.getTime() + h * 60 * 60 * 1000)
                    );
                } else if (typeof d === "string") {
                    return new Date(
                        new Date(d).setTime(
                            new Date(d).getTime() + h * 60 * 60 * 1000
                        )
                    );
                } else {
                    return new Date(d);
                }
            },

            /**
             * Need to save changes to Orion data as UTC time so when
             * queries run on the server(UTC time) they query the right
             * data.
             * @param date
             * @returns {Date}
             */
            saveToOrion(date) {
                const offset = date.getTimezoneOffset();
                //return new Date(date.getTime() - offset * 60 * 1000);
                return date;
            },

            /**
             * Since time is saved to UTC on the server need to display
             * it in local time
             * @param date
             * @returns {Date}
             */
            displayLocal(date) {
                return date;
                // const offset = date.getTimezoneOffset();
                // return new Date(date.getTime() + (offset * 60 * 1000));
            },

            /**
             * Date should be the new Date('from server string date')
             * that gets converted to local time which will be off.
             * Since the server will send back the right time but with the UTC
             * as GMT+0000 (UTC) we need to add the hour offset because a new date
             * will create the right time but with the hour offset. Now this will
             * convert it correctly.
             * @param {Date} date
             * @returns {Date}
             * @constructor
             */
            UTCtoLocaleDate(date) {
                if (typeof date === "object") {
                    return this.addHours(
                        date.toUTCString(),
                        new Date().getTimezoneOffset() / 60
                    );
                } else if (typeof date === "string") {
                    return this.addHours(
                        new Date(date).toUTCString(),
                        new Date().getTimezoneOffset() / 60
                    );
                } else {
                    return date;
                }
            },

            /**
             * This method converts a date to what the server will read in utc time.
             * Since the server Time Zone offset is 0.
             * This method preserves the local time by sending it to the server which
             * then converts it to UTC time which will add the appropriate time.
             * @param {Date} date
             * @returns {Date}
             */
            dateToUTC(date) {
                return new Date(
                    Date.UTC(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        date.getHours(),
                        date.getMinutes(),
                        date.getSeconds(),
                        date.getMilliseconds()
                    )
                );
            },

            getToFromDatesWeek(num) {
                let returnStart;
                let returnEnd;
                const now = new Date();
                const toStart = new Date();
                const toEnd = new Date();
                const day = now.getDay();

                if (day > 0 && day < 6) {
                    toStart.setDate(now.getDate() - day - 1);
                } else if (day === 6) {
                    toStart.setDate(now.getDate());
                } else if (day === 7) {
                    toStart.setDate(now.getDate() - 1);
                }

                returnStart = this.startOfDay(toStart);
                toEnd.setDate(now.getDate() + (num - day));
                returnEnd = this.endOfDay(toEnd);
                return { returnStart, returnEnd };
            }
        };
    }
]);

angular.module('CommonServices')
.factory('GeneralPartSearchService', [function () {
  const GeneralPartSearchService = {};

  // Replace the General population of search field on all apps that use it.
  GeneralPartSearchService.mapParts = (Parts) => {
    return Parts.map((part) => {
      part.searchStr = [part.description, part.componentName, part.MPN].join(' ');
      return part;
    });
  };
  // -----------------------------------------------

  // Part Table Modal that uses other local functions to create Seach table
  GeneralPartSearchService.partTableModel = (Parts, type, data) => {
    return {
      tableName: "Search For Parts", // displayed at top of page
      objectList: GeneralPartSearchService.mapParts(Parts), // objects to be shown in list
      displayColumns: [ // which columns need to be displayed in the table
        { title: "Part #", objKey: "componentName" },
        { title: "MPN", objKey: "MPN" },
        { title: "Description", objKey: "description" }
      ],
      rowsClickAction: GeneralPartSearchService.addPart(type, data),
      rowButtons: null,
      headerButtons: null, // an array of button object (format below)
      sort: { column: ["number"], descending: false }
    }
  };
  // -----------------------------------------------

  // Add a part depending on sent param ------------
  GeneralPartSearchService.addPart = (type, data) => {
    if ( type === 'replace' ) {
      return part => data.part = GeneralPartSearchService.generalAddPart(part);
    }
    if ( type === 'push' ) {
      return part => data.parts.push(GeneralPartSearchService.generalAddPart(part));
    }
    if ( type === 'wo' ) {
      return part => data.parts.push(GeneralPartSearchService.woAddPart(part));
    }
  };
  // -----------------------------------------------

  // Part Objects ----------------------------------
  GeneralPartSearchService.manualAddPart = (part) => {
    return {
      vendor: part.vendor,
      number: part.number,
      description: part.description,
      cost: part.cost,
      laborCode: "",
      quantity: 0,
      isBillable: false,
      isWarranty: false,
      isManual: true
    }
  };

  GeneralPartSearchService.generalAddPart = (part) => {
    return {
      vendor:         part.vendor,
      number:         part.number,
      MPN:            part.MPN,
      smartPart:      part.componentName,
      componentName:  part.componentName,
      description:    part.description,
      quantity:       0,
      isBillable:     false,
      isWarranty:     false,
      isManual:       false,
      netsuiteId:     part.netsuiteId
    }
  };

  GeneralPartSearchService.woAddPart = (part) => {
    return {
      vendor:         part.vendor,
      number:         part.number,
      MPN:            part.MPN,
      smartPart:      part.componentName,
      componentName:  part.componentName,
      description:    part.description,
      quantity:       0,
      cost:           0,
      laborCode:      "",
      isBillable:     false,
      isWarranty:     false,
      isManual:       false,
      netsuiteId:     part.netsuiteId
    }
  };
  // -----------------------------------------------
  return GeneralPartSearchService;
}]);

angular.module('CommonServices')
.factory('LocationItemService',[function () {
  const LocationItemService = {};

  // get all info from the truck ID itself ---------
  LocationItemService.getTruckInfo = (truckId, locations) => {
    // relate truckID to location NSID
    const Truck = () => ({
        truckId: '',
        netsuiteId: '',
        _id: null
      });
    
    const thisTruck = Truck();
    _.map(locations, (obj) => {
      if(obj.name.indexOf(":") !== -1){
        if(obj.name.substr(obj.name.indexOf(":") + 1).trim() === truckId){
          // return all info of that truckID
          thisTruck._id = obj._id;
          thisTruck.truckId = truckId;
          thisTruck.netsuiteId = obj.netsuiteId;
        }
      }
    });
    return thisTruck;
  };
  // -----------------------------------------------
  
  // get Truck object from String ------------------
  LocationItemService.getTruckFromString = (str, locations) => {
    const Truck = () => ({
      name: '',
      _id: null,
      netsuiteId: '',
    });
    const thisTruck = Truck();
    locations.forEach((loc) => {
      if (loc.name.toUpperCase().indexOf(str.toUpperCase()) !== -1) {
        thisTruck.name = loc.name;
        thisTruck._id = loc._id;
        thisTruck.netsuiteId = Number(loc.netsuiteId);
      } else if (loc.name.indexOf(":") !== -1) {
        if (loc.name.substr(loc.name.indexOf(":") + 1).trim().toUpperCase() === str.toUpperCase()) {
          thisTruck.name = loc.name;
          thisTruck._id = loc._id;
          thisTruck.netsuiteId = Number(loc.netsuiteId);
        }
      }
    });
    return thisTruck;
  };
  // -----------------------------------------------

  // get Truck Id From Name based On NSID ----------
  LocationItemService.getTruckFromNSID = (nsid, locations) => {
    let returnString = '';
    _.map(locations, (obj) => {
      if(obj.netsuiteId === nsid){
        returnString = obj.name.substr(obj.name.indexOf(":") + 1).trim();
      }
    });
    return returnString;
  };
  // -----------------------------------------------

  // get the _id of a particular Location based on NSID
  LocationItemService.getIDFromNSID = (nsid, locations) => {
    let returnVariable = null;
    if(nsid){
      _.map(locations, (obj) => {
        if(obj.netsuiteId === nsid){
          returnVariable = obj._id;
        }
      });
    }
    return returnVariable;
  };
  // -----------------------------------------------

  // get Name from location NSID -------------------
  LocationItemService.getNameFromNSID = (nsid, locations) => {
    let returnString = '';
    if(nsid){
      _.map(locations, (obj) => {
        if (obj.netsuiteId === nsid){
          returnString = obj.name;
        }
      });
    }
    return returnString;
  };
  // -----------------------------------------------

  // get the NSID back from a locations based on ID
  LocationItemService.getLocationNSID = (id, locations) => {
    for (let i = 0; i < locations.length; i++) {
      if (locations[i]._id === id) {
        return locations[i].netsuiteId;
      }
    }
    return null;
  };
  // -----------------------------------------------

  // get Location Objects of only Trucks -----------
  LocationItemService.getTruckObj = (locations) => {
    const Truck = () => ({
        name: '',
        netsuiteId: '',
        _id: null
      });
    const reg = /^\d+$/;
    const returnArray = [];

    _.map(locations, (obj) => {
      if(obj.name.indexOf(":") !== -1){
        if(reg.test(obj.name.substr(obj.name.indexOf(":") + 1).trim())){
          const thisLocation = Truck();
          thisLocation.name = obj.name;
          thisLocation.netsuiteId = obj.netsuiteId;
          thisLocation._id = obj._id;
          returnArray.push(thisLocation);
        }
      }
    });

    return returnArray;
  };
  // -----------------------------------------------

  // return Array of location Names ----------------
  // only warehouses
  LocationItemService.getLocationNameArray = (locations) => {
    const ClassLocations = () => ({ name: ''});
    //var defaultLocation = ClassLocations();
    const returnedArray = [];

    // fill the rest of the array with the other warehouse IDs
    _.map(locations, (obj) => {
      if ( obj.name.indexOf(":") === -1 ) {
        const thisLocation = ClassLocations();
        thisLocation.name = obj.name;
        returnedArray.push(thisLocation);
      }
    });


    return returnedArray;
  };
  // -----------------------------------------------

  // return Array of location Warehouse Objs -------
  // only for warehouses
  LocationItemService.getLocationWarehouseObjArray = (locations) => {
    const ClassLocation = () => ({
      name: '',
      netsuiteId: '',
      _id: null
    });
    const returnedArray = [];

    // fill the rest of the array with the other warehouse info
    _.map(locations, (obj) => {
      if ( obj.name.indexOf(":") === -1 ) {
        const thisLocation = ClassLocation();
        thisLocation.name = obj.name;
        thisLocation.netsuiteId = obj.netsuiteId;
        thisLocation._id = obj._id;
        returnedArray.push(thisLocation);
      }
    });

    return returnedArray;
  };
  // -----------------------------------------------

  return LocationItemService;
}]);

function ObjectService() {
    const ObjectService = {};

    const isArray = Array.isArray;
    const keyList = Object.keys;
    const hasProp = Object.prototype.hasOwnProperty;

    ObjectService.equal = (a, b) => {
        if (a === b) return true;

        if (a && b && typeof a == 'object' && typeof b == 'object') {
            let arrA   = isArray(a)
                , arrB = isArray(b)
                , i
                , length
                , key;

            if (arrA && arrB) {
                length = a.length;
                if (length !== b.length) return false;
                for (i = length; i-- !== 0;)
                    if (!ObjectService.equal(a[i], b[i])) return false;
                return true;
            }

            if (arrA !== arrB) return false;

            const dateA = a instanceof Date
                , dateB = b instanceof Date;
            if (dateA !== dateB) return false;
            if (dateA && dateB) return a.getTime() === b.getTime();

            const regexpA = a instanceof RegExp
                , regexpB = b instanceof RegExp;
            if (regexpA !== regexpB) return false;
            if (regexpA && regexpB) return a.toString() === b.toString();

            const keys = keyList(a);
            length = keys.length;

            if (length !== keyList(b).length)
                return false;

            for (i = length; i-- !== 0;)
                if (!hasProp.call(b, keys[i])) return false;

            for (i = length; i-- !== 0;) {
                key = keys[i];
                if (!ObjectService.equal(a[key], b[key])) return false;
            }

            return true;
        }

        return a !== a && b !== b;
    };

    // Change A nested Value of an Object based on a String
    ObjectService.updateNestedObjectValue = (object, newValue, path) => {
        _.update(object, path, function (n) {
            n = newValue;
            return n;
        });
    };
    // -----------------------------------------------

    // setobjvalue
    ObjectService.setObjValue = (obj, path, value) => {
        if (typeof path === 'string') {
            return ObjectService.setObjValue(obj, path.split('.'), value)
        } else if (path.length === 1) {
            return obj[path[0]] = value
        } else if (path.length === 0) {
            return obj
        } else {
            return ObjectService.setObjValue(obj[path[0]], path.slice(1), value)
        }
    }

    // Change A non Nested Value of an Object based on String
    ObjectService.updateNonNestedObjectValue = function (object, newValue, path) {
        object[path] = newValue;
    };
    // -----------------------------------------------

    // Return nested value of object based on String -
    ObjectService.getNestedObjectValue = function (object, path) {
        var stack = path.split('.');
        while (stack.length > 1) {
            object = object[stack.shift()];
        }
        return object[stack.shift()];
    };
    // -----------------------------------------------


    return ObjectService;
}

angular.module('CommonServices')
       .factory('ObjectService', [ObjectService]);

function PmDashService() {
    const PMS = {};

    const active = new RegExp("^Active", "i");

    PMS.white = "#ffffff";
    PMS.green = "#b2f4b3";
    PMS.yellow = "#eff4b2";
    PMS.red = "#f4bab2";

    // Set the background colors for percentages ----------
    PMS.setBackgroundColor = (percent) => {
        if (percent >= 95) {
            return PMS.green;
        } else if (percent > 90 && percent < 95) {
            return PMS.yellow;
        } else if (percent === -1) {
            return PMS.white;
        } else {
            return PMS.red;
        }
    };
    // ----------------------------------------------------

    // Get the percentage in decimal format for a group of units
    PMS.returnUnitsPmPercent = (units) => {
        const unitPercent1 = {
            col: 0,
            percentName: "nextPM1Date",
            percentages: [],
            total: 0,
        };

        const unitPercentages = [unitPercent1];
        const now = new Date().getTime(); // right now
        const isPMed = (row, unit, percentages) => {
            // for next PM1
            if (row.percentName === "nextPM1Date" && unit.engineHP < 60) {
                const percentTime = new Date(unit[row.percentName]).getTime();
                if (percentTime > now) {
                    // next pm date has not come yet.
                    percentages[row.col].percentages.push(1);
                } else if (percentTime < now) {
                    // the next pm date has passed.
                    percentages[row.col].percentages.push(0);
                }
            } else if (unit[row.percentName] !== null && unit.engineHP >= 60) {
                const percentTime = new Date(unit[row.percentName]).getTime();
                if (percentTime > now) {
                    // next pm date has not come yet.
                    percentages[row.col].percentages.push(1);
                } else if (percentTime < now) {
                    // the next pm date has passed.
                    percentages[row.col].percentages.push(0);
                }
            }
        };

        const idle = new RegExp("Idle", "i");
        const sold = new RegExp("Sold", "i");
        const sale = new RegExp("Sale", "i");
        unitPercentages.forEach((rowPercent) => {
            units.forEach((unit) => {
                if (active.test(unit.status)) {
                    isPMed(rowPercent, unit, unitPercentages);
                }
            });
        });
        // calc total unit percentages
        const percentsLength = unitPercentages.reduce((a, b) => {
            return a + b.percentages.length;
        }, 0);
        let total = 0;
        unitPercentages.forEach((col) => {
            total += col.percentages.reduce((a, b) => a + b, 0);
        });
        if (percentsLength === 0 && total === 0) {
            return 0;
        } else {
            return +(total / percentsLength).toFixed(2);
        }
        /*const total = unitPercentages.reduce((a, b) => a + b, 0);
        if (unitPercentages.length === 0 && total === 0) {
            return 0;
        } else {
            return +(total / unitPercentages.length).toFixed(2);
        }*/
    };
    // ----------------------------------------------------

    // Return all idle units in a list of units -----------
    PMS.returnIdleUnits = (units) => {
        const idleUnits = [];
        const idle = new RegExp("Idle", "i");
        if (units.length > 0) {
            units.forEach((unit) => {
                if (unit.status.match(idle)) {
                    idleUnits.push(unit);
                }
            });
        }
        return idleUnits;
    };
    // ----------------------------------------------------

    // Return all active units in a list of units ---------
    PMS.returnActiveUnits = (units) => {
        const activeUnits = [];
        const idle = new RegExp("Idle", "i");
        const sold = new RegExp("Sold", "i");
        const sale = new RegExp("Sale", "i");
        if (units.length > 0) {
            units.forEach((unit) => {
                if (active.test(unit.status)) {
                    activeUnits.push(unit);
                }
            });
        }
        return activeUnits;
    };
    // ----------------------------------------------------

    // Set background color for date ----------------------
    PMS.setDateBackground = (date) => {
        const checker = 604800000; // 1 week
        const now = new Date().getTime(); // right now
        const dateTime = new Date(date).getTime(); // pm is due
        const green = now + checker; // seven days from now

        if (dateTime > green) {
            return PMS.green;
        } else if (now < dateTime && dateTime < green) {
            return PMS.yellow;
        } else if (dateTime < now) {
            return PMS.red;
        } else {
            return "white";
        }
    };
    PMS.setDate2Background = (unit) => {
        const checker = 604800000; // 1 week
        const now = new Date().getTime(); // right now
        const dateTime = new Date(unit.nextPM2Date).getTime(); // pm is due
        const green = now + checker; // seven days from now
        if (unit.engineHP >= 60 && dateTime) {
            if (dateTime > green) {
                return PMS.green;
            } else if (now < dateTime && dateTime < green) {
                return PMS.yellow;
            } else if (dateTime < now) {
                return PMS.red;
            } else {
                return "white";
            }
        } else if (unit.engineHP < 60) {
            return "white";
        } else {
            return PMS.red;
        }
    };
    PMS.setDate3Background = (unit) => {
        const checker = 604800000; // 1 week
        const now = new Date().getTime(); // right now
        const dateTime = new Date(unit.nextPM3Date).getTime(); // pm is due
        const green = now + checker; // seven days from now
        if (unit.engineHP >= 60 && dateTime) {
            if (dateTime > green) {
                return PMS.green;
            } else if (now < dateTime && dateTime < green) {
                return PMS.yellow;
            } else if (dateTime < now) {
                return PMS.red;
            } else {
                return "white";
            }
        } else if (unit.engineHP < 60) {
            return "white";
        } else {
            return PMS.red;
        }
    };
    PMS.setDate4Background = (unit) => {
        const checker = 604800000; // 1 week
        const now = new Date().getTime(); // right now
        const dateTime = new Date(unit.nextPM4Date).getTime(); // pm is due
        const green = now + checker; // seven days from now
        if (unit.engineHP >= 60 && dateTime) {
            if (dateTime > green) {
                return PMS.green;
            } else if (now < dateTime && dateTime < green) {
                return PMS.yellow;
            } else if (dateTime < now) {
                return PMS.red;
            } else {
                return "white";
            }
        } else {
            return "white";
        }
    };
    PMS.setDate5Background = (unit) => {
        const checker = 604800000; // 1 week
        const now = new Date().getTime(); // right now
        const hasPM4 = !!unit.nextPM4Date;
        const hasPM5 = !!unit.nextPM5Date;
        const dateTime = new Date(unit.nextPM5Date).getTime(); // pm is due
        const green = now + checker; // seven days from now

        if (unit.engineHP < 60 && hasPM5 && !hasPM4) {
            return "white";
        } else if (unit.engineHP >= 60 && hasPM5) {
            if (dateTime > green) {
                return PMS.green;
            } else if (now < dateTime && dateTime < green) {
                return PMS.yellow;
            } else if (dateTime < now) {
                return PMS.red;
            } else {
                return "white";
            }
        } else if (unit.engineHP < 60 && !hasPM5 && !hasPM4) {
            return "white";
        } else {
            if (hasPM4 && !hasPM5) {
                return "white";
            } else {
                return PMS.red;
            }
        }
    };
    // ----------------------------------------------------

    // Get total percentage from all areas units-----------
    PMS.totalUnitPercent = (objListWithePercentField) => {
        const activeUnits = objListWithePercentField.reduce((array, obj) => {
            if (obj.activeUnits !== 0) {
                return array.concat(obj.unitPercent / 100);
            } else {
                return array;
            }
        }, []);
        const total = activeUnits.reduce((a, b) => a + b, 0);
        return +(total / activeUnits.length).toFixed(2) * 100;
    };
    // ----------------------------------------------------

    // Get total percentage from all areas ----------------
    PMS.totalPercent = (objListWithePercentField) => {
        const activeUnits = objListWithePercentField.reduce((array, obj) => {
            if (obj.activeUnits !== 0) {
                return array.concat(obj.percent / 100);
            } else {
                return array;
            }
        }, []);
        const total = activeUnits.reduce((a, b) => a + b, 0);
        return +(total / activeUnits.length).toFixed(2) * 100;
    };
    // ----------------------------------------------------

    return PMS;
}

angular.module("CommonServices").factory("PmDashService", [PmDashService]);

angular.module('CommonServices')
.factory('SessionService', ['$window', function ($window) {
  const SS = {};
  const sessionStorage = $window.sessionStorage;
  
  SS.add = (key, value) => {
    sessionStorage.setItem(JSON.stringify(key), JSON.stringify(value));
  };
  
  SS.get = (key) => JSON.parse(sessionStorage.getItem(JSON.stringify(key)));
  
  SS.drop = (key) => sessionStorage.removeItem(JSON.stringify(key));
  
  SS.clear = () => sessionStorage.clear();
  
  return SS;
}]);

angular.module('CommonServices')
.factory('TimeDisplayService',[function(){

    var TimeDisplayService = {};
     // improved badding for more that 2 digits
      TimeDisplayService.pad = function (n) {
        if (n >= 0) {
          return n > 9 ? "" + n : "0" + n;
        } else {
          return n < -9 ? "" + n : "-0" + Math.abs(n);
        }
      }
      // Padder for more exact padding.
      TimeDisplayService.exactPad =  function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      };
      // Convert HH:-MM / -H:-M / -H:MM  to correct time intervals examples below
      TimeDisplayService.timeManager = function (h, m) {
        var HtoM = 0;
        var totalM = 0;
        // Initial Checks
        if ((m < 0) && (h === 0)) {    // IE: 0:-15  = -00:15 *
          return { hours: "-0" + h, minutes: TimeDisplayService.pad(Math.abs(m)) };
        } else if ((m < 0) && (h < 0)) {// IE: -4:-30 = -04:30 *
          return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(Math.abs(m)) };
        } else if ((m > 0) && (h === 0)) {
          return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(m) };
          // Recursive calls
        } else if ((m > 0) && (h < 0)) {// IE: -1:+30 = -00:30 *
          HtoM = Math.abs(Math.round(h * 60));
          totalM = m - HtoM;
          // Deal with negative times
          if (totalM > 0) {
            h = ((totalM / 60) < 1) ? 0 : Math.round(totalM / 60);
          } else {
            h = totalM / 60;
          }
          m = Math.round(totalM % 60);
          return TimeDisplayService.timeManager(h, m); // recursion
        } else if ((m < 0) && (h > 0)) {// IE: 1:-30 = 00:30 *
          HtoM = Math.abs(Math.round(h * 60));
          totalM = HtoM + m;
          h = ((totalM / 60) < 1) ? 0 : Math.floor(totalM / 60);
          m = Math.round(totalM % 60);
          return TimeDisplayService.timeManager(h, m); // recursion
        }
        return { hours: TimeDisplayService.pad(h), minutes: TimeDisplayService.pad(m) };
      };

    return TimeDisplayService;
}]);

angular.module('CommonServices').factory('Utils', [function () {
    return {
        getObjFromArrayByID(objs, id) {
            return objs.reduce((acc, cur) => {
                if (cur._id === id) {
                    return cur
                } else {
                    return acc
                }
            }, {})
        },
        getObjByValue(objs, v, path) {
            return objs.reduce((acc, cur) => {
                if (this.getObjValue(cur, path) === v) {
                    return cur
                } else {
                    return acc
                }
            }, {})
        },
        getObjValue(obj, path) {
            return path.split(".").reduce((o, i) => {
                if (o !== undefined) {
                    return o[i]
                }
            }, obj)
        },
        debounce (fn, wait, immediate) {
            let inDebounce;
            return function executedFunction () {
                let context = this;
                let args = arguments;
                let later = function () {
                    inDebounce = null;
                    if (!immediate) fn.apply(context, args);
                };

                let callNow = immediate && !inDebounce;

                clearTimeout(inDebounce);
                inDebounce = setTimeout(later, wait);

                if (callNow) fn.apply(context, args);
            };
        },
        isEmpty(obj) {
            if (!obj && obj !== 0) {
                return true;
            }
            return (!(typeof (obj) === "number") && !Object.keys(obj).length && Object.prototype.toString.call(obj) !== '[object Date]');
        },
        rmArrObjDups(arr, field) {
            return arr.filter((obj, pos, ray) => {
                return (pos === ray.findIndex((t) => {
                    return t[field] === obj[field]
                }))
            })
        },
        getObjValue(obj, path) {
            return path.split('.').reduce((o, i) => {
                if (o !== undefined) {
                    return o[i]
                }
            }, obj)
        }
    };
}]);

/**
 * These are resources. By default, a resource has these methods:
 * get({id: X}) GET -> /api/objects/X
 * save({}, newInfo) POST -> /api/objects/
 * save({id: X}, newInfo) POST (obj.$save()) -> /api/objects/X
 * query() get -> /api/objects
 * remove({id: X}) POST -> /api/objects/X
 * delete({id: X}) POST -> /api/objects/X
 */

angular
    .module("CommonServices")

    .factory("ActivityTypes", [
        "$resource",
        function($resource) {
            return $resource("/api/activitytypes/:id", { id: "@id" });
        }
    ])

    .factory("ApplicationTypes", [
        "$resource",
        function($resource) {
            return $resource("/api/applicationtypes/:id", { id: "@id" });
        }
    ])

    .factory("AssetTypes", [
        "$resource",
        function($resource) {
            return $resource("/api/assettypes/:id", { id: "@id" });
        }
    ])

    .factory("Areas", [
        "$resource",
        function($resource) {
            return $resource("/api/areas/:id", { id: "@id" });
        }
    ])

    .factory("CallReports", [
        "$resource",
        function($resource) {
            return $resource("/api/callreports/:id", { id: "@id" });
        }
    ])

    .factory("Compressors", [
        "$resource",
        function($resource) {
            return $resource("/api/compressors/:id", { id: "@id" });
        }
    ])

    .factory("Counties", [
        "$resource",
        function($resource) {
            return $resource("/api/counties/:id", { id: "@id" });
        }
    ])

    .factory("Customers", [
        "$resource",
        function($resource) {
            return $resource("/api/customers/:id", { id: "@id" });
        }
    ])

    .factory("EditHistories", [
        "$resource",
        function($resource) {
            return $resource("/api/edithistories/:id", { id: "@id" });
        }
    ])

    .factory("Engines", [
        "$resource",
        function($resource) {
            return $resource("/api/engines/:id", { id: "@id" });
        }
    ])

    .factory("InventoryTransfers", [
        "$resource",
        function($resource) {
            return $resource(
                "/api/inventorytransfers/:id",
                { id: "@id" },
                {
                    update: {
                        method: "PUT",
                        params: { _id: "@id" }
                    }
                }
            );
        }
    ])
    .factory("InventoryTransfers", [
        "$resource",
        function($resource) {
            return $resource(
                "/api/inventorytransfers/:id",
                { id: "@id" },
                {
                    update: {
                        method: "PUT",
                        params: { _id: "@id" }
                    }
                }
            );
        }
    ])

    .factory("Jsas", [
        "$resource",
        function($resource) {
            return $resource("/api/jsas/:id", { id: "@id" });
        }
    ])

    .factory("KillCodes", [
        "$resource",
        function($resource) {
            return $resource("/api/killcodes/:id", { id: "@id" });
        }
    ])

    .factory("Locations", [
        "$resource",
        function($resource) {
            return $resource("/api/locations/:id", { id: "@id" });
        }
    ])

    .factory("MCUnitDiligenceForms", [
        "$resource",
        function($resource) {
            return $resource("/api/MCUnitDiligenceForms/:id", { id: "@id" });
        }
    ])

    .factory("OppTypes", [
        "$resource",
        function($resource) {
            return $resource("/api/opptypes/:id", { id: "@id" });
        }
    ])

    .factory("OpportunitySizes", [
        "$resource",
        function($resource) {
            return $resource("/api/opportunitysizes/:id", { id: "@id" });
        }
    ])

    .factory("PaidTimeOffs", [
        "$resource",
        function($resource) {
            return $resource(
                "/api/paidtimeoffs/:id",
                { id: "@id" },
                {
                    update: {
                        method: "PUT",
                        params: { id: "@id" }
                    }
                }
            );
        }
    ])

    .factory("Parts", [
        "$resource",
        function($resource) {
            return $resource("/api/parts/:id", { id: "@id" });
        }
    ])

    .factory("PartOrder", [
        "$resource",
        function($resource) {
            return $resource("/api/partorders", { ids: "@id" });
        }
    ])

    .factory("PartOrders", [
        "$resource",
        function($resource) {
            return $resource(
                "/api/partorders/:id",
                { id: "@id" },
                {
                    update: {
                        method: "PUT",
                        params: { id: "@id" }
                    }
                }
            );
        }
    ])

    .factory("ReviewNotes", [
        "$resource",
        function($resource) {
            return $resource("/api/reviewnotes/:id", { id: "@id" });
        }
    ])

    .factory("States", [
        "$resource",
        function($resource) {
            return $resource("/api/states/:id", { id: "@id" });
        }
    ])

    .factory("StatusTypes", [
        "$resource",
        function($resource) {
            return $resource("/api/statustypes/:id", { id: "@id" });
        }
    ])

    .factory("Titles", [
        "$resource",
        function($resource) {
            return $resource("/api/titles/:id", { id: "@id" });
        }
    ])

    .factory("Transfers", [
        "$resource",
        function($resource) {
            return $resource("/api/transfers/:id", { id: "@id" });
        }
    ])

    .factory("Units", [
        "$resource",
        function($resource) {
            return $resource("/api/units/:id", { id: "@id" });
        }
    ])

    .factory("UnitTypes", [
        "$resource",
        function($resource) {
            return $resource("/api/unittypes/:id", { id: "@id" });
        }
    ])

    .factory("Users", [
        "$resource",
        function($resource) {
            return $resource("/api/users/:id", { id: "@id" });
        }
    ])

    .factory("Vendors", [
        "$resource",
        function($resource) {
            return $resource("/api/vendors/:id", { id: "@id" });
        }
    ])

    .factory("WorkOrders", [
        "$resource",
        function($resource) {
            return $resource(
                "/api/workorders/:id",
                {
                    id: "@id"
                },
                {
                    update: {
                        method: "PUT",
                        params: { id: "@id" }
                    }
                }
            );
        }
    ])
    .factory("WoUnitInputMatrixes", [
        "$resource",
        function($resource) {
            return $resource("/api/WOUnitInputsMatrix/:id", { id: "@id" });
        }
    ])

    .factory("FrameModels", [
        "$resource",
        function($resource) {
            return $resource("/api/FrameModels/:id", { id: "@id" });
        }
    ])

    .factory("EngineModels", [
        "$resource",
        function($resource) {
            return $resource("/api/EngineModels/:id", { id: "@id" });
        }
    ])
    .factory("WOPMCheck", [
        "$resource",
        function($resource) {
            return $resource("/api/WOPMCheck/:id", { id: "@id" });
        }
    ]);

angular.module('CommonComponents')
.component('checkBox', {
  templateUrl: '/lib/public/angular/views/component.views/customComponents/checkbox.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    boxStyling: '@',
    inputStyling: '@',
    onDataChange: '&',
    data: '<',
    disabled: '<'
  },
  controller: CheckBoxCtrl
});

function CheckBoxCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back changes -----------------------------------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName });
  };
  // -----------------------------------------------------
}

angular.module('CommonComponents')
.component('dateField',{
  templateUrl: '/lib/public/angular/views/component.views/customComponents/datefield.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    placeholderText: '@',
    onDataChange: '&',
    data: '<',
    weeks: '<'
  },
  controller: DateFieldCtrl
});

function DateFieldCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back Changes -----------------------------------
  self.onUpdate = function (item) {
    console.log(item);
    self.onDataChange({ changedData: item, selected: self.modelName });
  };
  // -----------------------------------------------------
}

angular.module('CommonComponents')
.component('dualTextField',{
  templateUrl: '/lib/public/angular/views/component.views/customComponents/dual-textfield.html',
  bindings: {
    labelText: '@',
    modelNameOne: '@',
    modelNameTwo: '@',
    inputStyling: '<',
    fieldStyling: '@',
    placeholderTextOne: '@',
    placeholderTextTwo: '@',
    onDataChange: '&',
    dataone: '<',
    datatwo: '<',
    disabled: '<'
  },
  controller: DualTextFieldCtrl
});

function DualTextFieldCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back Changes -----------------------------------
  self.onUpdate = function (item, modelName) {
    self.onDataChange({ changedData: item, selected: modelName });
  };
  // -----------------------------------------------------
}

angular.module('CommonComponents')
.component('selectList', {
  templateUrl: '/lib/public/angular/views/component.views/customComponents/selectlist.html',
  bindings: {
    labelText: '@',
    selectField: '@',
    modelName: '@',
    displayField: '@',
    onDataChange: '&',
    arrayList: '<',
    data: '<',
    disabled: '<'
  },
  controller: SelectListCtrl
});

function SelectListCtrl () {
  var self = this;

  // Pass back the Changed Item to Parent -----------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName});
  };
  // ------------------------------------------------
}

angular.module('CommonComponents')
.component('textAreaField', {
  templateUrl: '/lib/public/angular/views/component.views/customComponents/textareafield.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    placeholderText: '@',
    rows: '@',
    onDataChange: '&',
    data: '<',
    disabled: '<'
  },
  controller: TextAreaFieldCtrl
});

function TextAreaFieldCtrl () {
  // Variables -----------------------------------------
  var self = this;
  // ---------------------------------------------------

  // Pass back Changes ---------------------------------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName });
  };
  // ---------------------------------------------------
}

class TextFieldCtrl {
    constructor(Utils) {
        this.utils = Utils
        this.hasError = false

        this.onUpdate = this.onUpdate.bind(this)
    }

    $onInit() {
        if (this.initRequire && (this.data === '' || this.data === null || this.data === undefined)) {
            this.hasError = true
        }
    }


    // Pass back Changes -----------------------------------
    onUpdate(item) {
        if (this.inputRequired && (item === '' || item === null || item === undefined)) {
            this.hasError = true
        } else if (this.inputRequired && (item !== '' || item !== null || item !== undefined)) {
            this.hasError = false
        }

        this.onDataChange({
            changedData: item,
            selected:    this.modelName
        });
    }

    // -----------------------------------------------------
}

angular.module('CommonComponents')
       .component('textField', {
           templateUrl: '/lib/public/angular/views/component.views/customComponents/textfield.html',
           bindings:    {
               labelText:       '@',
               modelName:       '@',
               inputStyling:    '@',
               fieldStyling:    '@',
               placeholderText: '@',
               onDataChange:    '&',
               data:            '<',
               disabled:        '<',
               initRequire:     '<',
               inputRequired:   '<'
           },
           controller:  ['Utils', TextFieldCtrl]
       })


angular.module('CommonComponents')
.component('timeField', {
  templateUrl: '/lib/public/angular/views/component.views/customComponents/timefield.html',
  bindings: {
    labelText: '@',
    modelName: '@',
    onDataChange: '&',
    data: '<',
    hours: '<',
    minutes: '<',
    show: '<',
    disabled: '<'
  },
  controller: class TimeFieldCtrl {
      constructor() {}

      $onChanges(ch) {}

      onUpdate(item) {
          this.onDataChange({changedData: item, selected: this.modelName})
      }
  }
});

angular.module('CommonComponents')
.component('tripleTextField',{
  templateUrl: '/lib/public/angular/views/component.views/customComponents/triple-textfield.html',
  bindings: {
    labelText: '@',
    modelNameOne: '@',
    modelNameTwo: '@',
    modelNameThree: '@',
    inputStyling: '<',
    fieldStyling: '@',
    placeholderTextOne: '@',
    placeholderTextTwo: '@',
    placeholderTextThree: '@',
    onDataChange: '&',
    dataone: '<',
    datatwo: '<',
    datathree: '<',
    disabled: '<'
  },
  controller: TripleTextFieldCtrl
});

function TripleTextFieldCtrl () {
  // Variables -------------------------------------------
  var self = this;
  // -----------------------------------------------------

  // Pass back Changes -----------------------------------
  self.onUpdate = function (item, modelName) {
    self.onDataChange({ changedData: item, selected: modelName });
  };
  // -----------------------------------------------------
}

angular.module('CommonComponents')
.component('typeAhead',{
  templateUrl: '/lib/public/angular/views/component.views/customComponents/typeahead.html',
  bindings: {
    labelText: '@',
    itemPath: '@',
    modelName: '@',
    placeholderText: '@',
    onDataChange: '&',
    wait: '<',
    arrayList: '<',
    data: '<',
    limit: '<',
    disabled: '<'
  },
  controller: ['ObjectService', TypeAheadCtrl]
});

function TypeAheadCtrl (ObjectService) {
  var self = this;
  self.objItemArray = [];

  // Make array list display field ------------------
  self.$onChanges = function (changes) {
    if ( !self.disabled ){
      if(self.arrayList){
        if(self.arrayList.length > 0){
          if (typeof self.arrayList[0] === 'object') {
            self.arrayList.map(function (obj) {
              self.objItemArray.push(ObjectService.getNestedObjectValue(obj,self.itemPath));
            });
          } else if (
            (typeof self.arrayList[0] === 'string') ||
            (typeof self.arrayList[0] === 'number') ||
            (typeof self.arrayList[0] === 'boolean')) {
            self.objItemArray = self.arrayList;
          } else {
            console.error({arrayList: self.arrayList}, "An Error occurred while attempting to display typeahead item: " + self.labelText +".");
          }
        }
      }
    }
  };
  // ------------------------------------------------

  // Pass back the Changed Item to Parent -----------
  self.onUpdate = function (item) {
    self.onDataChange({ changedData: item, selected: self.modelName});
  };
  // ------------------------------------------------
}

angular.module('CallReportApp.Controllers', []);
angular.module('CallReportApp.Components', []);
angular.module('CallReportApp.Directives', []);
angular.module('CallReportApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('CallReportApp', [
  'CallReportApp.Controllers',
  'CallReportApp.Components',
  'CallReportApp.Directives',
  'CallReportApp.Services',
  'infinite-scroll'
]);

angular.module('CallReportApp').config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider
    .when('/callreport', {
      needsLogin: true,
      controller: 'CallReportCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crOverview.html'
    })
    .when('/callreport/review/:id',{
      needsLogin: true,
      controller: 'CallReportReviewCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crReview.html',
      resolve: {
        callreport: function ($route, $q, CallReports) {
          const id = $route.current.params.id || 0;
          return (id) ? CallReports.get({id}).$promise : null;
        }
      }
    })
    .when('/callreport/edit/:id',{
      needsLogin: true,
      controller: 'CallReportEditCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crEdit.html',
      resolve: {
        callreport: function ($route, $q, CallReports) {
          const id = $route.current.params.id || 0;
          return (id) ? CallReports.get({id}).$promise : null;
        },
        unittypes: function ($route, $q, UnitTypes) {
          return UnitTypes.query({}).$promise;
        },
        titles: function ($route, $q, Titles) {
          return Titles.query({}).$promise;
        },
        statustypes: function ($route, $q, StatusTypes) {
          return StatusTypes.query({}).$promise;
        },
        opportunitysizes: function ($route, $q, OpportunitySizes) {
          return OpportunitySizes.query({}).$promise;
        },
        opptypes: function ($route, $q, OppTypes) {
          return OppTypes.query({}).$promise;
        },
        activitytypes: function ($route, $q, ActivityTypes) {
          return ActivityTypes.query({}).$promise;
        },
        customers: function ($route, $q, Customers) {
          return Customers.query({}).$promise;
        },
        applicationtypes: function ($route, $q, ApplicationTypes) {
          return ApplicationTypes.query({}).$promise;
        },
        users: function ($route, $q, Users) {
          return Users.query({}).$promise;
        }
      }
    })
    .when('/callreport/create',{
      needsLogin: true,
      controller: 'CallReportCreateCtrl',
      templateUrl: '/lib/public/angular/apps/callreport/views/crCreate.html',
      resolve: {
        unittypes: function ($route, $q, UnitTypes) {
          return UnitTypes.query({}).$promise;
        },
        titles: function ($route, $q, Titles) {
          return Titles.query({}).$promise;
        },
        statustypes: function ($route, $q, StatusTypes) {
          return StatusTypes.query({}).$promise;
        },
        opportunitysizes: function ($route, $q, OpportunitySizes) {
          return OpportunitySizes.query({}).$promise;
        },
        opptypes: function ($route, $q, OppTypes) {
          return OppTypes.query({}).$promise;
        },
        activitytypes: function ($route, $q, ActivityTypes) {
          return ActivityTypes.query({}).$promise;
        },
        applicationtypes: function ($route, $q, ApplicationTypes) {
          return ApplicationTypes.query({}).$promise;
        }
      }
    });
  }
]);



angular.module("InventoryTransfersApp.Controllers", []);
angular.module("InventoryTransfersApp.Components", []);
angular.module("InventoryTransfersApp.Directives", []);
angular.module("InventoryTransfersApp.Services", [
    "ngResource",
    "ngCookies",
    "ui.utils"
]);

angular.module("InventoryTransfersApp", [
    "InventoryTransfersApp.Controllers",
    "InventoryTransfersApp.Components",
    "InventoryTransfersApp.Directives",
    "InventoryTransfersApp.Services",
    "infinite-scroll"
]);

angular.module("InventoryTransfersApp").config([
    "$routeProvider",
    function($routeProvider) {
        $routeProvider
            .when("/inventory-transfers", {
                needsLogin: true,
                controller: "InventoryTransfersCtrl",
                templateUrl:
                    "/lib/public/angular/apps/inventoryTransfers/views/inventoryTransfersOverview.html"
            })
            .when("/inventory-transfers/:id", {
                needsLogin: true,
                controller: "EditInventoryTransferCtrl",
                templateUrl:
                    "/lib/public/angular/apps/inventoryTransfers/views/editInventoryTransfer.html",
                resolve: {
                    locations: function($route, $q, Locations) {
                        return Locations.query({}).$promise;
                    },
                    inventorytransfer: function(
                        $route,
                        $q,
                        InventoryTransfers
                    ) {
                        const id = $route.current.params.id || 0;
                        return id
                            ? InventoryTransfers.get({ id }).$promise
                            : null;
                    }
                }
            });
    }
]);

angular.module("InventoryTransfersApp").run([
    "$route",
    "$rootScope",
    "$location",
    function($route, $rootScope, $location) {
        var original = $location.path;
        $location.path = function(path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on("$locationChangeSuccess", function() {
                    $route.current = lastRoute;
                    un();
                });
            }
            return original.apply($location, [path]);
        };
    }
]);

angular.module('MCDiligenceApp.Controllers', []);
angular.module('MCDiligenceApp.Directives', ['uiGmapgoogle-maps']);
angular.module('MCDiligenceApp.Components', []);
angular.module('MCDiligenceApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('MCDiligenceApp', [
    'MCDiligenceApp.Controllers',
    'MCDiligenceApp.Directives',
    'MCDiligenceApp.Services',
    'MCDiligenceApp.Components',
    'infinite-scroll',
]);

angular.module('MCDiligenceApp').config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider

            .when('/mcdiligence/view/:id?', {
                controller:  'MCDiligenceReviewCtrl',
                templateUrl: '/lib/public/angular/apps/mcdiligence/views/mcUnitDFReview.html',
                resolve:     {
                    mcDiligenceForm: function ($route, $q, MCUnitDiligenceForms) {
                        return MCUnitDiligenceForms.get({id: $route.current.params.id}).$promise;
                    },
                },
            })
            .when('/wpi/view/:id?', {
                controller:  'MCDiligenceReviewCtrl',
                templateUrl: '/lib/public/angular/apps/mcdiligence/views/wpiUnitDFReview.html',
                resolve:     {
                    mcDiligenceForm: function ($route, $q, MCUnitDiligenceForms) {
                        return MCUnitDiligenceForms.get({id: $route.current.params.id}).$promise
                    },
                },
            })

            /*.when('/unit/page/:coords?', {
                controller: 'UnitPageCtrl',
                templateUrl: '/lib/public/angular/apps/unit/views/page.html',
                resolve: {
                    coords: function ($route) {
                        const coords = $route.current.params.coords.split(',');
                        return [+coords[1], +coords[0]];
                    }
                }
            })*/

            .when('/mcdiligence', {
                controller:  'MCDiligenceCtrl',
                templateUrl: '/lib/public/angular/apps/mcdiligence/views/mcDiligenceOverview.html',
            })

            // specific wpi endpoint
            .when('/wpi', {
                controller:  'MCDiligenceCtrl',
                templateUrl: '/lib/public/angular/apps/mcdiligence/views/wpiDiligenceOverview.html',
            });
    }]);

angular.module('PartOrderApp.Controllers', []);
angular.module('PartOrderApp.Components', []);
angular.module('PartOrderApp.Directives', []);
angular.module('PartOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('PartOrderApp', [
  'PartOrderApp.Controllers',
  'PartOrderApp.Components',
  'PartOrderApp.Directives',
  'PartOrderApp.Services',
  'infinite-scroll'
]);

angular.module('PartOrderApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider

      .when('/partorder', {
        needsLogin: true,
        controller: 'PartOrderCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/poOverview.html',
        resolve: {
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      })
      .when('/partorder/review/:id',{
        needsLogin: true,
        controller: 'PartOrderReviewCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/poReview.html',
        resolve: {
          partorder: function ($route, $q, PartOrders) {
            const id = $route.current.params.id || 0;
            return (id) ? PartOrders.get({id}).$promise : null;
          },
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      })
      .when('/partorder/editMany/:array', {
        needsLogin: true,
        controller: 'PartOrdersEditCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/posEdit.html',
        resolve: {
          partorders: function ($route, $q, PartOrder) {
            const ids = JSON.parse($route.current.params.array);
            return (ids) ? PartOrder.query({ids: ids}).$promise : null;
          },
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      })
      .when('/partorder/edit/:id',{
        needsLogin: true,
        controller: 'PartOrderEditCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/poEdit.html',
        resolve: {
          partorder: function ($route, $q, PartOrders) {
            const id = $route.current.params.id || 0;
            return (id) ? PartOrders.get({id}).$promise : null;
          },
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      })
      .when('/partorder/create',{
        needsLogin: true,
        controller: 'PartOrderCreateCtrl',
        templateUrl: '/lib/public/angular/apps/partorder/views/poCreate.html',
        resolve: {
          parts: function ($route, $q, Parts) {
            return Parts.query({}).$promise;
          },
          locations: function($route, $q, Locations){
            return Locations.query({}).$promise;
          }
        }
      });
  }
]);

angular.module('PartOrderApp')
  .run(['$route', '$rootScope', '$location',
    function($route, $rootScope, $location) {
      var original = $location.path;
      $location.path = function(path, reload) {
        if (reload === false) {
          var lastRoute = $route.current;
          var un = $rootScope.$on('$locationChangeSuccess', function() {
            $route.current = lastRoute;
            un();
          });
        }
        return original.apply($location, [path]);
      };
    }
  ]);


angular.module('UnitApp.Controllers', []);
angular.module('UnitApp.Directives', ['uiGmapgoogle-maps']);
angular.module('UnitApp.Components', []);
angular.module('UnitApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('UnitApp', [
  'UnitApp.Controllers',
  'UnitApp.Directives',
  'UnitApp.Services',
  'UnitApp.Components'
]);


angular.module('UnitApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

      .when('/unit/view/:id?', {
          controller:  'UnitViewCtrl',
          templateUrl: '/lib/public/angular/apps/unit/views/view.html',
          resolve:     {
              unit:     function ($route, $q, Units) {
                  return Units.get({id: $route.current.params.id}).$promise
              },
              states:   function ($route, $q, States) {
                  return States.query({}).$promise
              },
              counties: function ($route, $q, Counties) {
                  return Counties.query({}).$promise
              },
          },
      })

      .when('/unit/page/:coords?', {
      controller: 'UnitPageCtrl',
      templateUrl: '/lib/public/angular/apps/unit/views/page.html',
      resolve: {
        coords: function ($route) {
          const coords = $route.current.params.coords.split(',');
          return [+coords[1], +coords[0]];
        }
      }
    })

      .when('/unit', {
      controller: 'UnitIndexCtrl',
      templateUrl: '/lib/public/angular/apps/unit/views/index.html'
    });
}]);

angular.module('WorkOrderApp.Controllers', []);
angular.module('WorkOrderApp.Components', []);
angular.module('WorkOrderApp.Directives', ['uiGmapgoogle-maps']);
angular.module('WorkOrderApp.Services', ['ngResource', 'ngCookies', 'ui.utils']);

angular.module('WorkOrderApp', [
  'WorkOrderApp.Controllers',
  'WorkOrderApp.Components',
  'WorkOrderApp.Directives',
  'WorkOrderApp.Services',
  'infinite-scroll'
]);

angular.module('WorkOrderApp').config(['$routeProvider',
  function ($routeProvider) {
  $routeProvider

      .when('/workorder', {
    needslogin: true,
    controller: 'WorkOrderCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/woOverview.html',
    resolve: {
        me: function ($route, $q, Users) {
            return Users.get({id: 'me'}).$promise;
        },
      STARTTIME: () => null,
      ENDTIME: () => null,
      WOTYPE: () => null,
      TECHNICIANID: () => null,
    }
  })
      .when('/workorder/v1Search/:startTime/:technicianID/:Type?', {
    needsLogin: true,
    controller: 'WorkOrderCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/woOverview.html',
    resolve: {
      STARTTIME: function ($route) {
        return new Date($route.current.params.startTime) || null;
      },
      ENDTIME: () => null,
      WOTYPE: function ($route) {
        return $route.current.params.Type || null;
      },
      TECHNICIANID: function ($route) {
        return $route.current.params.technicianID || null;
      },
        me: function ($route, $q, Users) {
            return Users.get({id: 'me'}).$promise;
        },
    }
  })
      .when('/workorder/v2Search/:startTime/:endTime/:technicianID', {
    needsLogin: true,
    controller: 'WorkOrderCtrl',
    templateUrl: '/lib/public/angular/apps/workorder/views/woOverview.html',
    resolve: {
      STARTTIME: function ($route) {
        return new Date($route.current.params.startTime) || null;
      },
      ENDTIME: function ($route) {
        return new Date($route.current.params.endTime) || null;
      },
      WOTYPE: () => null,
      TECHNICIANID: function ($route) {
        return $route.current.params.technicianID || null;
      },
        me: function ($route, $q, Users) {
            return Users.get({id: 'me'}).$promise;
        },
    }
  })
      .when('/workorder/view/:id?', {
          needsLogin: true, controller: 'WorkOrderViewCtrl',
          templateUrl: '/lib/public/angular/apps/workorder/views/view.html', resolve: {
              me: function ($route, $q, Users) {
                  return Users.get({id: 'me'}).$promise;
              },
              workorder: function ($route, $q, WorkOrders) {
                  const id = $route.current.params.id || null;
                  return (id) ? WorkOrders.get({id: id}).$promise : null;
              },
          }
      })
      .when('/workorder/create', {
          needsLogin:  true,
          controller:  'WorkOrderCreateCtrl',
          templateUrl: '/lib/public/angular/apps/workorder/views/create.html',
          resolve:     {
              me: function ($route, $q, Users) {
                  return Users.get({id: 'me'}).$promise
              },
          },
      })
      .when('/workorder/createShop', {
          needsLogin:  true,
          controller:  'WorkOrderCreateCtrl',
          templateUrl: '/lib/public/angular/apps/workorder/views/createShopWo.html',
          resolve:     {
              me: function ($route, $q, Users) {
                  return Users.get({id: 'me'}).$promise
              },
          },
      });
}]);

angular.module('WorkOrderApp')
.run(['$route', '$rootScope', '$location',
function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);

angular.module('CommonControllers').controller('SuperTableCtrl',
['$scope', 'AlertService',
  function ($scope, AlertService) {

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.filterPart = function (obj, index, fullArrayOfParts) {
      if ($scope.searchPhrase) {
        if ($scope.searchPhrase.length >= 3) {
          const pattern2 = new RegExp($scope.searchPhrase, 'i');
          const mpn = obj.MPN ? obj.MPN : '';
          const desc = obj.description ? obj.description : '';
          const compN = obj.componentName ? obj.componentName : '';
          const full = `${mpn} ${desc} ${compN}`;
          const pattern = new RegExp( '(?=.*\\b' + $scope.searchPhrase.split(' ').join('\\b)(?=.*\\b') + '\\b)', 'i');
          if (mpn.match(pattern) || desc.match(pattern) || compN.match(pattern) || full.match(pattern) || mpn.match(pattern2) || desc.match(pattern2) || compN.match(pattern2) || full.match(pattern2)) {
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    };
    
    /* -------------------------------------------------------------------------
    CONFIGURATION / ON LOAD
    ------------------------------------------------------------------------- */
    $scope.getDefaultSort = function () {
      var column = [];
      for (var key in $scope.displayColumns) { column.push(key.toString()); }
      $scope.defaultSort = { column: column, descending: [false] };
    };

    $scope.onLoad = function () {
      var m = $scope.model;
      // if the required fields are not present, bail out
      if (!m.objectList || !m.displayColumns) {
        console.log("WARNING!");
        console.log("You failed to provide required data for the directive.");
        console.log("See super-table documentation for more info.");
        var errMessage =  "SuperTabelCtrl: " +
                          "Required attributes were not assigned to model.";
        throw new Error(errMessage);
      } else {
        $scope.tableName = m.tableName || "My Table Name";

        // required variables
        $scope.objectList = m.objectList;
        $scope.displayColumns = m.displayColumns;

        // optional variables
        $scope.rowClickAction = m.rowClickAction;
        $scope.headerButtons = m.headerButtons;
        $scope.rowButtons = m.rowButtons;
        $scope.sort = m.sort || $scope.getDefaultSort();

      }
    };

    $scope.clearSearchPhrase = function(obj){
      $scope.searchPhrase = '';
      var alertString = obj.description + ' added';
      AlertService.add('success',  alertString);
    };

    // call on load
    (function () { $scope.onLoad(); })();

}]);

angular.module('CommonDirectives')
.directive('ngMin', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attr, ctrl) {

      const minValidator = viewValue => {
        viewValue = +viewValue;
          let min = true;
          let max = true;
        if(scope.min == 0){
            min = viewValue > -1;
        } else if(scope.min == 1){
            min = viewValue > 0;
        } else if(scope.min == null){
            scope.check = true;
        }
          if (scope.max == 0 || scope.max !== null || scope.max !== false) {
              max = viewValue <= scope.max;
          }
          if (min && max) {
          ctrl.$setValidity('ngMin', true);
          if(elem.parent().hasClass('has-error')){
            elem.parent().removeClass('has-error');
            elem.parent().addClass('has-success');
          } else {
            elem.parent().addClass('has-success');
          }
          return viewValue;
        }
        else{
          ctrl.$setValidity('ngMin', false);
          if(elem.parent().hasClass('has-success')){
            elem.parent().removeClass('has-success');
            elem.parent().addClass('has-error');
          } else {
            elem.parent().addClass('has-error');
          }
          return undefined;
        }
      };

        ctrl.$parsers.unshift(minValidator);
    }
  };
})
.directive('numberField', [function() {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/directive.views/customElements/numberfield.html',
    scope: {
      labelText: '@',
      data: '=',
      min: '@',
      max: '@',
      name: '@',
      nonNegative: '@',
      integerOnly: '@',
      placeholderText: '@',
      disabled: '='
    }
  };
}]);

/**
 *            oldcheckbox
 *
 * Created by marcusjwhelan on 11/15/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonDirectives')
.directive('oldCheckBox', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/directive.views/customElements/oldcheckbox.html',
    scope: {
      labelText: '@',
      data: '=',
      disabled: '='
    }
  };
}]);

angular.module('CommonDirectives')
.directive('priceField', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/views/directive.views/customElements/pricefield.html',
    scope: {
      labelText: '@',
      placeholderText: '@',
      data: '=',
      nonNegative: '@',
      integerOnly: '@',
      disabled: '='
    }
  };
}]);

angular.module('CommonDirectives')

.directive('superTable', ['$window', function ($window) {
  return {
    restrict: 'E',
    scope: {
      model: '='
    },
    controller: 'SuperTableCtrl',
    templateUrl: '/lib/public/angular/views/directive.views/customElements/supertable.html'
  };
}]);

/* -----------------------------------------------------------------------------
  MODEL FORMAT INFORMATION AND DOCUMENTATION
  ------------------------------------------------------------------------------


  ------------------------------------------------------------------------------
  PropertyName: objectList
  Status: REQUIRED
  Format: [Object Array]
  Description:
  Example:
  REQUIRED - [Object Array] - a data list of objects to show in the table
    model.objectList = [
      {username: "Charlie", age: 28, sex: "female", favColor: "aubergine"},
      {username: "Julian", age: 31, sex: "male", favColor: "chartreuse"}
    ]; // this will handle arbitrary data structures


  ------------------------------------------------------------------------------
  Property Name: displayColumns
  Status: REQUIRED
  Format: [Object Array]
  Description: columns the table will display
  Example:
    model.displayColumns = [
      {
        title: "User", // what gets displayed in the header
        objKey: username // key that is looked up on the object
      }
    ];


  ------------------------------------------------------------------------------
  PropertyName: tableName
  Status: OPTIONAL
  Format: [String]
  Description: a name for the table
  Example:
    model.tableName = "My Table"; // defaults to "My Table Name";


  ------------------------------------------------------------------------------
  PropertyName: sort
  Status: OPTIONAL (recommended)
  Format: [Object]
  Description:
    Uses Angular sort formatting.
    Link to documentation: (https://docs.angularjs.org/api/ng/filter/orderBy)
    This property will be applied on the template as
      {{ ...| orderBy:defaultSort.column:defaultSort.descending }}
  Example:
    model.defaultSort = { column: ["key1", "key2"], descending: [true, false] };
    // Default behavior is as follows.
    // model.defaultSort = {
    //   column: Object.keys(objectList[0][0]),
    //   descending: [false]
    // };


  ------------------------------------------------------------------------------
  PropertyName: rowClickAction
  Status: OPTIONAL
  Format: [Function]
  Description:
    This parameterized function accepts a row object (i.e., objectList[i]).
    This function is called whenever a user clicks a row.
    If on-click functionality is not desired, leave this property undefined.
  Example:
    model.rowClickAction = function (rowItem) {
      // Body of this fn does whatever I wanted to do with the rowItem
    }


  ------------------------------------------------------------------------------
  PropertyName: rowButtons
  Status: OPTIONAL
  Format: [Object Array]
  Description:
    This provides a means to append an arbitrary number of buttons to the end of
    a row.
  Example:
    model.rowButtons = [
      { title: "Edit",
        action: function (rowItem) {
          // Body of this fn does whatever I wanted to do with the rowItem
        }
      }
    ];


  ------------------------------------------------------------------------------
  PropertyName: headerButtons
  Status: OPTIONAL
  Format: [Object Array]
  Description:
    This provides a means to append an arbitrary number of buttons to the header
    row.
  Example:
    model.headerButtons = [
      { tile: "Create",
        action: function () {
          // Body of this fn does whatever I wanted to do from the headerRow
        }
      }
    ];


*/

/**
 *            GeneralDestinationSelection
 *
 * Created by marcusjwhelan on 11/14/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonComponents')
.component('generalDestinationSelection', {
  templateUrl: '/lib/public/angular/views/customContainers/GeneralDestinationSelection.html',
  bindings: {
    ccPanelTitle: '@',
    ccLabelOrigin: '@',
    ccLabelDestination: '@',
    ccReturnType: '@',
    ccOriginType: '@',
    ccDestinationType: '@',
    ccOriginModelName: '@',
    ccDestinationModelName: '@',
    ccOriginChange: '&',
    ccDestinationChange: '&',
    ccDataOrigin: '<',
    ccDataDestination: '<',
    ccLocations: '<'
  },
  controller: ['LocationItemService', OriginDestinationLocationCtrl]
});

function OriginDestinationLocationCtrl (LocationItemService) {
  // Variables --------------------------------------
  var self = this;
  self.originArray = [];
  self.destinationArray = [];
  // ------------------------------------------------

  // Fill Origin Array ------------------------------
  // Add Any origin type you would like and add a location item
  // Service to serve that type below.
  if (self.ccOriginType === 'warehouse') {
    self.originArray = LocationItemService.getLocationWarehouseObjArray(self.ccLocations);
  } else {
    self.originArray = self.ccLocations;
  }
  // ------------------------------------------------

  // Fill Destination Array -------------------------
  // Add any Destination type you would like and add a location
  // item service to serve that type below
  if (self.ccDestinationType === 'warehouse-truck') {
    self.destinationArray = LocationItemService.getTruckObj(self.ccLocations);
  } else {
    self.destinationArray = self.ccLocations;
  }
  // ------------------------------------------------

  // On Changes to Either Pass Back to Parent CTRL --
  self.OriginChange = function (changedData, selected) {
    self.ccOriginChange({ changedData: changedData, selected: selected});
  };
  self.DestinationChange = function (changedData, selected) {
    self.ccDestinationChange({ changedData: changedData, selected: selected});
  };
  // ------------------------------------------------
}

angular.module('CommonComponents')
.controller('AddPartModalCtrl',['$scope', '$uibModalInstance',
  function ($scope, $uibModalInstance) {
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }])
.component('generalPartsList', {
  templateUrl: 'lib/public/angular/views/customComponents/GeneralPartsList.html',
  bindings: {
    ccData: '<',
    ccPanelTitle: '@',
    ccTableClass: '@',
    ccOnManualAdd: '&',
    ccOnDelete: '&'
  },
  controller: ['$uibModal',GeneralPartsListCtrl]
});

function GeneralPartsListCtrl ($uibModal) {
  // Variables ----------------------------------------------------------
  var self = this;
  // --------------------------------------------------------------------

  // This Calls the Manual Part Modal Ctrl Above ------------------------
  self.openManualPartModal = function(){
    var modalInstance = $uibModal.open({
      templateUrl: '/lib/public/angular/views/modals/manualAddPartModal.html',
      controller: 'AddPartModalCtrl'
    });

    // Take Results of Modal Instance and Push into Parts Array ---------
    modalInstance.result.then(function (part){
      var thisPart = part;
      thisPart.quantity = 0;
      thisPart.isManual = true;
      self.ccOnManualAdd({part: thisPart});
    });
  };
  // --------------------------------------------------------------------
}

/**
 *            selectTechWarehouseId
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */

/// NEED TO FINISH UPDATING  REFERENCE General DestinationSelection.js
angular.module('CommonComponents')
.component('selectTechWarehouseId', {
  templateUrl: 'lib/public/angular/views/customComponents/selectTechWarehouseId.html',
  bindings: {
    ccPanelTitle: '@',
    ccClass: '@',
    ccLabel: '@',
    ccModelName: '@',
    ccReturnType: '@',
    ccType: '@',
    ccOnDataChange: '&',
    ccData: '<',
    ccLocations: '<'
  },
  controller: ['LocationItemService', SelectTechOrWarehouseCtrl]
});

function SelectTechOrWarehouseCtrl (LocationItemService) {
  // Variables --------------------------------------------------
  var self = this;
  self.locationWarehouseArray = [];
  self.locationWarehouseNSIDArray = [];
  // ------------------------------------------------------------

  // Push All Warehouse ID --------------------------------------
  if (self.ccType === "name") {
    // get the location id array
    self.locationWarehouseArray = LocationItemService.getLocationNameArray(self.ccTruckId, self.ccLocations);
  }
  if (self.ccType === "netsuiteId") {
    // get all location Objects plus
    self.locationTechWarehouseObjArray = LocationItemService.getLocationTechWarehouseObjArray(self.ccTruckId, self.ccLocations);
  }
  // ------------------------------------------------------------


  // Pass Back Change to Parent ---------------------------------
  self.onChange = function (changedData, selected) {
    self.ccOnDataChange({ item: changedData , type: self.ccType, selected: selected });
  };
  // ------------------------------------------------------------
}

angular.module('CallReportApp.Components')
.component('crCreateContactInfo',{
  templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crCreateContactInfo.html',
  bindings: {
    onSelectChange: '&',
    onTextChange: '&',
    onManualChange: '&',
    activitytypes: '<',
    titles: '<',
    callreport: '<',
    crContactInfo: '<'
  },
  controller: [class CrCreateContactInfoCtrl {
    constructor (){
      this.phoneNumber= /^\d{3}-\d{3}-\d{4}$/;
      this.testEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      
      // Obj for array for Decision Maker -------------------
      this.decisionMakerObjArray = [
        { type: 'Yes' },
        { type: 'No' },
        { type: 'Maybe' }
      ];
      // ----------------------------------------------------
    }
    
    // Pass back Changes ----------------------------------
    selectFieldChange(changedData, selected) {
      if(changedData !== 'Other'){
        this.onSelectChange({ changedData, selected});
      } else {
        switch(selected) {
          case "activityType":
            this.onManualChange({ changedData: true, selected: 'isManualActivity' });
            this.onSelectChange({ changedData: '', selected });
            break;
          case "title":
            this.onManualChange({ changedData: true, selected: 'isManualTitle' });
            this.onSelectChange({ changedData: '', selected });
            break;
        }
      }
    };
  
    textFieldChange(changedData, selected) {
      if (changedData === '*' && changedData.length < 2) {
        switch(selected) {
          case "activityType":
            this.onManualChange({ changedData: false, selected: 'isManualActivity' });
            this.onTextChange({ changedData: '', selected });
            break;
          case "title":
            this.onManualChange({ changedData: false, selected: 'isManualTitle' });
            this.onTextChange({ changedData: '', selected });
            break;
        }
      } else {
        this.onTextChange({ changedData, selected });
      }
    };
    // ----------------------------------------------------
    
  }]
});

angular.module('CallReportApp.Components')
.component('crCreateOpportunityInfo',{
  templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crCreateOpportunityInfo.html',
  bindings: {
    onSelectChange: '&',
    onTextChange: '&',
    onCheckboxChange: '&',
    onTypeaheadChange: '&',
    onManualChange: '&',
    customers: '<',
    statustypes: '<',
    opptypes: '<',
    applicationtypes: '<',
    opportunitysizes: '<',
    unittypes: '<',
    callreport: '<',
    crOppInfo: '<'
  },
  controller: ['ObjectService', class CrCreateOpportunityInfoCtrl {
    constructor (ObjectService) {
      this.ObjectService = ObjectService;
    }
  
    // Pass back Changes ----------------------------------
    selectFieldChange(changedData, selected) {
      if(changedData !== 'Other'){
        this.onSelectChange({ changedData, selected});
      } else {
        switch(selected) {
          case "status":
            this.onManualChange({ changedData: true, selected: 'isManualStatus' });
            this.onSelectChange({ changedData: '', selected });
            break;
          case "applicationType":
            this.onManualChange({ changedData: true, selected: 'isManualAppType' });
            this.onSelectChange({ changedData: '', selected });
            break;
          case "unitType":
            this.onManualChange({ changedData: true, selected: 'isManualUnitType' });
            this.onSelectChange({ changedData: '', selected });
            break;
          case "oppType":
            this.onManualChange({ changedData: true, selected: 'isManualOppType' });
            this.onTextChange({ changedData: '', selected });
            break;
        }
      }
    };
  
    textFieldChange(changedData, selected) {
      if(changedData === '*' && changedData.length < 2){
        switch(selected) {
          case "status":
            this.onManualChange({ changedData: false, selected: 'isManualStatus' });
            this.onTextChange({ changedData: '', selected });
            break;
          case "applicationType":
            this.onManualChange({ changedData: false, selected: 'isManualAppType' });
            this.onTextChange({ changedData: '', selected });
            break;
          case "unitType":
            this.onManualChange({ changedData: false, selected: 'isManualUnitType' });
            this.onTextChange({ changedData: '', selected });
            break;
          case "oppType":
            this.onManualChange({ changedData: false, selected: 'isManualOppType' });
            this.onTextChange({ changedData: '', selected });
            break;
        }
      } else {
        this.onTextChange({ changedData, selected });
      }
    };
  
    checkboxChange(changedData, selected) {
      this.onCheckboxChange({ changedData, selected });
    };
  
    typeaheadChange(changedData, selected) {
      this.onTypeaheadChange({ changedData, selected });
    };
    // ----------------------------------------------------
    
  }]
});

angular.module('CallReportApp.Components')
.component('crOverviewTable', {
  templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crOverviewTable.html',
  bindings: {
    scrollContentSearch: '&',
    contentSearch: '&',
    onTypeaheadChange: '&',
    users: '<',
    customers: '<',
    callreports: '<'
  },
  controller: ['$window', 'DateService', class CrOverviewCtrl {
    constructor($window, DateService){
      this.DS = DateService;
      this.$window = $window;
      this.sortType = 'epoch';
      this.sortReverse = false;
      this.searchFilter = '';

      // query params
      this.limit = 50;
      this.skip = 0;
      this.customerName = null;
      this.userName = null;
      this.dates = {
        from: null,
        fromInput: null,
        to: null,
        toInput: null,
      };
    }

    // Initializes original search ---------------------
    $onInit() {
      this.submit();
    };
    // -------------------------------------------------
    toggleSearch () {
      document.getElementById('crSearch').classList.toggle('collapse')
    }

    // Search Changes ----------------------------------
    customerChange(changedData, selected) {
      this.onTypeaheadChange({ changedData, selected });
    }
    userChange(changedData, selected) {
      this.onTypeaheadChange({ changedData, selected });
    }
    // -------------------------------------------------

    // Sorting for Table -------------------------------
    resort(by) {
      this.sortType = by;
      this.sortReverse = !this.sortReverse;
    };
    // -------------------------------------------------

    // Get start and end of Day ------------------------
    crstartOfDay(input) {
      this.dates.fromInput = input;
      if (typeof input === 'object') {
        this.dates.from = new Date(new Date(input).setHours(0,0,0,0));
      }
    };

    crendOfDay(input) {
      this.dates.toInput = input;
      if (typeof input === 'object') {
        this.dates.to = new Date(new Date(input).setHours(23,59,59,999));
      }
    };
    // -------------------------------------------------

    // Query Constructor -------------------------------
    queryConstruct(limit, skip) {
      const query = {
        limit: limit,
        skip: skip
      };

      // gather query params
      if ( this.dates.from && this.dates.to ) {
        query.from = this.DS.saveToOrion(this.dates.from);
        query.to = this.DS.saveToOrion(this.dates.to);
      }

      if( this.userName ){
        query.username = this.userName;
      }

      if( this.customerName ) {
        query.customer = this.customerName;
      }

      return query;
    };
    // -------------------------------------------------

    // Load content on scroll from Parent Controller ---
    loadOnScroll() {
      console.log("Scrolling...");
      this.skip += this.limit;

      const query = this.queryConstruct(this.limit, this.skip);

      this.scrollContentSearch({ query });
    };
    // -------------------------------------------------

    // Submit Query to Parent Controller ---------------
    submit() {
      this.limit = 50;
      this.skip = 0;

      const query = this.queryConstruct(this.limit, this.skip);

      this.contentSearch({ query });
    };
    // -------------------------------------------------

    clearText(selected) {
      switch (selected) {
        case 'customer':
          this.customerName = null;
          break;
        case 'user':
          this.userName = null;
          break;
      }
    }

    // Routing -----------------------------------------
    routeToCallReport(cr) {
      this.$window.open('#/callreport/review/' + cr._id);
    };
    // -------------------------------------------------
  }]
});

angular.module('CallReportApp.Components')
.component('crReviewContactInfo',{
  templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crReviewContactInfo.html',
  bindings: {
    callreport: '<'
  }
});


angular.module('CallReportApp.Components')
 .component('crReviewOpportunityInfo',{
   templateUrl: '/lib/public/angular/apps/callreport/views/component-views/crReviewOpportunityInfo.html',
   bindings: {
     callreport: '<'
   }
 });


angular.module('CallReportApp.Controllers')
.controller('CallReportCreateCtrl', ['$scope','$timeout','$uibModal','$cookies','$location','AlertService','ObjectService', 'ApiRequestService', 'CallReports','unittypes','titles','statustypes','opportunitysizes','opptypes','activitytypes','applicationtypes', 'DateService',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, ObjectService, ApiRequestService, CallReports, unittypes, titles, statustypes, opportunitysizes, opptypes, activitytypes, applicationtypes, DateService) {

  // Variables -------------------------------------
  const ARS = ApiRequestService;
  const DS = DateService;
  $scope.unittypes = unittypes;
  $scope.titles = titles;
  $scope.statustypes = statustypes;
  $scope.opportunitysizes = opportunitysizes;
  $scope.opptypes = opptypes;
  $scope.activitytypes = activitytypes;
  $scope.customers = [];
  $scope.applicationtypes = applicationtypes;
  $scope.techId = $cookies.get('tech');
  $scope.valid = false;
  $scope.callreport = newCallReport();
  $scope.oppFormValid = false;
  // -----------------------------------------------

  // Make shift call report ------------------------
  function newCallReport () {
    return {
      customer: '',

      title: '',
      isManualTitle: false,
      activityType: '',
      isManualActivity: false,
      applicationType: '',
      isManualAppType: false,
      unitType: '',
      isManualUnitType: false,
      status: '',
      isManualStatus: false,
      oppType: '',
      isManualOppType: false,

      size: '',
      phoneNumber: '',
      contactName: '',
      officeLocation: '',
      email: '',
      callTime: new Date(),
      newCustomer: false,
      decisionMaker: '',
      currentSpend: '',

      username: $scope.techId,
      extension: '',
      comment: ''
    }
  }
  // -----------------------------------------------

  // Passed Functions To Child Components ----------
  $scope.selectFieldChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport,changedData, selected);
  };

  $scope.typeaheadChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
    if(selected === 'customer'){
      ARS.Customers({regexName: changedData})
        .then((customers) => {
          $scope.customers = customers;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  $scope.textFieldChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
  };

  $scope.checkboxChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData,selected);
  };

  $scope.isManualChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.callreport, changedData, selected);
  };
  // -----------------------------------------------

  // Save Call Report ------------------------------
  $scope.save = () => {
    // before saving format all times to be server time
    if ($scope.callreport.callTime) {
      $scope.callreport.callTime = DS.saveToOrion($scope.callreport.callTime);
    }
    CallReports.save({},$scope.callreport,
      (res) => {
        AlertService.add('success', "Successfully created Call Report.");
        $location.url('/callreport');
      },
      (err) => {
        AlertService.add('danger', 'An error occurred while attempting to save.');
        console.log(err);
      }
    );
  };
  // -----------------------------------------------
}]);

angular.module('CallReportApp.Controllers')
.controller('CallReportCtrl',
  ['$scope', '$http', '$timeout', '$location', '$q', 'ApiRequestService', 'DateService',
function ($scope, $http, $timeout, $location, $q, ApiRequestService, DateService) {
  // Variables-----------------------------------------
  const ARS = ApiRequestService;              // local
  const DS = DateService;                     // local
  $scope.loaded = false;                      // local
  $scope.spinner = true;                      // local
  $scope.displayUsersFromController = [];     // to OverviewTable
  $scope.displayCustomersFromController = []; // to OverviewTable
  // --------------------------------------------------

  // Turn Spinner Off ---------------------------------
  $scope.spinnerOff = () => {
    $scope.spinner = false;
  };
  // --------------------------------------------------

  // Passed to Component ------------------------------
  // Function called any time Page loads or user scrolls past 50 units
  $scope.lookup = (query) => {
    $scope.loaded = false;
    ARS.CallReports(query)
      .then((callreports) => {
        $scope.callreports = callreports.map(mapCallReports);
        $scope.loaded = true;
        $scope.spinnerOff();
      })
      .catch((err) => console.log("Failed to load: ", err));
  };

  $scope.CallReportScrollLookup = (query) => {
    console.log("Looking up Call Reports...");
    ARS.CallReports(query)
      .then((callreports) => {
        console.log("Call Reports Loaded.");
        const cr = callreports.map(mapCallReports);
        $scope.callreports = $scope.callreports.concat(cr);
      })
      .catch((err) => console.log("Failed to load call reports on scroll: ",err));
  };
  $scope.typeaheadChange = (changedData, selected) => {
    if(selected === 'user'){

      ARS.Users({ regexName: name })
      .then((users) => {
        const userArray = [];
        if(users.length > 0){
          for(let user in users){
            if(users.hasOwnProperty(user)){
              if(users[user].hasOwnProperty('firstName')){
                const fullName = users[user].firstName.concat(" ").concat(users[user].lastName);
                const thisUser = users[user];
                thisUser.fullName = fullName;
                userArray.push(thisUser);
              }
            }
          }
          $scope.displayUsersFromController = userArray;
        }
      })
      .catch((err) => console.log(err));
    } else if(selected === 'customer'){
      ARS.Customers({ regexName: changedData })
      .then((customers) => {
        $scope.displayCustomersFromController = customers;
      })
      .catch((err) => console.log(err));
    }
  };
  // --------------------------------------------------

  // Create Sorting parameters ------------------------
  function mapCallReports (cr) {
    // map and set times to local times
    cr.callTime = DS.displayLocal(new Date(cr.callTime));
    cr.epoch = new Date(cr.callTime).getTime();

    return cr;
  }
  // --------------------------------------------------

  // Routing ------------------------------------------
  $scope.createCallReport = function () {
    $location.url('/callreport/create');
  };
  // --------------------------------------------------
}]);

angular.module('CallReportApp.Controllers')
.controller('CallReportReviewCtrl',['$scope', 'ApiRequestService', 'callreport', 'DateService',
function ($scope, ApiRequestService, callreport, DateService) {

  // Variables -------------------------------------
  const ARS = ApiRequestService;
  const DS = DateService;
  $scope.callreport = callreport;
  $scope.userRealName = '';
  // -----------------------------------------------

  // init
  $scope.callreport.callTime = DS.displayLocal(new Date($scope.callreport.callTime));

  // Load User first + last name for display -------
  ARS.getUser({id: callreport.username})
    .then((user) => {
      if (user.hasOwnProperty('firstName')) {
        $scope.userRealName = user.firstName.concat(' ').concat(user.lastName);
      } else {
        $scope.userRealName = callreport.username;
      }
    })
    .catch((err) => console.log(err));
  // -----------------------------------------------
}]);

angular
    .module("InventoryTransfersApp.Controllers")
    .controller("EditInventoryTransferCtrl", [
        "$scope",
        "$http",
        "$timeout",
        "$location",
        "$q",
        "$cookies",
        "AlertService",
        "InventoryTransfers",
        "ApiRequestService",
        "DateService",
        "$uibModal",
        "inventorytransfer",
        "locations",
        function (
            $scope,
            $http,
            $timeout,
            $location,
            $q,
            $cookies,
            AlertService,
            InventoryTransfers,
            ApiRequestService,
            DateService,
            $uibModal,
            inventorytransfer,
            locations
        ) {
            console.log(arguments);
            // Variables-----------------------------------------
            const ARS = ApiRequestService;
            const DS = DateService;
            $scope.loaded = true;
            $scope.spinner = false;
            $scope.locations = locations;
            // --------------------------------------------------

            $scope.currentInventoryTransfer = inventorytransfer;

            $scope.updatePart = (part, index) => {
                const modalInstance = $uibModal.open({
                    templateUrl:
                        "/lib/public/angular/apps/inventoryTransfers/views/component-views/editPart.html",
                    controller: "EditPartCtrl",
                    resolve: {
                        partSelected: function () {
                            return {
                                data: part,
                                index: index,
                            };
                        },
                    },
                });

                // Modal Instance Result Calls Parent Function -
                modalInstance.result.then(({ data, index }) => {
                    $scope.currentInventoryTransfer.parts[index].quantity =
                        data.quantity;
                    $scope.currentInventoryTransfer.parts[index].netsuiteId =
                        data.netsuiteId;
                    $scope.currentInventoryTransfer.parts[index].number =
                        data.componentName;
                    $scope.currentInventoryTransfer.parts[index].description =
                        data.description;
                    $scope.currentInventoryTransfer.parts[index].isManual =
                        data.isManual;
                });
            };

            $scope.originChange = () => {
                $scope.currentInventoryTransfer.originLocationNSID = locations.find(
                    (location) =>
                        location._id ===
                        $scope.currentInventoryTransfer.originLocation
                );
            };

            $scope.destinationChange = () => {
                $scope.currentInventoryTransfer.destinationLocationNSID = locations.find(
                    (location) =>
                        location._id ===
                        $scope.currentInventoryTransfer.destinationLocation
                );
            };

            $scope.updateTransfer = () => {
                console.log($scope.currentInventoryTransfer);
                $http
                    .put(
                        "/api/inventorytransfers/" +
                            $scope.currentInventoryTransfer._id,
                        angular.toJson($scope.currentInventoryTransfer)
                    )
                    .then(() => {
                        $location.path("/inventory-transfers");
                    });
            };

            $scope.pushTransfer = () => {
                console.log($scope.currentInventoryTransfer);
                $http
                    .post(
                        "http://34.223.93.100:8080/transfers/" +//"http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/" +
                            $scope.currentInventoryTransfer._id +
                            "/push",
                        angular.toJson($scope.currentInventoryTransfer)
                    )
                    .then(() => {
                        $location.path("/inventory-transfers");
                    });
            };

            $scope.blockTransfer = () => {
                console.log($scope.currentInventoryTransfer);
                $http
                    .post(
                        "http://34.223.93.100:8080/transfers/" +//"http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/" +
                            $scope.currentInventoryTransfer._id +
                            "/block",
                        angular.toJson($scope.currentInventoryTransfer)
                    )
                    .then(() => {
                        $location.path("/inventory-transfers");
                    });
            };
        },
    ]);

angular.module("InventoryTransfersApp.Controllers").controller("EditPartCtrl", [
    "$scope",
    "$uibModalInstance",
    "$uibModal",
    "partSelected",
    function ($scope, $uibModalInstance, $uibModal, partSelected) {
        $scope.part = partSelected.data;

        $scope.update = () => {
            $uibModalInstance.close({
                data: $scope.part,
                index: partSelected.index,
            });
        };

        $scope.selectPart = (part, index) => {
            const modalInstance = $uibModal.open({
                templateUrl:
                    "/lib/public/angular/apps/inventoryTransfers/views/component-views/partSelection.html",
                controller: "PartSelectionCtrl",
                resolve: {
                    partSelected: function () {
                        return {
                            data: part,
                            index: index,
                        };
                    },
                },
            });

            // Modal Instance Result Calls Parent Function -
            modalInstance.result.then(({ data, index }) => {
                $scope.part.netsuiteId = data.netsuiteId;
                $scope.part.number = data.componentName;
                $scope.part.description = data.description;
                $scope.part.isManual = false;
            });
        };

        $scope.cancel = () => {
            $uibModalInstance.dismiss("cancel");
        };
    },
]);

angular
    .module("InventoryTransfersApp.Controllers")
    .controller("InventoryTransfersCtrl", [
        "$scope",
        "$http",
        "$window",
        "$timeout",
        "$location",
        "$q",
        "$cookies",
        "AlertService",
        "ApiRequestService",
        "DateService",
        function (
            $scope,
            $http,
            $window,
            $timeout,
            $location,
            $q,
            $cookies,
            AlertService,
            ApiRequestService,
            DateService
        ) {
            // Variables-----------------------------------------
            const ARS = ApiRequestService;
            const DS = DateService;
            $scope.loaded = false;
            $scope.spinner = true;

            $scope.currentTab = "Incomplete";
            $scope.orderByField = "inventorytransferDate";
            $scope.reverseSort = false;

            // --------------------------------------------------

            $scope.waitingInventoryTransfers = [];
            $scope.completedInventoryTransfers = [];
            $scope.incompletedInventoryTransfers = [];

            $scope.openTransfers = function (id) {
                console.log(id);
                $window.open("#/inventory-transfers/" + id);
            };

            $scope.updateTable = () => {
                $scope.orderByField = "inventorytransferDate";
                $scope.reverseSort = false;
            };

            $scope.changeSort = (column) => {
                if (column === $scope.orderByField) {
                    $scope.reverseSort = !$scope.reverseSort;
                } else {
                    $scope.orderByField = column;
                }
            };

            $http({
                method: "GET",
                url:
                "http://34.223.93.100:8080/transfers/waiting/",//"http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/waiting",
            }).then(
                function successCallback(response) {
                    $scope.waitingInventoryTransfers = response.data.map(
                        (transfer) => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map((transfer) => transfer.description)
                                    .join(", "),
                            };
                        }
                    );
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );

            $http({
                method: "GET",
                url:
                "http://34.223.93.100:8080/transfers/completed/",//"http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/completed",
            }).then(
                function successCallback(response) {
                    console.log(response.data);

                    $scope.completedInventoryTransfers = response.data.map(
                        (transfer) => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map((transfer) => transfer.description)
                                    .join(", "),
                            };
                        }
                    );
                    $scope.loaded = true;
                    $scope.spinner = false;
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );

            $http({
                method: "GET",
                url:
                "http://34.223.93.100:8080/transfers/incomplete/",//"http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/incomplete",
            }).then(
                function successCallback(response) {
                    console.log(response.data);

                    $scope.incompletedInventoryTransfers.push(
                        ...response.data.map((transfer) => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map((transfer) => transfer.description)
                                    .join(", "),
                            };
                        })
                    );
                    $scope.loaded = true;
                    $scope.spinner = false;
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );

            $http({
                method: "GET",
                url:
                "http://34.223.93.100:8080/transfers/manual_parts/",//"http://inventorytransferservice.us-west-2.elasticbeanstalk.com/transfers/manual_parts",
            }).then(
                function successCallback(response) {
                    console.log(response.data);

                    $scope.incompletedInventoryTransfers.push(
                        ...response.data.map((transfer) => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map((transfer) => transfer.description)
                                    .join(", "),
                            };
                        })
                    );
                    $scope.loaded = true;
                    $scope.spinner = false;
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );
        },
    ]);

angular
    .module("InventoryTransfersApp.Controllers")
    .controller("PartSelectionCtrl", [
        "$scope",
        "$uibModalInstance",
        "Parts",
        "partSelected",
        function($scope, $uibModalInstance, Parts, partSelected) {
            $scope.part = partSelected.data;
            $scope.searchTerm = partSelected.data.number.toString();
            $scope.results = [];
            $scope.fuse = null;

            Parts.query().$promise.then(function(parts) {
                const options = {
                    shouldSort: true,
                    matchAllTokens: true,
                    threshold: 0.7,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 32,
                    minMatchCharLength: 1,
                    keys: ["description", "componentName"]
                };

                $scope.fuse = new Fuse(parts, options);

                $scope.searchParts();
            });

            $scope.searchParts = () => {
                if (!$scope.fuse) return;
                $scope.results = $scope.fuse
                    .search($scope.searchTerm)
                    .splice(0, 20);
            };
            $scope.selectPart = selectedPart => {
                $uibModalInstance.close({
                    data: selectedPart,
                    index: partSelected.index
                });
            };

            $scope.cancel = () => {
                $uibModalInstance.dismiss("cancel");
            };
        }
    ]);

angular.module('MCDiligenceApp.Components').component('diligenceOverviewTable', {
    templateUrl: 'lib/public/angular/apps/mcdiligence/views/component-views/mcDiligenceOverviewTable.html',
    bindings:    {
        mcUnitDiligenceReport:    '&',
        contentSearch:            '&',
        mcUnitDiligenceFormCount: '<',
        reportDisabled:           '<',
        mcUnitDiligenceForms:     '<',
    },
    controller:  ['$window', 'DateService', class MCDiligenceOverviewCtrl {
        constructor ($window, DateService) {
            this.DS = DateService;
            this.$window = $window;
            this.sortType = 'epoch';
            this.sortReverse = false;
            this.searchFilter = '';
            this.unitNumber = '';
            this.reviewer = '';

            this.limit = 50;
            this.skip = 0;
            this.dates = {
                from:      null,
                to:        null,
                fromInput: null,
                toInput:   null,
            };
        }

        $onInit () {
            this.submit();
        }

        startOfDay (input) {
            this.dates.fromInput = input;
            if (typeof input === 'object' && input !== null) {
                this.dates.from = new Date(new Date(input).setHours(0, 0, 0, 0));
            }
            if (input === null) {
                this.dates.from = null;
            }
        };

        endOfDay (input) {
            this.dates.toInput = input;
            if (typeof input === 'object' && input !== null) {
                this.dates.to = new Date(new Date(input).setHours(23, 59, 59, 999));
            }
            if (input === null) {
                this.dates.to = null;
            }
        };

        resort (by) {
            this.sortType = by;
            this.sortReverse = !this.sortReverse;
        }

        queryConstruct (limit, skip) {
            const query = {
                limit: limit,
                skip:  skip,
            };
            if (this.dates.from && this.dates.to) {
                query.from = this.DS.saveToOrion(this.dates.from);
                query.to = this.DS.saveToOrion(this.dates.to);
            }
            if (this.unitNumber) {
                query.unitNumber = this.unitNumber;
            }
            if(this.reviewer) {
                query.reviewer = this.reviewer;
            }
            return query;
        }

        submit () {
            this.limit = 50;
            this.skip = 0;

            const query = this.queryConstruct(this.limit, this.skip);
            this.contentSearch({query});
        }

        report (type) {
            const query = {};
            if (this.dates.from && this.dates.to) {
                query.from = this.DS.saveToOrion(this.dates.from);
                query.to = this.DS.saveToOrion(this.dates.to);
            }
            if (type === 'mcUnitDownload') {
                this.mcUnitDiligenceReport({query});
            }
        }

        routeToMCDiligenceForm (mcdf) {
            console.log('route');
            this.$window.open('#/mcdiligence/view/' + mcdf._id);
        }
    }],
});

angular.module('MCDiligenceApp.Components').component('wpiDiligenceOverviewTable', {
    templateUrl: 'lib/public/angular/apps/mcdiligence/views/component-views/wpiDiligenceOverviewTable.html',
    bindings:    {
        contentSearch:            '&',
        mcUnitDiligenceFormCount: '<',
        mcUnitDiligenceForms:     '<',
    },
    controller:  ['$window', 'DateService', class MCDiligenceOverviewCtrl {
        constructor ($window, DateService) {
            this.DS = DateService
            this.$window = $window
            this.sortType = 'epoch'
            this.sortReverse = false
            this.searchFilter = ''

            this.limit = 50
            this.skip = 0
            this.dates = {
                from:      null,
                to:        null,
                fromInput: null,
                toInput:   null,
            }
        }

        $onInit () {
            this.submit()
        }

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

        resort (by) {
            this.sortType = by
            this.sortReverse = !this.sortReverse
        }

        queryConstruct (limit, skip) {
            const query = {
                limit: limit,
                skip:  skip,
            }
            query.leaseName = 'yard'
            return query
        }

        submit () {
            this.limit = 50
            this.skip = 0

            const query = this.queryConstruct(this.limit, this.skip)
            this.contentSearch({query})
        }

        routeToMCDiligenceForm (mcdf) {
            console.log('route')
            this.$window.open('#/wpi/view/' + mcdf._id)
        }
    }],
})

angular.module('MCDiligenceApp.Controllers')
    .controller('MCDiligenceCtrl', ['$scope',
        '$http',
        '$timeout',
        '$location',
        '$q',
        'ApiRequestService',
        'DateService',
        'AlertService',
        function ($scope, $http, $timeout, $location, $q, ApiRequestService, DateService,
            AlertService) {
            // Variables-----------------------------------------
            const ARS = ApiRequestService;              // local
            const DS = DateService;                     // local
            $scope.infiniteScroll = false              // local
            $scope.unitCount = 0                       // local
            $scope.loaded = false;                      // local
            $scope.spinner = true;                      // local
            $scope.reportDisabled = false;
            // --------------------------------------------------

            // Turn Spinner Off ---------------------------------
            $scope.spinnerOff = () => {
                $scope.spinner = false;
            };
            // --------------------------------------------------

            // Passed to Component ------------------------------
            // Function called any time Page loads or user scrolls past 50 units
            $scope.lookup = (query) => {
                $scope.loaded = false;
                $scope.infiniteScroll = false
                ARS.MCUnitDiligenceForms(query)
                    .then((mcUnitDiligenceForms) => {
                        $scope.mcUnitDiligenceForms = mcUnitDiligenceForms.map(
                            mapMCUnitDiligenceForms);
                        $scope.loaded = true;
                        $scope.spinnerOff();
                        ARS.http.get.MCUnitDiligenceFormCount(query)
                            .then((res) => {
                                $scope.unitCount = res.data
                                if (query.skip < $scope.unitCount) {
                                    query.skip += query.limit
                                    $scope.infiniteScroll = true
                                    $scope.MCDiligenceScrollLookup(query)
                                }
                            }, (err) => {
                                console.error(`Counting Error: ${err}`)
                            })
                    })
                    .catch((err) => console.log('Failed to load: ', err));
            };

            $scope.MCDiligenceScrollLookup = (query) => {
                console.log('Looking up Call Reports...');
                ARS.MCUnitDiligenceForms(query)
                    .then((mcUnitDiligenceForms) => {
                        console.log('Call Reports Loaded.');
                        const cr = mcUnitDiligenceForms.map(mapMCUnitDiligenceForms);
                        $scope.mcUnitDiligenceForms = $scope.mcUnitDiligenceForms.concat(cr);
                        if ($scope.infiniteScroll) {
                            if (query.skip < $scope.unitCount) {
                                query.skip += query.limit
                                $scope.infiniteScroll = true
                                $scope.MCDiligenceScrollLookup(query)
                            } else if ($scope.mcUnitDiligenceForms.length === $scope.unitCount) {
                                $scope.infiniteScroll = false
                            }
                        }
                    })
                    .catch((err) => console.log('Failed to load diligence forms on scroll: ', err));
            };
            // --------------------------------------------------

            $scope.mcUnitDiligenceReport = (query) => {
                $http({method: 'GET', url: 'api/MCUnitDiligenceFormsReport', params: query})
                    .then((res) => {
                        const anchor = angular.element('<a/>');
                        anchor.attr({
                            href:     'data:attachment/tsv;charset=utf-8,' + encodeURI(res.data),
                            target:   '_blank',
                            download: 'MCUnitDiligenceReport.tsv',
                        })[0].click();
                        $scope.reportDisabled = false;
                    }, (err) => {
                        AlertService.add('danger', 'Report failed', 2000);
                        console.log(err);
                        $scope.reportDisabled = false;
                    });
            };

            // Create Sorting parameters ------------------------
            function mapMCUnitDiligenceForms (mcd) {
                // map and set times to local times
                mcd.submitted = new Date(mcd.submitted);
                mcd.epoch = new Date(mcd.submitted).getTime();

                return mcd;
            }

            // --------------------------------------------------
        }]);

angular.module('MCDiligenceApp.Controllers')
    .controller('MCDiligenceReviewCtrl',
        ['$scope', 'mcDiligenceForm', '$uibModal', function ($scope, mcDiligenceForm, $uibModal) {
            $scope.mcDiligenceForm = mcDiligenceForm;
            $scope.latLong = $scope.mcDiligenceForm.coords.slice(
                Math.max($scope.mcDiligenceForm.coords.length - 2, 0));

            $scope.openUnitView = () => {
                console.log('open modal');
                const modalInstance = $uibModal.open({
                    templateUrl: '/lib/public/angular/apps/mcdiligence/views/modals/mcUnitModalView.html',
                    scope:       $scope,
                    controller:  'mcDiligenceModalCtrl',
                });
            };
        }]);

angular
    .module("PartOrderApp.Components")
    .controller("AddPartPOModalCtrl", [
        "$scope",
        "$uibModalInstance",
        function($scope, $uibModalInstance) {
            $scope.part = {};

            $scope.part.netsuiteId = 0;

            $scope.addPart = () => {
                $uibModalInstance.close($scope.part);
            };

            $scope.cancel = () => {
                $uibModalInstance.dismiss("cancel");
            };
        }
    ])
    .component("poCreatePart", {
        templateUrl:
            "/lib/public/angular/apps/partorder/views/component-views/poCreatePart.html",
        bindings: {
            part: "<",
            onManualAdd: "&",
            onDelete: "&"
        },
        controller: [
            "$uibModal",
            class CreatePart {
                constructor($uibModal) {
                    this.$uibModal = $uibModal;
                }

                // Show Table of parts if Part Isn't Empty -------
                Empty() {
                    if (_.isEmpty(this.part)) {
                        return false;
                    }
                    return true;
                }
                // -----------------------------------------------

                // Call the Modal for Manual Part Add ------------
                openManualPartModal() {
                    const modalInstance = this.$uibModal.open({
                        templateUrl:
                            "/lib/public/angular/views/modals/manualAddPartModal.html",
                        controller: "AddPartPOModalCtrl"
                    });

                    // Modal Instance Result Calls Parent Function -
                    modalInstance.result.then(part => {
                        const thispart = part;
                        thispart.quantity = 0;
                        thispart.isManual = true;
                        this.onManualAdd({ part: thispart });
                    });
                }
                // -----------------------------------------------
            }
        ]
    });

angular.module('PartOrderApp.Components')
.component('poEditHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poEditHeading.html',
  bindings: {
    selectOriginType: '@',
    onTextChange: '&',
    onSelectChange: '&',
    locations: '<',
    partorder: '<'
  },
  controller: ['LocationItemService', class PartOrderEditHeadingCtrl {
    constructor (LocationItemService) {
      this.LocationItemService = LocationItemService;
    }
  
    $onInit() {
      this.locationWarehouseObjArray = this.LocationItemService.getLocationWarehouseObjArray(this.locations);
      // Change origin and destination NSID to name for display
      this.originLocation = this.LocationItemService.getNameFromNSID(this.partorder.originNSID, this.locations);
      this.destinationLocation = this.LocationItemService.getNameFromNSID(this.partorder.destinationNSID, this.locations);
    }
    
    // React to changes to Part Order Obj -----------------
    $doCheck() {
      if(this.partorder.originNSID !== null){
        this.originLocation = this.LocationItemService.getNameFromNSID(this.partorder.originNSID, this.locations);
      }
    };
    // ----------------------------------------------------
  
    // Pass back Changes ----------------------------------
    selectFieldChange(changedData, selected) {
      this.onSelectChange({ changedData, selected});
    };
  
    textFieldChange(changedData, selected) {
      this.onTextChange({ changedData, selected });
    };
    // ----------------------------------------------------
    
  }]
});

angular.module('PartOrderApp.Components')
.component('poEditTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poEditTable.html',
  bindings: {
      partorder:        '<',   // one way data binding for partorder
      onChangeQuantity: '&',
      onSelection:      '&',
  },
  controller: class EditTableCtrl {
    constructor () {
      this.status = [
        { type: 'ordered', value: false },
        { type: 'backorder', value: false },
        { type: 'canceled', value: false },
        { type: 'completed', value: false }
      ];
    }

    // Change Selected Check box --------------------------
    changeCheckBoxes(data, selected) {
      _.map(this.status,(obj) => {
        if ( obj.type === selected ){
          obj.value = true;
          this.status.forEach((x) => {
            if( x.type !== selected ){
              x.value = false;
            }
          });
        }
      });
    };
    // ----------------------------------------------------

    // Disable check boxes based on Part Order State ------
    checkDisabled(box) {
      if(box !== 'complete'){
        if(this.partorder.timeShipped){
          return true;
        }
      }
      return false;
    };
    // ----------------------------------------------------

      quantityChange (changedData, selected) {
          const reg = new RegExp(/^\d+$/)
          if (reg.test(changedData) === true) {
              this.onChangeQuantity({changedData: +changedData, selected})
          } else if (changedData === '') {
              this.onChangeQuantity({changedData: 0, selected})
          }
      }

    // Send Back Changed Data and Type --------------------
    thisBoxDataChange(changedData, selected) {
      if ( selected !== 'canceled' ){
        this.partorder.comment = '';
      }
      if( changedData === true ) {
        this.changeCheckBoxes(changedData, selected);
        this.onSelection({ changedData, selected });
      }
    };
    // ----------------------------------------------------

  }
});

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

    toggleSearch () {
        document.getElementById('poSearch').classList.toggle('collapse')
    }

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
        if (this.dates.from) {
            query.from = this.DS.saveToOrion(this.dates.from)
        }
        if (this.dates.to) {
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

angular.module('PartOrderApp.Components')
.component('poReviewHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewHeading.html',
  bindings: {
    locations: '<',
    partorder: '<'
  },
  controller: ['LocationItemService', class PartOrderReviewHeadingCtrl {
    constructor (LocationItemService) {
      this.LocationItemService = LocationItemService;
    }
    
    $onInit() {
      // Change origin and destination NSID to name for display
      this.originLocation = this.LocationItemService.getNameFromNSID(this.partorder.originNSID, this.locations);
      this.destinationLocation = this.LocationItemService.getNameFromNSID(this.partorder.destinationNSID, this.locations);
      // -----------------------------------------------
    }
  }]
});


angular.module('PartOrderApp.Components')
.component('poReviewTable', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewTable.html',
  bindings: {
    partorder: '<'
  }
});

angular.module('PartOrderApp.Components')
  .component('posEditHeading', {
    templateUrl: '/lib/public/angular/apps/partorder/views/component-views/posEditHeading.html',
    bindings: {
      selectOriginType: '@',
      onTextChange: '&',
      onSelectChange: '&',
      onSelection: '&',
      changeCheckBoxes: '&',
      disabled: '<',
      locations: '<',
      status: '<',
      partorders: '<'
    },
    controller: ['LocationItemService', class PartOrderEditHeadingCtrl {
      constructor (LocationItemService) {
        this.LocationItemService = LocationItemService;
        this.poNumber = '';
        this.originNSID = 0;
      }

      $onInit() {
        this.locationWarehouseObjArray = this.LocationItemService.getLocationWarehouseObjArray(this.locations);
      }

      // Pass back Changes ----------------------------------
      selectFieldChange(changedData, selected) {
        this.onSelectChange({ changedData, selected});
      };

      textFieldChange(changedData, selected) {
        this.onTextChange({ changedData, selected });
      };
      // ----------------------------------------------------

      // Send Back Changed Data and Type --------------------
      thisBoxDataChange(changedData, selected) {
        if ( selected !== 'canceled' ){
          this.partorders.forEach((po) => po.comment = '');
          /// this.partorder.comment = '';
        }
        if( changedData === true ) {
          this.changeCheckBoxes({changedData, selected});
          this.onSelection({ changedData, selected });
        }
      };
      // ----------------------------------------------------
    }]
  });

angular.module('PartOrderApp.Components')
    .component('posEditTable', {
        templateUrl: '/lib/public/angular/apps/partorder/views/component-views/posEditTable.html',
        bindings: {
            onTextChagne: '&',
            disabled: '<',
            partorders: '<',   // one way data binding for partorder
        },
        controller: class EditTableCtrl {
            constructor() {
                this.status = [
                    {type: 'ordered', value: false},
                    {type: 'backorder', value: false},
                    {type: 'canceled', value: false},
                    {type: 'completed', value: false}
                ];
            }

            // Disable check boxes based on Part Order State ------
            checkDisabled(box) {
                if (box !== 'complete') {
                    if (this.partorder.timeShipped) {
                        return true;
                    }
                }
                return false;
            };

            // ----------------------------------------------------

        }
    });

angular.module('PartOrderApp.Controllers')
.controller('PartOrderCreateCtrl', ['$scope', '$timeout', '$uibModal', '$cookies', '$location', 'AlertService', 'GeneralPartSearchService', 'LocationItemService', 'ObjectService', 'PartOrders', 'locations', 'parts', 'DateService',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, GeneralPartSearchService, LocationItemService, ObjectService, PartOrders, locations, parts, DateService) {

  // Variables -------------------------------------
  const DS = DateService;
  $scope.partorder = newPartOrder();
  $scope.parts = parts;
  $scope.locations = locations;
  $scope.techId = $cookies.get('tech');
  $scope.valid = false;
  // -----------------------------------------------

  const setTimesToSave = () => {
    if ($scope.partorder.timeCreated) {
      $scope.partorder.timeCreated = DS.saveToOrion(new Date($scope.partorder.timeCreated));
    }
    if ($scope.partorder.timeSubmitted) {
      $scope.partorder.timeSubmitted = DS.saveToOrion(new Date($scope.partorder.timeSubmitted));
    }
    if ($scope.partorder.timeOrdered) {
      $scope.partorder.timeOrdered = DS.saveToOrion(new Date($scope.partorder.timeOrdered));
    }
    if ($scope.partorder.timeComplete) {
      $scope.partorder.timeComplete = DS.saveToOrion(new Date($scope.partorder.timeComplete));
    }
  };
  const setTimesToDisplay = () => {
    if ($scope.partorder.timeCreated) {
      $scope.partorder.timeCreated = DS.displayLocal(new Date($scope.partorder.timeCreated));
    }
    if ($scope.partorder.timeSubmitted) {
      $scope.partorder.timeSubmitted = DS.displayLocal(new Date($scope.partorder.timeSubmitted));
    }
    if ($scope.partorder.timeOrdered) {
      $scope.partorder.timeOrdered = DS.displayLocal(new Date($scope.partorder.timeOrdered));
    }
    if ($scope.partorder.timeComplete) {
      $scope.partorder.timeComplete = DS.displayLocal(new Date($scope.partorder.timeComplete));
    }
  };

  // Set Validity of Part Order --------------------
  $scope.isValid = () => {
    if (($scope.partorder.part.quantity > 0) && $scope.partorder.originNSID && $scope.partorder.destinationNSID) {
      $scope.valid = true;
    } else {
      $scope.valid = false;
    }
  };
  $scope.$watch('partorder.part.quantity', (newVal, oldVal)  => {
    if ( newVal !== oldVal ) {
      $scope.isValid();
    }
  });
  $scope.$watch('partorder.originNSID', (newVal, oldVal) => {
    if ( newVal !== oldVal ) {
      $scope.isValid();
    }
  });
  $scope.$watch('partorder.destinationNSID', (newVal, oldVal) => {
    if(newVal !== oldVal){
      $scope.isValid();
      $scope.partorder.truckId = LocationItemService.getTruckFromNSID($scope.partorder.destinationNSID,$scope.locations);
    }
  });
  // -----------------------------------------------

  // Make shift part order -------------------------
  function newPartOrder () {
    return {
      partNSID: null,
      quantity: null,

      timeCreated: null,

      comment: '',
      trackingNumber: '',

      techId: '',
      originNSID: '',
      destinationNSID: '',
      part: {}
    }
  }
  // Passed Functions to Add Part Component -------
  $scope.addManualPart = (part) => {
    $scope.partorder.part = part;
  };

  $scope.deletePart = () => {
    $scope.partorder.part = {};
  };

  $scope.originChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.destinationChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };
  // -----------------------------------------------

  // Construction for Search Table -----------------
  $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'replace',$scope.partorder);
  // -----------------------------------------------

  // Save Part Order -------------------------------
  $scope.save = () => {
    // Set Last Variables
    const now = new Date();
    $scope.partorder.partNSID = $scope.partorder.part.netsuiteId;
    $scope.partorder.quantity = $scope.partorder.part.quantity;
    $scope.partorder.timeCreated = now;
    $scope.partorder.timeSubmitted = now;
    $scope.partorder.techId = $scope.techId;
    setTimesToSave();
    // Finally save new Part Order
    PartOrders.save({},$scope.partorder,
      (res) => {
        AlertService.add('success', "Successfully created Part Order!");
        $location.url('/partorder');
      },
      (err) => {
        setTimesToDisplay();
        AlertService.add('danger', 'An error occurred while attempting to save.');
        console.log(err);
      }
    );
  };
  // -----------------------------------------------
}]);

function PartOrderCtrl ($scope, $http, $timeout, $location, $q, $cookies, AlertService, LocationItemService, ApiRequestService, locations, DateService) {
    // Variables-----------------------------------------
    const ARS = ApiRequestService
    const DS = DateService
    $scope.loaded = true
    $scope.spinner = true
    $scope.POSearchCount = 0
    $scope.infiniteScroll = false
    $scope.locations = locations
    // --------------------------------------------------

    // Turn Spinner Off ---------------------------------
    $scope.spinnerOff = () => {
        $scope.spinner = false
    }
    $scope.spinnerOn = () => {
        $scope.spinner = true
    }
    // --------------------------------------------------

    // Make the po go into the list of pos to send to next page
    $scope.listIt = (po) => {
        po.inList = !!po.inList
    }
    // --------------------------------------------------

    // Passed to Component ------------------------------
    // Function called any time Page loads or user scrolls past 50 units
    $scope.lookup = (query) => {
        query.skip = 0
        $scope.infiniteScroll = false
        $scope.loaded = false
        $scope.spinnerOn()
        console.log('Looking up Part Orders...')
        ARS.PartOrders(query)
           .then((partorders) => {
               console.log(partorders)
               console.log('Part Orders Loaded.')
               $scope.partorders = partorders.map(mapPartOrders)
               $scope.loaded = true
               $scope.spinnerOff()
               ARS.http.get.PartOrdersNoIdentityCount(query)
                  .then((res) => {
                      $scope.POSearchCount = res.data
                      if (query.skip < $scope.POSearchCount) {
                          query.skip += query.limit
                          $scope.infiniteScroll = true
                          $scope.PartOrderScrollLookup(query)
                      }
                  }, (err) => {
                      console.error(`Counting PO Error: ${err}`)
                  })
           })
           .catch((err) => console.log('Failed to load: ', err))
    }

    $scope.$on('$destroy', function () {
        $scope.infiniteScroll = false
    })

    $scope.report = (query) => {
        $http({
            cache:  false,
            method: 'GET',
            url:    'api/PartOrderDump',
            params: query,
        })
            .then((res) => {
                let D = document
                let a = D.createElement('a')
                let strMimeType = 'application/octet-stream;charset=utrf-8'
                let rawFile

                if ('download' in a) {
                    const blob = new Blob([res.data], {
                        type: strMimeType,
                    })
                    rawFile = URL.createObjectURL(blob)
                    a.setAttribute('download', 'PartsReport.csv')
                } else {
                    rawFile = 'data:' + strMimeType + ',' + encodeURIComponent(res.data)
                    a.setAttribute('target', '_blank')
                }
                a.href = rawFile
                a.setAttribute('style', 'display:none;')
                D.body.appendChild(a)
                setTimeout(function () {
                    if (a.click) {
                        a.click()
                        // Workaround for Safari 5
                    } else if (document.createEvent) {
                        const eventObj = document.createEvent('MouseEvents')
                        eventObj.initEvent('click', true, true)
                        a.dispatchEvent(eventObj)
                    }
                    D.body.removeChild(a)

                }, 100)
            }, (err) => {
                AlertService.add('danger', 'Report failed to load', 2000)
                console.log(err)
            })
        /*$http({method: 'GET', url: '/api/partorders', params: query})
            .then((res) => {
                    const anchor = angular.element('<a/>')
                    anchor.attr({
                        href:     'data:attachment/csv;charset=utf-8,' + encodeURI(res.data),
                        target:   '_blank',
                        download: 'PartsReport.csv',
                    })[0].click()
                },
                (err) => {
                    AlertService.add('danger', 'Report failed to load', 2000)
                    console.log(err)
                },
            )*/
    }

    $scope.PartOrderScrollLookup = (query) => {
        console.log('Looking up Part Orders...')
        ARS.PartOrders(query)
           .then((partorders) => {
               console.log('Part Orders Loaded.')
               const po = partorders.map(mapPartOrders)
               $scope.partorders = $scope.partorders.concat(po)
               if ($scope.infiniteScroll) {
                   if (query.skip < $scope.POSearchCount) {
                       query.skip += query.limit
                       $scope.infiniteScroll = true
                       $scope.PartOrderScrollLookup(query)
                   } else if ($scope.partorders.length === $scope.POSearchCount) {
                       $scope.infiniteScroll = false
                   }
               }
           })
           .catch((err) => console.log('Failed to load part orders: ', err))
    }
    // --------------------------------------------------

    // Create sorting parameters ------------------------
    function mapPartOrders (po) {
        po.timeSubmitted = DS.displayLocal(new Date(po.timeSubmitted))
        po.epoch = new Date(po.timeSubmitted).getTime()
        po.destination = LocationItemService.getNameFromNSID(po.destinationNSID, $scope.locations)
        po.inList = !!po.inList

        return po
    }

    // --------------------------------------------------

    // Routing ------------------------------------------
    $scope.createPartOrder = () => {
        $location.url('/partorder/create')
    }
    // --------------------------------------------------
}
angular.module('PartOrderApp.Controllers')
       .controller('PartOrderCtrl',
           ['$scope', '$http', '$timeout', '$location', '$q', '$cookies', 'AlertService', 'LocationItemService', 'ApiRequestService', 'locations', 'DateService', PartOrderCtrl]);

angular.module('PartOrderApp.Controllers')
.controller('PartOrderEditCtrl',
  ['$scope', '$location', '$timeout', '$cookies', 'AlertService', 'ObjectService', 'LocationItemService', 'PartOrders', 'InventoryTransfers', 'partorder', 'locations', 'DateService',
function ($scope, $location, $timeout, $cookies, AlertService, ObjectService, LocationItemService, PartOrders, InventoryTransfers, partorder, locations, DateService) {
  // Variables ----------------------------------------
  const DS = DateService;
  $scope.locations = locations;
  $scope.partorder = partorder;
  // --------------------------------------------------

  const setSave = () => {
    if ($scope.partorder.timeCreated) {
      $scope.partorder.timeCreated = DS.saveToOrion(new Date($scope.partorder.timeCreated));
    }
    if ($scope.partorder.timeSubmitted) {
      $scope.partorder.timeSubmitted = DS.saveToOrion(new Date($scope.partorder.timeSubmitted));
    }
    if ($scope.partorder.timeOrdered) {
      $scope.partorder.timeOrdered = DS.saveToOrion(new Date($scope.partorder.timeOrdered));
    }
    if ($scope.partorder.timeComplete) {
      $scope.partorder.timeComplete = DS.saveToOrion(new Date($scope.partorder.timeComplete));
    }
  };
  const setDisplay = () => {
    if ($scope.partorder.timeCreated) {
      $scope.partorder.timeCreated = DS.displayLocal(new Date($scope.partorder.timeCreated));
    }
    if ($scope.partorder.timeSubmitted) {
      $scope.partorder.timeSubmitted = DS.displayLocal(new Date($scope.partorder.timeSubmitted));
    }
    if ($scope.partorder.timeOrdered) {
      $scope.partorder.timeOrdered = DS.displayLocal(new Date($scope.partorder.timeOrdered));
    }
    if ($scope.partorder.timeComplete) {
      $scope.partorder.timeComplete = DS.displayLocal(new Date($scope.partorder.timeComplete));
    }
  };

  // Passed Functions to Edit  ------------------------
  $scope.headerSelectFieldChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.headerTextFieldChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.changeThisTextField = (changedData, selected) => {
    if(selected === 'carrier'){
      ObjectService.updateNonNestedObjectValue($scope.partorder, changedData.toUpperCase(), selected);
    }
  };

  $scope.changeThisTextAreaField = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };
  // --------------------------------------------------

  // Passed function to Edit Table --------------------
  $scope.changeStatus = (changedData, selected) => {
    $scope.partorder.status = selected;
  };
    $scope.changeQuantity = (changedData, selected) => {
        $scope.partorder.quantity = changedData
    }
  // --------------------------------------------------

  // Submit Changes to Part Order ---------------------
  $scope.submit = (status) => {
    let ableToSubmit = true;
    if ( (status === 'canceled') && !$scope.partorder.comment ) {
      AlertService.add('danger', 'Please fill out the comment box if canceling a part order.');
      ableToSubmit = false;
    }
    if ( (status === 'ordered') && (!$scope.partorder.poNumber)) {
      AlertService.add('danger', 'Please fill out the PO number. If none leave N/A');
      ableToSubmit = false;
    }

    if ( ableToSubmit ) {
      if ( status === 'ordered' || status === 'backorder' || status === 'canceled' ) {
        $scope.partorder.approvedBy = $cookies.get('tech');
      }

      if ( status === 'completed' ) {
        $scope.partorder.completedBy = $cookies.get('tech');
      }

      if( status === 'canceled' && $scope.partorder.source === 'Orion'){
        $scope.partorder.completedBy = $cookies.get('tech');
      }
      if (status === 'ordered') {
        $scope.partorder.timeOrdered = new Date();
      }
      setSave();
      PartOrders.update({ id: $scope.partorder.orderId}, $scope.partorder,
        (res) => {
          AlertService.add('success', "Update was successful.");
          console.log(res);
          // If successful create Inventory Transfer
          if ( res.status === 'completed' ) {
            const thisIT = $scope.newInventoryTransfer();
            thisIT.originLocationNSID = res.originNSID;
            thisIT.destinationLocationNSID = res.destinationNSID;

            thisIT.originLocation = LocationItemService.getIDFromNSID(res.originNSID, $scope.locations);
            thisIT.destinationLocation = LocationItemService.getIDFromNSID(res.destinationNSID, $scope.locations);

            thisIT.truckId = LocationItemService.getTruckFromNSID(res.destinationNSID, $scope.locations);

            thisIT.parts.push(res.part);
            thisIT.parts[0].netsuiteId = res.partNSID;
            thisIT.parts[0].quantity = res.quantity;

            InventoryTransfers.save({}, thisIT,
              (res) => {
                console.log("Inventory Transfer Created.");
                $scope.completeForm();
              },
              (err) => {
                setDisplay();
                AlertService.add('danger', 'An error occurred while attempting to save inventory transfer.');
                console.log(err);
              }
            );
          } else {
            $scope.completeForm();
          }
        },
        function (err) {
          setDisplay();
          console.log(err);
          AlertService.add('danger', 'An error occurred while attempting to update this part order.');
        }
      );
    }
  };
  // --------------------------------------------------

  // Create IT model for new IT -----------------------
  $scope.newInventoryTransfer = () => ({
      inventorytransferDate: DS.saveToOrion(new Date()),

      truckId: '',

      originLocation: null,
      originLocationNSID: '',
      destinationLocation: null,
      destinationLocationNSID: '',

      parts: [],

      techId: $scope.partorder.techId
    });
  // --------------------------------------------------


  // Route back ---------------------------------------
  $scope.completeForm = () => {
    $location.url('/partorder')
  };
  setDisplay();
  // --------------------------------------------------
}]);

angular.module('PartOrderApp.Controllers')
.controller('PartOrderReviewCtrl',
  ['$scope', 'partorder', 'locations', 'DateService',
function ($scope, partorder, locations, DateService) {

  // Variables -------------------------------------
  const DS = DateService;
  $scope.locations = locations;
  $scope.partorder = partorder;
  // -----------------------------------------------

  // init
  if ($scope.partorder.timeCreated) {
    $scope.partorder.timeCreated = DS.displayLocal(new Date($scope.partorder.timeCreated));
  }
  if ($scope.partorder.timeSubmitted) {
    $scope.partorder.timeSubmitted = DS.displayLocal(new Date($scope.partorder.timeSubmitted));
  }
  if ($scope.partorder.timeOrdered) {
    $scope.partorder.timeOrdered = DS.displayLocal(new Date($scope.partorder.timeOrdered));
  }
  if ($scope.partorder.timeComplete) {
    $scope.partorder.timeComplete = DS.displayLocal(new Date($scope.partorder.timeComplete));
  }
}]);

angular.module('PartOrderApp.Controllers')
  .controller('PartOrdersEditCtrl', ['$scope', '$location', '$timeout', '$cookies', 'AlertService', 'ObjectService', 'LocationItemService', 'PartOrders', 'InventoryTransfers', 'partorders', 'locations', 'DateService',
    function ($scope, $location, $timeout, $cookies, AlertService, ObjectService, LocationItemService, PartOrders, InventoryTransfers, partorders, locations, DateService) {

      // Variables ----------------------------------------
      const AS = AlertService;
      const DS = DateService;
      const LIS = LocationItemService;
      $scope.locations = locations;
      $scope.partorders = partorders;
      $scope.comment = '';
      // --------------------------------------------------

      $scope.status = [
        { type: 'ordered', value: false },
        { type: 'backorder', value: false },
        { type: 'canceled', value: false },
        { type: 'completed', value: false }
      ];
      $scope.type = {};
      $scope.disabled = false;

      const isComplete = () => {
        $scope.partorders.forEach((po) => {
          if ((po.status === 'canceled' || po.status === 'completed') && po.timeComplete) {
            $scope.disabled = true;
          }
        });
      };

      // Change Selected Check box --------------------------
      $scope.changeCheckBoxes = (data, selected) => {
        _.map($scope.status,(obj) => {
          if ( obj.type === selected ){
            obj.value = true;
            $scope.type = obj;
            $scope.status.forEach((x) => {
              if( x.type !== selected ){
                x.value = false;
              }
            });
          }
        });
      };
      // ----------------------------------------------------

      const setSave = (po) => {
        if (po.timeCreated) {
          po.timeCreated = DS.saveToOrion(new Date(po.timeCreated));
        }
        if (po.timeSubmitted) {
          po.timeSubmitted = DS.saveToOrion(new Date(po.timeSubmitted));
        }
        if (po.timeOrdered) {
          po.timeOrdered = DS.saveToOrion(new Date(po.timeOrdered));
        }
        if (po.timeComplete) {
          po.timeComplete = DS.saveToOrion(new Date(po.timeComplete));
        }
      };
      const setDisplay = () => {
        $scope.partorders.forEach((po) => {
          if (po.timeCreated) {
            po.timeCreated = DS.displayLocal(new Date(po.timeCreated));
          }
          if (po.timeSubmitted) {
            po.timeSubmitted = DS.displayLocal(new Date(po.timeSubmitted));
          }
          if (po.timeOrdered) {
            po.timeOrdered = DS.displayLocal(new Date(po.timeOrdered));
          }
          if (po.timeComplete) {
            po.timeComplete = DS.displayLocal(new Date(po.timeComplete));
          }
        });
      };

      const setDestinationLocation = () => {
        $scope.partorders.forEach((po) => {
          po.destinationLocationName = LIS.getNameFromNSID(po.destinationNSID, $scope.locations);
        });
      };

      $scope.headerSelectFieldChange = (changedData, selected) => {
        $scope.partorders.forEach((po) => {
          po[selected] = changedData;
        });
      };

      $scope.changeThisTextAreaField = (changedData, selected) => {
        $scope.partorders.forEach((po) => {
          po[selected] = changedData;
        })
      };

      $scope.headerTextFieldChange = (changedData, selected) => {
        $scope.partorders.forEach((po) => {
          po[selected] = changedData
        });
      };

      // Passed function to Edit Table --------------------
      $scope.changeStatus = (changedData, selected) => {
        $scope.partorders.forEach((po) => po.status = selected);
      };
      // --------------------------------------------------

      // Submit changes of POs ----------------------------
      $scope.submit = (status) => {
        let ableToSubmit = true;
        let commenError = false;
        let poNumberError = false;
        let statusError = false;
        let originError = false;
        $scope.partorders.forEach((po) => {
          if (po.status === 'canceled' && !po.comment) {
            commenError = true;
            ableToSubmit = false;
          }
          if (po.status === 'ordered' && !po.poNumber) {
            poNumberError = true;
            ableToSubmit = false;
          }
          if (!po.status) {
            statusError = true;
            ableToSubmit = false;
          }
          if (!po.originNSID) {
            ableToSubmit = false;
            originError = true;
          }
        });
        if (!ableToSubmit) {
          if (commenError) {
            AS.add('danger', 'Please fill out the comment box if canceling a part order.');
          }
          if (poNumberError) {
            AS.add('danger', 'Please fill out the PO number. If none leave N/A');
          }
          if (statusError) {
            AS.add('danger', 'Must select a status');
          }
          if (originError) {
            AS.add('danger', 'Must select Origin')
          }
        } else {
          const tech = $cookies.get('tech');
          const now = new Date();
          $scope.partorders.forEach((po) => {
            if ( po.status === 'ordered' || po.status === 'backorder' || po.status === 'canceled' ) {
              po.approvedBy = tech;
            }

            if ( po.status === 'completed' ) {
              po.completedBy = tech;
            }

            if( po.status === 'canceled' && po.source === 'Orion'){
              po.completedBy = tech;
            }
            if (po.status === 'ordered') {
              po.timeOrdered = now;
            }
            setSave(po);
            PartOrders.update({ id: po.orderId}, po,
              (res) => {
                AS.add('success', "Update was successful.");
                console.log(res);
                // If successful create Inventory Transfer
                if ( res.status === 'completed' ) {
                  const thisIT = $scope.newInventoryTransfer();
                  thisIT.originLocationNSID = res.originNSID;
                  thisIT.destinationLocationNSID = res.destinationNSID;

                  thisIT.originLocation = LocationItemService.getIDFromNSID(res.originNSID, $scope.locations);
                  thisIT.destinationLocation = LocationItemService.getIDFromNSID(res.destinationNSID, $scope.locations);

                  thisIT.truckId = LocationItemService.getTruckFromNSID(res.destinationNSID, $scope.locations);

                  thisIT.parts.push(res.part);
                  thisIT.parts[0].netsuiteId = res.partNSID;
                  thisIT.parts[0].quantity = res.quantity;

                  InventoryTransfers.save({}, thisIT,
                    (res) => {
                      console.log("Inventory Transfer Created.");
                      $scope.completeForm();
                    },
                    (err) => {
                      setDisplay();
                      AS.add('danger', 'An error occurred while attempting to save inventory transfer.');
                      console.log(err);
                    }
                  );
                } else {
                  $scope.completeForm();
                }
              },
              function (err) {
                setDisplay();
                console.log(err);
                AlertService.add('danger', 'An error occurred while attempting to update this part order.');
              }
            );
          });
        }
      };
      // --------------------------------------------------
      // Route back ---------------------------------------
      $scope.completeForm = () => {
        $location.url('/partorder')
      };
      // --------------------------------------------------

      setDisplay();
      setDestinationLocation();
      isComplete();
    }]);

angular.module('UnitApp.Components')
  .component('unitMap', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitMap.html',
    bindings: {
      units: '<',
      bounds: '<'
    },
    controller: ['$scope',class UnitMapCtrl {
      constructor($scope) {
        // Map creation and events ----------------------------
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 4,
          mapEvents: {
            click: (marker, eventName, model) => {
              const thisMarker = {
                id: 0,
                geo: {
                  type: 'Point',
                  coordinates: [0.0,0.0]
                }
              };
              thisMarker.geo.coordinates[0] = model[0].latLng.lng().toFixed(6);
              thisMarker.geo.coordinates[1] = model[0].latLng.lat().toFixed(6);
              this.map.CoordInfoWindow.marker = thisMarker;
              // need to re-render map when new marker is placed on click
              $scope.$apply();
            }
          },
          options: {
            pixelOffset: {
              width: -1,
              height: -45
            }
          },
        // ----------------------------------------------------
        
        // Marker and events for finding Coordinates ----------
          CoordMarkerEvents: {
            click: (marker, eventName, model) => {
              this.map.CoordInfoWindow.model = model;
              this.map.CoordInfoWindow.show = true;
              this.map.unitInfoWindow.show = false;
            }
          },
          CoordInfoWindow: {
            marker: {id: 0},
            show: false,
            closeClick: function() {
              this.show = false;
            }
          },
        // ----------------------------------------------------
  
        // Markers and events for Units -----------------------
          unitMarkerEvents: {
            click: (marker, eventName, model) => {
              this.map.unitInfoWindow.model = model;
              this.map.unitInfoWindow.show = true;
              this.map.CoordInfoWindow.show = false;
            }
          },
          unitInfoWindow: {
            marker: {},
            show: false,
            closeClick: function() {
              this.show = false;
            }
          }
        // ----------------------------------------------------
        };
        this.options = {scrollwheel: false};
      }
    }]
  });


angular.module('UnitApp.Components')
  .component('unitPage', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitPage.html',
    bindings: {
      coords: '<'
    },
    controller: ['$scope', '$timeout', 'uiGmapGoogleMapApi', class UnitPageCtrl {
      constructor($scope, $timeout, uiGmapGoogleMapApi) {
        this.showMap = false;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.ui = uiGmapGoogleMapApi;
        // Map creation and events ----------------------------
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 13,
          bounds: {},
          mapEvents: {
            click: (marker, eventName, model) => {
              const thisMarker = {
                id: 3,
                geo: {
                  type: 'Point',
                  coordinates: [0.0, 0.0]
                }
              };
              thisMarker.geo.coordinates[0] = model[0].latLng.lng().toFixed(6);
              thisMarker.geo.coordinates[1] = model[0].latLng.lat().toFixed(6);
              this.map.CoordInfoWindow.marker = thisMarker;
              // need to re-render map when new marker is placed on click
              $scope.$apply();
            }
          },
          options: {
            pixelOffset: {
              width: -1,
              height: -45
            }
          },
          // ----------------------------------------------------

          // Marker and events for finding Coordinates ----------
          CoordMarkerEvents: {
            click: (marker, eventName, model) => {
              this.map.CoordInfoWindow.model = model;
              this.map.CoordInfoWindow.show = true;
            }
          },
          CoordInfoWindow: {
            marker: {id: 3},
            show: false,
            closeClick: function() {
              this.show = false;
            }
          }
          // ----------------------------------------------------
        };

        this.options = {scrollwheel: true};
      }
      // ----------------------------------------------------

      // Initialize map and add unit marker -----------------
      $onInit() {
        this.map.center = {latitude: this.coords[1], longitude: this.coords[0]};

        this.marker = {
          id: 4,
          geo: {type: 'Point', coordinates: this.coords},
        };

        this.ui.then(() => {
          this.$timeout(() => {

            this.showMap = true;
          }, 100)
        })

      }
      // ----------------------------------------------------
    }]
  });

angular.module('UnitApp.Components')
  .component('unitSat', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitSat.html',
    bindings: {
      unit: '<'
    },
    controller: ['$scope', '$timeout', 'uiGmapGoogleMapApi', class UnitSatCtrl {
      constructor($scope, $timeout, uiGmapGoogleMapApi) {
        this.showMap = false;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.ui = uiGmapGoogleMapApi;
        // Map creation and events ----------------------------
        this.map = {
          center: {
            latitude: 37.996162679728116,
            longitude: -98.0419921875
          },
          zoom: 18,
          bounds: {},
          mapEvents: {
            click: (marker, eventName, model) => {
              const thisMarker = {
                id: 1,
                geo: {
                  type: 'Point',
                  coordinates: [0.0, 0.0]
                }
              };
              thisMarker.geo.coordinates[0] = model[0].latLng.lng().toFixed(6);
              thisMarker.geo.coordinates[1] = model[0].latLng.lat().toFixed(6);
              this.map.CoordInfoWindow.marker = thisMarker;
              // need to re-render map when new marker is placed on click
              $scope.$apply();
            }
          },
          options: {
            pixelOffset: {
              width: -1,
              height: -45
            }
          },
        // ----------------------------------------------------
  
        // Marker and events for finding Coordinates ----------
          CoordMarkerEvents: {
            click: (marker, eventName, model) => {
              this.map.CoordInfoWindow.model = model;
              this.map.CoordInfoWindow.show = true;
            }
          },
          CoordInfoWindow: {
            marker: {id: 1},
            show: false,
            closeClick: function() {
              this.show = false;
            }
          }
        // ----------------------------------------------------
        };

        this.options = {scrollwheel: false, mapTypeId: google.maps.MapTypeId.SATELLITE};
      }
      // ----------------------------------------------------

      // Initialize map and add unit marker -----------------
      $onInit() {
        this.map.center = _.cloneDeep(this.unit.geo);
  
        let now = new Date();
        let inSevenDays = moment().add(7, 'days');
          let pmDate = null
          const nextd = new Date(this.unit.nextPmDate ? this.unit.nextPmDate : null).getTime()
          const nextD = new Date(this.unit.nextPM1Date ? this.unit.nextPM1Date : null).getTime()
          if (nextD > nextd) {
              pmDate = this.unit.nextPM1Date ? new Date(this.unit.nextPM1Date) : null
          } else {
              pmDate = this.unit.nextPmDate ? new Date(this.unit.nextPmDate) : null
          }
  
        let icon = 'lib/public/images/marker_grey.png';
        if(pmDate) {
          //If pmDate has passed, icon is red
          if (moment(now).isAfter(pmDate, 'day')) {
            icon = 'lib/public/images/marker_red.png';
          }
          //If pmDate is under 7 days away, icon is yellow
          else if(moment(inSevenDays).isAfter(pmDate, 'day')) {
            icon = 'lib/public/images/marker_yellow.png';
          }
          //pmDate hasn't passed and is more than 7 days away
          else {
            icon = 'lib/public/images/marker_green.png';
          }
        }
  
        this.marker = {
          id: 0,
          geo: this.unit.geo,
          options: {
            icon
          }
        };
        
        this.ui.then(() => {
          this.$timeout(() => {
            this.showMap = true;
          }, 100)
        })
        
      }
      // ----------------------------------------------------
    }]
  });

angular.module('UnitApp.Components')
  .component('unitSearch', {
    templateUrl: '/lib/public/angular/apps/unit/views/component-views/unitSearch.html',
    bindings: {
      populateUnits: '&',
      onTypeaheadChange: '&',
      displayUnits: '<',
      users: '<',
      customers: '<',
    },
    controller: [ class UnitSearchCtrl {
      constructor() {
        this.params = {
          numbers: null, //Unit Numbers
          supervisor: null, //Supervisor techID
          techs: null, //TechID unit is assigned to
          customer: null,
          from: null,
          to: null,
          size: 99999
        };
      }
      
      // Search Changes -------------------------------------
      unitChange(changedData, selected) {
        this.onTypeaheadChange({ changedData, selected });
      }
      supervisorChange(changedData, selected) {
        this.onTypeaheadChange({ changedData, selected });
      }
      techChange(changedData, selected) {
        this.onTypeaheadChange({ changedData, selected });
      }
      customerChange(changedData, selected){
        this.onTypeaheadChange({ changedData, selected });
      }
      // ----------------------------------------------------
      
      // Clear search terms ---------------------------------
      clearText(selected){
        switch (selected) {
          case 'unitNumber':
            this.params.numbers = null;
            break;
          case 'supervisor':
            this.params.supervisor = null;
            break;
          case 'tech':
            this.params.techs = null;
            break;
          case 'customer':
            this.params.customer = null;
            break;
        }
      }
      // ----------------------------------------------------
  
      // Send search to Parent to populate Units ------------
      search() {
        const params = _.omitBy(this.params, _.isNull);
        this.populateUnits({params});
      }
      // ----------------------------------------------------
    }]
  });



angular.module('UnitApp.Controllers').controller('UnitIndexCtrl',
['$scope', 'AlertService', 'ApiRequestService',
function ($scope, AlertService, ApiRequestService) {
  
  // Variables ------------------------------------------
  const ARS = ApiRequestService;               // local
  $scope.title = "Units Map";                  // local
  $scope.units = [];                           // to UnitMap
  $scope.bounds = {};                          // to UnitMap
  $scope.displayUnitsFromController = [];      // to UnitSearch
  $scope.displayUsersFromController = [];      // to UnitSearch
  $scope.displayCustomersFromController = [];  // to UnitSearch
  // ----------------------------------------------------
  
  // Get Units on Search --------------------------------
  $scope.setUnits = (params) => {
    if(params.hasOwnProperty("numbers")) {
      params.numbers = params.numbers.replace(/\s/g,'').split(",");
    }
    if(params.hasOwnProperty("techs")) {
      params.techs = params.techs.replace(/\s/g,'').split(",");
    }
    ARS.Units(params)
      .then((units) => {
        $scope.units = units.map((unit) => {
          let now = new Date();
          let inSevenDays = moment().add(7, 'days');
            let pmDate = null
            const nextd = new Date(unit.nextPmDate ? unit.nextPmDate : null).getTime()
            const nextD = new Date(unit.nextPM1Date ? unit.nextPM1Date : null).getTime()
            if (nextD > nextd) {
                pmDate = unit.nextPM1Date ? new Date(unit.nextPM1Date) : null
            } else {
                pmDate = unit.nextPmDate ? new Date(unit.nextPmDate) : null
            }
          
          let icon = 'lib/public/images/marker_grey.png';
          if(pmDate) {
            //If pmDate has passed, icon is red
            if (moment(now).isAfter(pmDate, 'day')) {
              icon = 'lib/public/images/marker_red.png';
            }
            //If pmDate is under 7 days away, icon is yellow
            else if(moment(inSevenDays).isAfter(pmDate, 'day')) {
              icon = 'lib/public/images/marker_yellow.png';
            }
            //pmDate hasn't passed and is more than 7 days away
            else {
              icon = 'lib/public/images/marker_green.png';
            }
          }
  
          return {
            id: unit.number,
            geo: unit.geo,
            show: false,
            productSeries: unit.productSeries,
            locationName: unit.locationName,
            customerName: unit.customerName,
            assignedTo: unit.assignedTo,
            pmDate,
            icon
          }
        })
      })
      .catch( (err) => {
        AlertService.add('danger', "Failed to load", 2000);
        console.log(err);
      });
  };
  // ----------------------------------------------------
  
  // Component methods ----------------------------------
  $scope.typeaheadChange = function (changedData, selected) {
    if(selected === 'unitNumber'){
      ARS.Units({regexN: changedData})
        .then((units) => {
          $scope.displayUnitsFromController = units;
        })
        .catch((err) => console.log(err))
    } else if( selected === 'supervisor' || selected === 'tech'){
      //const name = changedData.toUpperCase();
      ARS.Users({ regexName: name })
        .then((users) => {
          const userArray = [];
          if(users.length > 0){
            for(let user in users){
              if(users.hasOwnProperty(user)){
                if(users[user].hasOwnProperty('firstName')){
                  const fullName = users[user].firstName.concat(" ").concat(users[user].lastName);
                  const thisUser = users[user];
                  thisUser.fullName = fullName;
                  userArray.push(thisUser);
                }
              }
            }
            $scope.displayUsersFromController = userArray;
          }
        })
        .catch((err) => console.log(err));
    } else if( selected === 'customer'){
      ARS.Customers({ regexName: changedData })
        .then((customers) => {
          $scope.displayCustomersFromController = customers;
        })
        .catch((err) => console.log(err));
    }
  }
  // ----------------------------------------------------
}]);

function UnitViewCtrl ($window, $scope, $route, $location, AlertService, SessionService, ApiRequestService, unit, states, counties) {

    // Variables ------------------------------------------
    const ARS = ApiRequestService
    const SS = SessionService
    $scope.unit = unit
    $scope.states = states
    $scope.counties = counties
    $scope.title = unit.number
    $scope.user = {}
    $scope.supervisor = {}
    // ----------------------------------------------------

    // Populate state and County --------------------------
    if (unit.state) {
        $scope.states.forEach((state) => {
            if (state._id === unit.state) {
                unit.state = state
            }
        })
    }
    if (unit.county) {
        $scope.counties.forEach((county) => {
            if (county._id === unit.county) {
                unit.county = county
            }
        })
    }
    // ----------------------------------------------------

    //fetch user info for PM Report -----------------------
    if (unit.assignedTo) {
        ARS.getUser({id: unit.assignedTo})
           .then((user) => {
               $scope.user = user
               return ARS.getUser({id: user.supervisor})
           })
           .then((supervisor) => {
               $scope.supervisor = supervisor
           })
           .catch((err) => {
               AlertService.add('danger', 'Could not populate user data for PM Report')
               console.log(err)
           })
    }
    // ----------------------------------------------------

    // Routes ---------------------------------------------
    $scope.searchUnits = () => {
        SS.add('unitNumber', $scope.unit.number)
        $window.open(`#/workorder`)
    }
    // ----------------------------------------------------
}

angular.module('UnitApp.Controllers')
       .controller('UnitViewCtrl',
           ['$window', '$scope', '$route', '$location', 'AlertService', 'SessionService', 'ApiRequestService', 'unit', 'states', 'counties', UnitViewCtrl])

angular.module('UnitApp.Controllers').controller('UnitPageCtrl',
  ['coords', '$scope',
    function (coords, $scope) {
      $scope.coords = coords;
    }]);

class createComment {
    constructor ($scope, $timeout, ObjectService) {
        this.scope = $scope
        this.timeout = $timeout
        this.OS = ObjectService
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

    /**
     * Used to change data on the work order
     * @param changedData
     * @param selected
     */
    changeThisField (changedData, selected) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, changedData, selected)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createComment', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/comment.html',
        bindings: {
            callBack: '&',
            workorder: '<',
        },
        controller: ['$scope', '$timeout', 'ObjectService', createComment]
    })

class createHeaderInfo {
    constructor ($scope, $timeout, ApiRequestService) {
        this.ARS = ApiRequestService
        this.scope = $scope
        this.timeout = $timeout

        this.countiesArray = []
        this.unitLocationArray = []
        this.customersArray = []
        this.unitNumberArray = []

        this.unitNumberChange = this.unitNumberChange.bind(this)
        this.getAssetTypeNSID = this.getAssetTypeNSID.bind(this)
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

    getAssetTypeNSID(ps) {
        let NSID = null
        this.assetTypes.forEach((asset) => {
            if (asset.type === ps) {
                NSID = asset.netsuiteId
            }
        })
        return NSID
    }

    /*
    * Methods to dynamically create lists for user typeaheads
    * */
    countyNameChange(input) {
        this.timeout(() => {
            this.ARS.Counties({regexN: input, limit: 12})
                .then((counties) => {
                    this.countiesArray = counties
                })
                .catch(console.error)
        })
    }
    leaseChange(input) {
        this.timeout(() => {
            this.ARS.Units({regexL: input})
                .then((units) => {
                    this.unitLocationArray = units
                })
                .catch(console.error)
        })
    }
    customerChange(input) {
        this.timeout(() => {
            this.ARS.Customers({regexName: input})
                .then((customers) => {
                    this.customersArray = customers
                })
                .catch(console.error)
        })
    }
    unitNumberChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.ARS.Units({regexN: input})
                    .then((units) => {
                        this.unitNumberArray = units
                        units.forEach((unit) => {
                            if (unit.number === input) {
                                const thisUnit = unit

                                let engineObj
                                if (thisUnit.engineModel) {
                                    this.engineModels.forEach((engine) => {
                                        if (engine.netsuiteId === thisUnit.engineModel) {
                                            engineObj = engine
                                        }
                                    })
                                }
                                let frameObj
                                if (thisUnit.frameModel) {
                                    this.frameModels.forEach((frame) => {
                                        if (frame.netsuiteId === thisUnit.frameModel) {
                                            frameObj = frame
                                        }
                                    })
                                }

                                for (let u in wo.header) {
                                    if (wo.header.hasOwnProperty(u)) {
                                        if (u === 'state' || u === 'county' || u === 'leaseName' || u === 'unitNumber' || u === 'customerName') {
                                            wo.header[u] = ''
                                        }
                                    }
                                }

                                wo.unitReadings.engineModel = ''
                                wo.unitReadings.compressorModel = ''
                                wo.unitReadings.displayEngineModel = ''
                                wo.unitReadings.displayFrameModel = ''
                                wo.geo.coordinates[0] = 0
                                wo.geo.coordinates[1] = 0


                                du = thisUnit
                                if (thisUnit.county) {
                                    this.ARS.http.get.county(thisUnit.county)
                                        .then((res) => {
                                            wo.header.county = res.data.name
                                            du.county = res.data.name
                                        }, (err) => {
                                            console.error(err)
                                        })
                                }
                                if (thisUnit.state) {
                                    this.ARS.http.get.state(thisUnit.state)
                                        .then((res) => {
                                            wo.header.state = res.data.name
                                            du.state = res.data.name
                                        }, (err) => {
                                            console.error(err)
                                        })
                                }

                                wo.header.leaseName = thisUnit.locationName
                                wo.header.customerName = thisUnit.customerName
                                wo.header.unitNumber = thisUnit.number
                                wo.header.unitNumberNSID = thisUnit.netsuiteId
                                wo.unitNumber = wo.header.unitNumber
                                wo.geo = thisUnit.geo
                                wo.unitReadings.engineSerial = thisUnit.engineSerial
                                wo.unitReadings.compressorSerial = thisUnit.compressorSerial
                                wo.assetType = this.getAssetTypeNSID(thisUnit.productSeries)
                                wo.geo.coordinates[0] = thisUnit.geo.coordinates[0]
                                wo.geo.coordinates[1] = thisUnit.geo.coordinates[1]
                                wo.jsa.customer = thisUnit.customerName
                                wo.jsa.location = thisUnit.locationName
                                wo.unit = thisUnit._id
                                wo.unitReadings.displayEngineModel = engineObj !== undefined ? engineObj.model : ''
                                wo.unitReadings.displayFrameModel = frameObj !== undefined ? frameObj.model : ''
                                wo.unitReadings.engineModel = engineObj !== undefined ? engineObj.netsuiteId : ''
                                wo.unitReadings.compressorModel = frameObj !== undefined ? frameObj.netsuiteId : ''
                                wo.unitSnapShot = thisUnit
                            } else if (unit.number !== undefined) {
                                wo.jsa.customer = ''
                                wo.jsa.location = ''
                            }
                        })
                    })
                    .catch(console.error)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createHeaderInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/headerInfo.html',
        bindings:    {
            callBack:         '&',
            workorder:        '<',
            states:           '<',
            applicationtypes: '<',
            engineModels:     '<',
            frameModels:      '<',
            assetTypes:       '<',
        },
        controller:  ['$scope', '$timeout','ApiRequestService', createHeaderInfo],
    })

class createPartResults {
    constructor ($scope, $timeout, Utils) {
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils
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

    removePart(part) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                const index = wo.parts.indexOf(part)
                wo.parts.splice(index, 1)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createPartResults', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/partResults.html',
        bindings: {
            callBack: '&',
            workorder: '<',
        },
        controller: ['$scope', '$timeout', 'Utils', createPartResults]
    })

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

class createUnitReadings {
    constructor ($scope, $timeout, ObjectService, Utils) {
        this.scope = $scope
        this.timeout = $timeout
        this.OS = ObjectService
        this.utils = Utils

        this.tripleInputStyling = {
            'display': 'inline-block',
            'width':   '32%',
        }
        this.inputStyling = {
            'display': 'inline-block',
            'width':   '49%',
        }

        this.engineModelChange = this.engineModelChange.bind(this)
        this.frameModelChange = this.frameModelChange.bind(this)
        this.isFound = this.isFound.bind(this)
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

    /**
     * Used to change data on the work order
     * @param changedData
     * @param selected
     */
    changeThisField (changedData, selected) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (selected === 'unitReadings.engineSerial' || selected === 'unitReadings.compressorSerial' || selected === 'newEngineSerial' || selected === 'newCompressorSerial') {
                    this.OS.updateNestedObjectValue(wo, changedData.toUpperCase(), selected)
                } else {
                    this.OS.updateNestedObjectValue(wo, changedData, selected)
                }
            })
        })
    }
    engineModelChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(input) && !this.utils.isEmpty(this.engineModels)) {
                    this.engineModels.forEach((engine) => {
                        if (engine.model === input) {
                            wo.unitReadings.displayEngineModel = engine.model
                            wo.unitReadings.engineModel = engine.netsuiteId
                        }
                    })
                } else {
                    wo.unitReadings.displayEngineModel = ''
                    wo.unitReadings.engineModel = ''
                }
            })
        })
    }
    frameModelChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(input) && !this.utils.isEmpty(this.frameModels)) {
                    this.frameModels.forEach((frame) => {
                        if (frame.model === input) {
                            wo.unitReadings.displayFrameModel = frame.model
                            wo.unitReadings.compressorModel = frame.netsuiteId
                        }
                    })
                } else {
                    wo.unitReadings.displayFrameModel = ''
                    wo.unitReadings.engineModel = ''
                }
            })
        })
    }
    isFound(input) {
        let show
        const frameModel = this.workorder.unitReadings.compressorModel
        if (frameModel && !this.utils.isEmpty(this.woInputMatrix)) {
            this.woInputMatrix.forEach((matrix) => {
                matrix.compressors.forEach((frame) => {
                    if (frame.netsuiteId === frameModel) {
                        show = true
                    }
                })
            })
        }
        const engineModel = this.workorder.unitReadings.engineModel
        if (engineModel && !this.utils.isEmpty(this.woInputMatrix)) {
            this.woInputMatrix.forEach((matrix) => {
                matrix.engines.forEach((engine) => {
                    if (engine.netsuiteId === engineModel) {
                        show = true
                    }
                })
            })
        }
        if (!engineModel && !frameModel) {
            show = false
        }
        return show
    }

    spotChange (value, text) {
        this.toCb((wo, displayUnit, unit) => {
           this.timeout(() => {
               switch (text) {
                   case 'checked':
                       wo.unitReadings.noSpotCheck = false
                       if (!value) {
                           wo.unitReadings.NOxAllowable = ''
                           wo.unitReadings.COAllowable = ''
                           wo.unitReadings.NOxGrams = ''
                           wo.unitReadings.COGrams = ''
                           wo.unitReadings.lastCalibration = null
                       }
                       break;
                   case 'not_checked':
                       wo.unitReadings.spotCheck = false
                       wo.unitReadings.NOxAllowable = ''
                       wo.unitReadings.COAllowable = ''
                       wo.unitReadings.NOxGrams = ''
                       wo.unitReadings.COGrams = ''
                       wo.unitReadings.lastCalibration = null
                       break;
                   default:
                       break;
               }
           })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createUnitReadings', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/unitReadings.html',
        bindings: {
            callBack:   '&',
            workorder:  '<',
            woInputMatrix: '<',
            frameModels: '<',
            engineModels: '<',
        },
        controller: ['$scope', '$timeout', 'ObjectService', 'Utils', createUnitReadings]
    })

class createUserInfo {
    constructor ($scope, $timeout, ObjectService, Utils) {
        this.utils = Utils
        this.OS = ObjectService
        this.scope = $scope
        this.timeout = $timeout
        this.hours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
        this.minutes = [5,10,15,20,25,30,35,40,45,50,55]
        this.techChange = this.techChange.bind(this)
        this.trucks = []
        this.techs = []
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

    $onChanges(changeObj) {
        if (changeObj.locations !== undefined && !this.utils.isEmpty(changeObj.locations.currentValue) && this.utils.isEmpty(changeObj.locations.previousValue)) {
            this.timeout(() => {
                changeObj.locations.currentValue.forEach((location) => {
                    this.trucks.push(location)
                })

            })
        }
        if (changeObj.users !== undefined && !this.utils.isEmpty(changeObj.users.currentValue) && this.utils.isEmpty(changeObj.users.previousValue)) {
            this.timeout(() => {
                changeObj.users.currentValue.forEach((user) => {
                    this.techs.push(user)
                })

            })
        }
    }

    changeThisField (changedData, selected) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, changedData, selected)
            })
        })
    }
    techChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(this.users)) {
                    this.users.forEach((user) => {
                        if (user.username === input) {
                            wo.techId = input
                        }
                    })
                }
            })
        })
    }
    truckChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(this.locations)) {
                    this.locations.forEach((location) => {
                        if (location.name === input) {
                            wo.truckId = input
                            wo.truckNSID = location.netsuiteId
                        }
                    })
                }
            })
        })
    }
}

angular
.module('WorkOrderApp.Components')
.component('createUserInfo', {
    templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/userInfo.html',
    bindings: {
        callBack: '&',
        workorder: '<',
        users: '<',
        locations: '<',
    },
    controller: ['$scope', '$timeout', 'ObjectService', 'Utils', createUserInfo],
})

class createStartEndDateCtrl {
    constructor () {
        this.dates = {
            endInput:   null,
            startInput: null,
        }
    }

    setStartTime (input) {
        this.dates.startInput = input
        this.dates.endInput = input
        if (input === null) {
            this.dates.date = null
        }
        if (typeof input === 'object' && input !== null) {
            this.setWoTimeStarted({time: input})
            this.setWoTimeSubmitted({time: input})
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('createStartEndDate', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/create/selectStartEndDate.html',
        bindings:    {
            setWoTimeStarted:   '&',
            setWoTimeSubmitted: '&',
            workorder:          '<',
        },
        controller:  [createStartEndDateCtrl],
    })

class woBillingInfo {
    constructor($scope, $timeout) {
        this.scope = $scope
        this.timeout = $timeout
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
                wo.billingInfo[type] = value
            })
        })
    }
}
angular
    .module('WorkOrderApp.Components')
    .component('woBillingInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woBillingInfo.html',
        bindings: {
            callBack:  '&',
            workorder: '<',
            disabled: '<'
        },
        controller: ['$scope', '$timeout', woBillingInfo]
    })

class woChangeInfo {
    constructor ($scope, $timeout, ApiRequestService, Utils) {
        this.ARS = ApiRequestService
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils

        this.countiesArray = []
        this.unitLocationArray = []
        this.unitNumberArray = []
        this.yards = []
        this.swapUnitNumberChange = this.swapUnitNumberChange.bind(this)
        this.countyNameChange = this.countyNameChange.bind(this)
        this.leaseChange = this.leaseChange.bind(this)
    }

    $onChanges(changeObj) {
        if (changeObj.locations !== undefined && !this.utils.isEmpty(changeObj.locations.currentValue) && this.utils.isEmpty(changeObj.locations.previousValue)) {
            this.timeout(() => {
                changeObj.locations.currentValue.forEach((location) => {
                    if (location.name.indexOf(':') === -1) {
                        this.yards.push(location)
                    }
                })

            })
        }
    }

    /**
     * Static method with generic return method to
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

    getAssetTypeNSID(ps) {
        let NSID = null
        this.assetTypes.forEach((asset) => {
            if (asset.type === ps) {
                NSID = asset.netsuiteId
            }
        })
        return NSID
    }

    countyNameChange(input) {
        this.timeout(() => {
            this.ARS.Counties({regexN: input, limit: 12})
                .then((counties) => {
                    this.countiesArray = counties
                })
                .catch(console.error)
        })
    }
    leaseChange(input) {
        this.timeout(() => {
            this.ARS.Units({regexL: input})
                .then((units) => {
                    this.unitLocationArray = units
                })
                .catch(console.error)
        })
    }
    swapUnitNumberChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.ARS.Units({regexN: input})
                    .then((units) => {
                        this.unitNumberArray = units
                        units.forEach((unit) => {
                            if (unit.number.toUpperCase() === input.toUpperCase()) {
                                state.swapUnitChange = true
                                const header = wo.header
                                wo.header = null
                                const thisUnit = unit
                                let engineObj
                                if (thisUnit.engineModel) {
                                    this.engineModels.forEach((engine) => {
                                        if (engine.netsuiteId === thisUnit.engineModel) {
                                            engineObj = engine
                                        }
                                    })
                                }
                                let frameObj
                                if (thisUnit.frameModel) {
                                    this.frameModels.forEach((frame) => {
                                        if (frame.netsuiteId === thisUnit.frameModel) {
                                            frameObj = frame
                                        }
                                    })
                                }
                                wo.header = header
                                wo.unitNumber = thisUnit.number
                                wo.assetType = this.getAssetTypeNSID(thisUnit.productSeries)
                                du = thisUnit
                                wo.unitReadings.engineSerial = thisUnit.engineSerial
                                wo.unitReadings.compressorSerial = thisUnit.compressorSerial
                                wo.unitChangeInfo.swapUnitNumber = thisUnit.number
                                wo.unitChangeInfo.swapUnitNSID = thisUnit.netsuiteId
                                wo.unitReadings.displayEngineModel = engineObj !== undefined ? engineObj.model : ''
                                wo.unitReadings.displayFrameModel = frameObj !== undefined ? frameObj.model : ''
                                wo.unitReadings.engineModel = engineObj !== undefined ? engineObj.netsuiteId : ''
                                wo.unitReadings.compressorModel = frameObj !== undefined ? frameObj.netsuiteId : ''
                                wo.unitSnapShot = thisUnit
                                this.unitNumberArray = []
                            }
                        })
                    })
                    .catch(console.error)
            })
        })
    }
}

angular
.module('WorkOrderApp.Components')
.component('woChangeInfo', {
    templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woChangeInfo.html',
    bindings: {
        callBack:     '&',
        workorder:    '<',
        engineModels: '<',
        frameModels:  '<',
        assetTypes:   '<',
        locations:    '<',
        states:       '<',
        counties:     '<',
        disabled:     '<',
    },
    controller: ['$scope', '$timeout', 'ApiRequestService', 'Utils', woChangeInfo],
})

class woComments {
    constructor($scope, $timeout, Utils, ObjectService) {
        this.scope = $scope;
        this.timeout = $timeout;
        this.utils = Utils;
        this.OS = ObjectService;
        this.timeAdjustment = false;
        this.changeThisTextAreaField = this.changeThisTextAreaField.bind(this);
    }

    $onChanges(changes) {
        if (!this.utils.isEmpty(changes.workorder)) {
            if (
                this.workorder.laborCodes.basic.positiveAdj.hours > 0 ||
                this.workorder.laborCodes.basic.negativeAdj.hours > 0 ||
                this.workorder.laborCodes.basic.positiveAdj.minutes > 0 ||
                this.workorder.laborCodes.basic.negativeAdj.minutes > 0
            ) {
                this.timeAdjustment = true;
            } else {
                this.timeAdjustment = false;
            }
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state);
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({ cb: this.dynamicCB(cb) });
    }

    changeThisTextAreaField(data, select) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select);
            });
        });
    }
}

angular.module("WorkOrderApp.Components").component("woComments", {
    templateUrl:
        "/lib/public/angular/apps/workorder/views/component.views/woComments.html",
    bindings: {
        callBack: "&",
        workorder: "<",
        disabled: "<"
    },
    controller: ["$scope", "$timeout", "Utils", "ObjectService", woComments]
});

class woDynamicUnitReadings {
    constructor($sce, $scope, $timeout, ObjectService, Utils, CommonWOfunctions, AlertService) {
        this.AS = AlertService
        this.CWF = CommonWOfunctions
        this.sce = $sce
        this.scope = $scope
        this.timeout = $timeout
        this.OS = ObjectService
        this.utils = Utils
        this.spotCheck = false
        this.noSpotCheck = false
        this.lastCaliDate = null

        this.engineModelError = false
        this.frameModelError = false
        this.engineSerialError = false
        this.frameSerialError = false
        this.newEngine = false
        this.newCompressor = false

        this.rowsObj = {}
        this.border = {}
        this.initSN = true

        this.engineModelChange = this.engineModelChange.bind(this)
        this.frameModelChange = this.frameModelChange.bind(this)
        this.renderINputLists = this.renderINputLists.bind(this)
        this.engineInputs = this.engineInputs.bind(this)
        this.handleInputs = this.handleInputs.bind(this)
        this.lastCal = this.lastCal.bind(this)
        this.spotChange = this.spotChange.bind(this)
        this.clearEngine = this.clearEngine.bind(this)
        this.clearFrame = this.clearFrame.bind(this)
        this.engineSerialValidation = this.engineSerialValidation.bind(this)
        this.engineSerialChange = this.engineSerialChange.bind(this)
        this.frameSerialValidation = this.frameSerialValidation.bind(this)
        this.frameSerialChange = this.frameSerialChange.bind(this)
        this.changeThisField = this.changeThisField.bind(this)
    }

    $onInit() {
        this.spotCheck = this.workorder.emissionsReadings.spotCheck
        this.noSpotCheck = this.workorder.emissionsReadings.noSpotCheck
        if (this.workorder.emissionsReadings.lastCalibration) {
            this.lastCaliDate = new Date(this.workorder.emissionsReadings.lastCalibration)
        }
        if (this.CWF.engineReplace(this.workorder)) {
            this.newEngine = true
            this.engineSerialError = false
        }
        if (this.CWF.frameReplace(this.workorder)) {
            this.newCompressor = true
            this.frameSerialError = false
        }
    }

    $doCheck() {
        if (this.newEngine !== this.state.laborCodeReplaceEngine) {
            if (!this.state.laborCodeReplaceEngine) {
                this.clearEngine()
            } else {
                this.AS.add('info', 'Please Add New Engine Serial #')
            }
            this.newEngine = this.state.laborCodeReplaceEngine
        }
        if (this.newCompressor !== this.state.laborCodeReplaceFrame) {
            if (!this.state.laborCodeReplaceFrame) {
                this.clearFrame()
            } else {
                this.AS.add('info', 'Please Add New Compressor Serial #')
            }
            this.newCompressor = this.state.laborCodeReplaceFrame
        }
        if (this.workorder.type !== 'Indirect' && this.initSN) {
            this.toCb((wo, du, u, state) => {
                this.timeout(() => {
                    if (!this.utils.isEmpty(du) && !this.utils.isEmpty(u)) {
                        this.initSN = false
                        this.border = {'border-width': '6px'}
                        this.engineSerialValidation(wo, du, u)
                        this.frameSerialValidation(wo, du, u)
                    }
                })
            })
        }
    }

    clearEngine() {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.newEngineSerial = ''
            })
        })
    }

    clearFrame() {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.newCompressorSerial = ''
            })
        })
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

    engineSerialChange(sn) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.unitReadings.engineSerial = sn
                this.engineSerialValidation(wo, du, u)
            })
        })
    }

    frameSerialChange(sn) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.unitReadings.compressorSerial = sn
                this.frameSerialValidation(wo, du, u)
            })
        })
    }

    frameSerialValidation(wo, du, u) {
        let unitExists
        if (du && wo.type !== 'Indirect') {
            unitExists = 'is_unit'
        } else if (!du && wo.type !== 'Indirect') {
            unitExists = 'should_unit'
        } else {
            unitExists = 'no_unit'
        }

        if (unitExists === 'is_unit') {
            let compressorSerial = du.compressorSerial === null ? '' : du.compressorSerial.toUpperCase()
            if (compressorSerial === wo.unitReadings.compressorSerial.toUpperCase()) {
                this.frameSerialError = false
            } else {
                this.frameSerialError = true
            }
        } else if (unitExists === 'should_unit') {
            this.frameSerialError = true
        } else if (unitExists === 'no_unit') {
            this.frameSerialError = true
        }
    }

    engineSerialValidation(wo, du, u) {
        let unitExists
        if (du && wo.type !== 'Indirect') {
            unitExists = 'is_unit'
        } else if (!du && wo.type !== 'Indirect') {
            unitExists = 'should_unit'
        } else {
            unitExists = 'no_unit'
        }

        if (unitExists === 'is_unit') {
            let engineSerial = du.engineSerial === null ? '' : du.engineSerial.toUpperCase()
            if (engineSerial === wo.unitReadings.engineSerial.toUpperCase()) {
                this.engineSerialError = false
            } else {
                this.engineSerialError = true
            }
        } else if (unitExists === 'should_unit') {
            this.engineSerialError = true
        } else if (unitExists === 'no_unit') {
            this.engineSerialError = true
        }
    }

    renderHtml(code) {
        return this.sce.trustAsHtml(code)
    }
    /**
     * Used to change data on the work order
     * @param changedData
     * @param selected
     */
    changeThisField (changedData, selected) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (selected === 'newEngineSerial' || selected === 'newCompressorSerial') {
                    this.OS.updateNestedObjectValue(wo, changedData.toUpperCase(), selected)
                } else {
                    this.OS.updateNestedObjectValue(wo, changedData, selected)
                }
            })
        })
    }
    engineModelChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(input) && !this.utils.isEmpty(this.engineModels)) {
                    this.engineModels.forEach((engine) => {
                        if (engine.model === input) {
                            wo.unitReadings.displayEngineModel = engine.model
                            wo.unitReadings.engineModel = engine.netsuiteId
                            this.renderINputLists(this.woUnitInputMatrixObject, this.workorder.unitReadings)
                        }
                    })
                } else {
                    wo.unitReadings.displayEngineModel = ''
                    wo.unitReadings.engineModel = ''
                }
            })
        })
    }
    frameModelChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                if (!this.utils.isEmpty(input) && !this.utils.isEmpty(this.frameModels)) {
                    this.frameModels.forEach((frame) => {
                        if (frame.model === input) {
                            wo.unitReadings.displayFrameModel = frame.model
                            wo.unitReadings.compressorModel = frame.netsuiteId
                            this.renderINputLists(this.woUnitInputMatrixObject, this.workorder.unitReadings)
                        }
                    })
                } else {
                    wo.unitReadings.displayFrameModel = ''
                    wo.unitReadings.engineModel = ''
                }
            })
        })
    }

    lastCal(value) {
        this.toCb((wo, displayUnit, unit) => {
            this.timeout(() => {
                wo.emissionsReadings.lastCalibration = value
                this.lastCaliDate = value
            })
        })
    }
    spotChange (value, text) {
        this.toCb((wo, displayUnit, unit) => {
            this.timeout(() => {
                switch (text) {
                    case 'spotCheck':
                        this.spotCheck = value
                        this.noSpotCheck = !value
                        if (value) {
                            wo.emissionsReadings.noSpotCheck = false
                            wo.emissionsReadings.spotCheck = true
                        } else {
                            wo.emissionsReadings.spotCheck = false
                            wo.emissionsReadings.NOxAllowable = ''
                            wo.emissionsReadings.COAllowable = ''
                            wo.emissionsReadings.NOxGrams = ''
                            wo.emissionsReadings.COGrams = ''
                            this.lastCaliDate = null
                            wo.emissionsReadings.lastCalibration = null
                        }
                        break;
                    case 'noSpotCheck':
                        this.spotCheck = !value
                        this.noSpotCheck = value
                        if (value) {
                            wo.emissionsReadings.spotCheck = false
                            wo.emissionsReadings.noSpotCheck = true
                            wo.emissionsReadings.NOxAllowable = ''
                            wo.emissionsReadings.COAllowable = ''
                            wo.emissionsReadings.NOxGrams = ''
                            wo.emissionsReadings.COGrams = ''
                            this.lastCaliDate = null
                            wo.emissionsReadings.lastCalibration = null
                        } else {
                            wo.emissionsReadings.noSpotCheck = false
                        }
                        break;
                    default:
                        break;
                }
            })
        })
    }
    getPMType(wo) {
        if (wo.pm) {
            return '1'
        } else if (wo.pm2) {
            return '2'
        } else if (wo.pm3) {
            return '3'
        } else if (wo.pm4) {
            return '4'
        } else if (wo.pm5) {
            return '5'
        } else {
            return '-'
        }
    }

    handleInputs(inputs, label, panel) {
        const obj = {}
        obj.label = label
        obj.panel = panel
        obj.inputs = []
        inputs.forEach((input) => {
            if (label === input.label) {
                obj.inputs.push(input)
            }
            input.disabled = this.disabled
        })

        return obj
    }

    sortInputs(a, b) {
        if (a.order < b.order) {
            return -1
        }
        if (a.order > b.order) {
            return 1
        }
        return 0
    }

    filterInputs(inputObjs, panel) {
        return inputObjs.reduce((acc, cur) => {
            if (cur.panel === panel) {
                return acc.concat(cur)
            } else {
                return acc
            }
        }, [])
    }
    engineInputs(inputMatrix, engineModel, frameModel) {
        let newInputs = []
        const pmType = this.getPMType(this.workorder)
        const pattern = new RegExp(pmType)
        const always = new RegExp('-')
        inputMatrix.forEach((input) => {
            if (!this.utils.isEmpty(input.enginesObj[engineModel])) {
                if (!this.utils.isEmpty(input.pmType.match(pattern)) || !this.utils.isEmpty(input.pmType.match(always))) {
                    newInputs.push(input)
                }
            } else if (!this.utils.isEmpty(input.pmType.match(always))) {
                newInputs.push(input)
            }
            if (!this.utils.isEmpty(input.framesObj[frameModel])){
                if (!this.utils.isEmpty(input.pmType.match(pattern)) || !this.utils.isEmpty(input.pmType.match(always))) {
                    newInputs.push(input)
                }
            } else if (!this.utils.isEmpty((input.pmType.match(always)))) {
                newInputs.push(input)
            }
        })
        // remove dups
        newInputs = this.utils.rmArrObjDups(newInputs, 'path')
        // sort based on order type
        newInputs = newInputs.sort(this.sortInputs)
        const tempArray = []
        return inputMatrix
            .sort(this.sortInputs)
            .reduce((acc, obj, i) => {
                if (tempArray.indexOf(obj.label) === -1) {
                    tempArray.push(obj.label)
                    const inputObject = this.handleInputs(newInputs, obj.label, obj.panel)

                    if (inputObject.inputs.length > 0) {
                        return acc.concat(inputObject)
                    } else {
                        return acc
                    }
                } else {
                    return acc
                }
            }, [])
    }

    isFound(input) {
        let show
        const frameModel = this.workorder.unitReadings.compressorModel
        if (frameModel && !this.utils.isEmpty(this.woInputMatrix)) {
            this.woInputMatrix.forEach((matrix) => {
                matrix.compressors.forEach((frame) => {
                    if (frame.netsuiteId === frameModel && matrix.name === input) {
                        show = true
                    }
                })
            })
        }
        const engineModel = this.workorder.unitReadings.engineModel
        if (engineModel && !this.utils.isEmpty(this.woInputMatrix)) {
            this.woInputMatrix.forEach((matrix) => {
                matrix.engines.forEach((engine) => {
                    if (engine.netsuiteId === engineModel && matrix.name === input) {
                        show = true
                    }
                })
            })
        }
        if (!engineModel && !frameModel) {
            show = false
        }
        return show
    }
    renderINputLists(woUnitInputMatrixObject, unitReadings) {
        let inputObjects = this.engineInputs(woUnitInputMatrixObject, unitReadings.engineModel,
            unitReadings.compressorModel)
        this.rowsObj = {}
        inputObjects.forEach((inputObj) => {
            const panelName = inputObj.panel
            if (this.utils.isEmpty(this.rowsObj[panelName])) {
                this.rowsObj[panelName] = [inputObj]
            } else if (!this.utils.isEmpty(this.rowsObj[panelName])) {
                this.rowsObj[panelName].push(inputObj)
            }
        })
    }
    $onChanges(changeObj) {
        if (changeObj.woUnitInputMatrixObject !== undefined && !this.utils.isEmpty(changeObj.woUnitInputMatrixObject.currentValue) && this.utils.isEmpty(changeObj.woUnitInputMatrixObject.previousValue)) {
            this.renderINputLists(this.woUnitInputMatrixObject, this.workorder.unitReadings)
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woDynamicUnitReadings', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woDynamicUnitReadings.html',
        bindings:    {
            callBack:                '&',
            state:                   '<',
            workorder:               '<',
            woInputMatrix:           '<',
            woUnitInputMatrixObject: '<',
            frameModels:             '<',
            engineModels:            '<',
            disabled:                '<'
        },
        controller:  ['$sce', '$scope', '$timeout', 'ObjectService', 'Utils', 'CommonWOfunctions', 'AlertService',
            woDynamicUnitReadings]
    })


class woHeaderInfo {
    constructor(
        $scope,
        $timeout,
        ApiRequestService,
        CommonWOfunctions,
        Utils,
        TimeDisplayService
    ) {
        this.utils = Utils;
        this.TDS = TimeDisplayService;
        this.CWF = CommonWOfunctions;
        this.ARS = ApiRequestService;
        this.scope = $scope;
        this.timeout = $timeout;

        this.border = null;

        // for validation and success borders
        this.numberError = false;
        this.numberSuccess = false;
        this.numberHighlight = false;
        this.customerError = false;
        this.leaseError = false;
        this.countyError = false;
        this.stateError = false;

        this.timeOfCallout = null;

        this.countiesArray = [];
        this.unitLocationArray = [];
        this.customersArray = [];
        this.unitNumberArray = [];
        this.usersArray = [];

        this.initCheck = true;

        this.unitNumberChange = this.unitNumberChange.bind(this);
        this.getAssetTypeNSID = this.getAssetTypeNSID.bind(this);
        this.validateHeader = this.validateHeader.bind(this);
        this.validateState = this.validateState.bind(this);
        this.validateCounty = this.validateCounty.bind(this);
        this.resetUnitInfoTypeChange = this.resetUnitInfoTypeChange.bind(this);
        this.resetInfo = this.resetInfo.bind(this);
    }

    $onInit() {
        if (
            (this.workorder.type === "Trouble Call" ||
                this.workorder.type === "Corrective") &&
            !this.utils.isEmpty(this.workorder.header.timeOfCallout)
        ) {
            const toc = new Date(this.workorder.header.timeOfCallout);
            this.timeOfCallout = toc;
        }
    }

    $doCheck() {
        if (
            !this.utils.isEmpty(this.states) &&
            !this.utils.isEmpty(this.counties)
        ) {
            this.toCb((wo, du, u, state) => {
                if (
                    (state.typeSelectionChangeHeader || this.initCheck) &&
                    !this.utils.isEmpty(du) &&
                    !this.utils.isEmpty(u)
                ) {
                    this.initCheck = false;
                    this.timeout(() => {
                        if (state.typeSelectionChangeHeader) {
                            // fix unit header information
                            this.resetUnitInfoTypeChange(
                                wo,
                                du,
                                u,
                                state,
                                wo.header.unitNumber
                            );
                        } else {
                            this.validateState(wo, du, u);
                            this.validateCounty(wo, du, u);
                            this.validateHeader(wo, du, u);
                        }
                        state.typeSelectionChangeHeader = false;
                        this.border = {
                            borderWidth: "6px",
                        };
                    });
                }
            });
        }
        if (this.workorder.type === "Swap") {
            this.toCb((wo, du, u, state) => {
                if (state.swapUnitChange) {
                    this.timeout(() => {
                        this.validateState(wo, du, u);
                        this.validateCounty(wo, du, u);
                        this.validateHeader(wo, du, u);
                        state.swapUnitChange = false;
                    });
                }
            });
        }
    }

    changeTimeOfCallout(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.header.timeOfCallout = input;
            });
        });
    }

    setStartTime(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.timeOfCallout = input;
                if (input === null) {
                    this.timeOfCallout = null;
                }
                if (typeof input === "object" && input !== null) {
                    console.log(input);
                    wo.header.timeOfCallout = input;
                }
            });
        });
    }

    validateHeader(wo, du, u) {
        let unitExists;
        if (du && wo.type !== "Indirect") {
            unitExists = "is_unit";
        } else if (!du && wo.type !== "Indirect") {
            unitExists = "should_unit";
        } else {
            unitExists = "no_unit";
        }

        if (unitExists === "is_unit") {
            // Unit Number
            let number;
            if (wo.type !== "Swap") {
                number = u.number;
                if (
                    number.toUpperCase() ===
                        wo.header.unitNumber.toUpperCase() &&
                    number.toUpperCase() === wo.unitNumber.toUpperCase()
                ) {
                    this.numberError = false;
                    this.numberSuccess = true;
                } else {
                    this.numberError = true;
                    this.numberSuccess = false;
                }
            }
            // Customer
            let customerName;
            if (wo.type === "Swap") {
                customerName = u.customerName;
            } else {
                customerName = du.customerName;
            }
            if (
                customerName.toUpperCase() ===
                wo.header.customerName.toUpperCase()
            ) {
                this.customerError = false;
            } else {
                this.customerError = true;
            }
            // Lease
            let locationName;
            if (wo.type === "Swap") {
                locationName = u.locationName;
            } else {
                locationName = du.locationName;
            }
            if (
                locationName.toUpperCase() === wo.header.leaseName.toUpperCase()
            ) {
                this.leaseError = false;
            } else {
                this.leaseError = true;
            }
        } else if (unitExists === "should_unit") {
            this.numberError = true;
            this.customerError = true;
            this.leaseError = true;
        } else if (unitExists === "no_unit") {
            this.numberError = true;
            this.customerError = true;
            this.leaseError = true;
        }
    }

    validateState(wo, du, u) {
        let unitExists;
        if (du && wo.type !== "Indirect") {
            unitExists = "is_unit";
        } else if (!du && wo.type !== "Indirect") {
            unitExists = "should_unit";
        } else {
            unitExists = "no_unit";
        }

        if (unitExists === "is_unit") {
            let state =
                du.state === null || du.state === undefined
                    ? ""
                    : !this.utils.isEmpty(
                          this.utils.getObjFromArrayByID(this.states, du.state)
                      )
                    ? this.utils.getObjFromArrayByID(this.states, du.state)
                    : !this.utils.isEmpty(
                          this.utils.getObjByValue(
                              this.states,
                              du.state,
                              "name"
                          )
                      )
                    ? this.utils.getObjByValue(this.states, du.state, "name")
                    : "";
            this.state = state;
            if (
                !this.utils.isEmpty(state) &&
                state.name.toUpperCase() === wo.header.state.toUpperCase()
            ) {
                this.stateError = false;
            } else {
                this.stateError = true;
            }
        } else if (unitExists === "should_unit") {
            this.stateError = true;
        } else if (unitExists === "no_unit") {
            this.stateError = true;
        }
    }

    validateCounty(wo, du, u) {
        let unitExists;
        if (du && wo.type !== "Indirect") {
            unitExists = "is_unit";
        } else if (!du && wo.type !== "Indirect") {
            unitExists = "should_unit";
        } else {
            unitExists = "no_unit";
        }

        if (unitExists === "is_unit") {
            let county =
                du.county === null || du.county === undefined
                    ? ""
                    : !this.utils.isEmpty(
                          this.utils.getObjFromArrayByID(
                              this.counties,
                              du.county
                          )
                      )
                    ? this.utils.getObjFromArrayByID(this.counties, du.county)
                    : !this.utils.isEmpty(
                          this.utils.getObjByValue(
                              this.counties,
                              du.county,
                              "name"
                          )
                      )
                    ? this.utils.getObjByValue(this.counties, du.county, "name")
                    : "";
            this.county = county;
            if (
                !this.utils.isEmpty(county) &&
                county.name.toUpperCase() === wo.header.county.toUpperCase()
            ) {
                this.countyError = false;
            } else {
                this.countyError = true;
            }
        } else if (unitExists === "should_unit") {
            this.countyError = true;
        } else if (unitExists === "no_unit") {
            this.countyError = true;
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state);
    }
    toCb(cb) {
        this.scope.$ctrl.callBack({ cb: this.dynamicCB(cb) });
    }

    getAssetTypeNSID(ps) {
        let NSID = null;
        this.assetTypes.forEach((asset) => {
            if (asset.type === ps) {
                NSID = asset.netsuiteId;
            }
        });
        return NSID;
    }

    /*
     * Methods to dynamically create lists for user typeaheads
     * */
    countyNameChange(input) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.ARS.Counties({
                    regexN: input,
                    limit: 12,
                })
                    .then((counties) => {
                        this.countiesArray = counties;
                        this.validateCounty(wo, du, u);
                    })
                    .catch(console.error);
            });
        });
    }

    stateNameChange(input) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.validateState(wo, du, u);
            });
        });
    }
    leaseChange(input) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.ARS.Units({ regexL: input })
                    .then((units) => {
                        this.unitLocationArray = units;
                        this.validateHeader(wo, du, u);
                    })
                    .catch(console.error);
            });
        });
    }
    customerChange(input) {
        this.toCb((wo, du, u) => {
            this.timeout(() => {
                this.ARS.Customers({ regexName: input })
                    .then((customers) => {
                        this.customersArray = customers;
                        this.validateHeader(wo, du, u);
                    })
                    .catch(console.error);
            });
        });
    }
    rideAlongChange(input) {
        this.timeout(() => {
            this.ARS.Users({ regexName: input })
                .then((users) => {
                    this.usersArray = users.map((user) => {
                        user.fullName = `${user.firstName} ${user.lastName}`;
                        return user;
                    });
                })
                .catch(console.error);
        });
    }
    unitNumberChange(input) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.ARS.Units({ regexN: input })
                    .then((units) => {
                        this.unitNumberArray = units;
                        units.forEach((unit) => {
                            this.resetInfo(wo, du, u, state, unit, input);
                        });
                    })
                    .catch(console.error);
            });
        });
    }

    /**
     * When a new Type is selected all the current rules set up for the header
     * are broken. Need to reset header rules and display unit and header unit.
     * Along with setting focal points of what to check againast now so proper
     * highlighting is shown.
     * @param wo
     * @param du
     * @param u
     * @param state
     */
    resetUnitInfoTypeChange(wo, du, u, state, input) {
        this.ARS.Units({ regexN: wo.header.unitNumber })
            .then((units) => {
                units.forEach((unit) => {
                    this.resetInfo(wo, du, u, state, unit, input);
                });
            })
            .catch(console.error);
    }

    resetInfo(wo, du, u, state, unit, input) {
        if (unit.number.toUpperCase() === input.toUpperCase()) {
            const thisUnit = unit;

            let engineObj;
            let frameObj;

            for (let item in wo.header) {
                if (wo.header.hasOwnProperty(item)) {
                    if (
                        item === "state" ||
                        item === "county" ||
                        item === "leaseName" ||
                        item === "unitNumber" ||
                        item === "customerName"
                    ) {
                        wo.header[item] = "";
                    }
                }
            }
            if (wo.type !== "Swap") {
                if (thisUnit.engineModel) {
                    this.engineModels.forEach((engine) => {
                        if (engine.netsuiteId === thisUnit.engineModel) {
                            engineObj = engine;
                        }
                    });
                }
                if (thisUnit.frameModel) {
                    this.frameModels.forEach((frame) => {
                        if (frame.netsuiteId === thisUnit.frameModel) {
                            frameObj = frame;
                        }
                    });
                }

                wo.unitReadings.engineModel = "";
                wo.unitReadings.compressorModel = "";
                wo.unitReadings.displayEngineModel = "";
                wo.unitReadings.displayFrameModel = "";
                wo.geo.coordinates[0] = 0;
                wo.geo.coordinates[1] = 0;
                du = thisUnit;
                u = thisUnit;
                wo.header.unitNumber = thisUnit.number;
                wo.unitNumber = wo.header.unitNumber;
                wo.unitReadings.engineSerial = thisUnit.engineSerial;
                wo.unitReadings.compressorSerial = thisUnit.compressorSerial;
                wo.assetType = this.getAssetTypeNSID(thisUnit.productSeries);
                wo.jsa.customer = thisUnit.customerName;
                wo.jsa.location = thisUnit.locationName;
                wo.unit = thisUnit._id;
                wo.unitReadings.displayEngineModel =
                    engineObj !== undefined ? engineObj.model : "";
                wo.unitReadings.displayFrameModel =
                    frameObj !== undefined ? frameObj.model : "";
                wo.unitReadings.engineModel =
                    engineObj !== undefined ? engineObj.netsuiteId : "";
                wo.unitReadings.compressorModel =
                    frameObj !== undefined ? frameObj.netsuiteId : "";
            } else {
                u = thisUnit;
            }
            wo.header.unitNumber = thisUnit.number;
            if (thisUnit.county) {
                const county = this.utils.getObjFromArrayByID(
                    this.counties,
                    thisUnit.county
                );
                wo.header.county = county.name;
                if (wo.type !== "Swap") {
                    du.county = county.name;
                }
                u.county = county.name;
                this.validateCounty(wo, du, u);
            }
            if (thisUnit.state) {
                const state = this.utils.getObjFromArrayByID(
                    this.states,
                    thisUnit.state
                );
                wo.header.state = state.name;
                if (wo.type !== "Swap") {
                    du.state = state.name;
                }
                u.state = state.name;
                this.validateState(wo, du, u);
            }
            wo.header.leaseName = thisUnit.locationName;
            wo.header.customerName = thisUnit.customerName;
            wo.header.unitNumberNSID = thisUnit.netsuiteId;
            wo.geo = thisUnit.geo;
            wo.geo.coordinates[0] = thisUnit.geo.coordinates[0];
            wo.geo.coordinates[1] = thisUnit.geo.coordinates[1];
            this.unitNumberArray = [];
        } else if (unit.number !== undefined) {
            wo.jsa.customer = "";
            wo.jsa.location = "";
        }
        this.validateHeader(wo, du, u);
    }
}

angular.module("WorkOrderApp.Components").component("woHeaderInfo", {
    templateUrl:
        "/lib/public/angular/apps/workorder/views/component.views/woHeaderInfo.html",
    bindings: {
        callBack: "&",
        units: "<",
        workorder: "<",
        headerUnit: "<",
        displayUnit: "<",
        states: "<",
        counties: "<",
        applicationtypes: "<",
        killCodes: "<",
        engineModels: "<",
        frameModels: "<",
        assetTypes: "<",
        disabled: "<",
        state: "<",
    },
    controller: [
        "$scope",
        "$timeout",
        "ApiRequestService",
        "CommonWOfunctions",
        "Utils",
        "TimeDisplayService",
        woHeaderInfo,
    ],
});

class woHistories {
    constructor($scope, ApiRequestService, EditHistories) {
        this.scope = $scope
        this.EH = EditHistories
        this.ARS = ApiRequestService
        this.displaySubmissions = []
        this.displayChanges = []
        this.editHistories = []
        this.editor = null
        this.editCount = 0
    }
    $onInit() {
        this.ARS.EditHistories({workOrder: this.workorder._id})
            .then((res) => {
                this.editHistories = res
                this.editHistories.forEach((edit) => {
                    if (this.workorder._id === edit.workOrder) {
                        const thisEdit = this.displayHistory()
                        thisEdit.panelName = edit.path[0]
                        thisEdit.itemName = edit.path.pop()
                        thisEdit.type = edit.editType
                        thisEdit.before = edit.before
                        thisEdit.after = edit.after
                        this.displayChanges.push(thisEdit)
                    }
                })
                if (this.editHistories.length !== 0) {
                    this.ARS.getUser({id: this.editHistories.pop().user})
                       .then((admin) => {
                           this.editor = admin
                       })
                       .catch((err) => {
                           console.log('Editor retrieval error')
                           console.log(err)
                       })
                    this.editCount = this.editHistories.length + 1
                }
            }).catch(console.error)
        this.ARS.getUser({id: this.workorder.techId})
            .then((user) => {
                let thisUser = user
                const techSubmission = this.submission()
                techSubmission.type = 'Submission'
                if (thisUser !== undefined) {
                    techSubmission.firstname = thisUser.firstName
                    techSubmission.lastname = thisUser.lastName
                } else {
                    techSubmission.firstname = this.workorder.techId
                }
                techSubmission.submissionTime = this.workorder.timeSubmitted
                this.displaySubmissions.push(techSubmission)
                this.isManager()
                this.isAdmin()
            })
            .catch((err) => {
                console.error(err)
                this.isManager()
                this.isAdmin()
            })
    }
    isManager() {
        if (this.workorder.timeApproved) {
            this.ARS.getUser({id: this.workorder.approvedBy})
               .then((manager) => {
                   let thisUser = manager
                   const managerSubmission = this.submission()
                   managerSubmission.type = 'Reviewed'
                   managerSubmission.firstname = thisUser.firstName
                   managerSubmission.lastname = thisUser.lastName
                   managerSubmission.submissionTime = this.workorder.timeApproved
                   this.displaySubmissions.push(
                       managerSubmission)
               })
               .catch((err) => console.log(err))
        }
    }
    isAdmin() {
        if (this.workorder.timeSynced) {
            this.ARS.getUser({id: this.workorder.syncedBy})
               .then((admin) => {
                   let thisUser = admin
                   const adminSubmission = this.submission()
                   adminSubmission.type = 'Synced'
                   adminSubmission.firstname = thisUser.firstName
                   adminSubmission.lastname = thisUser.lastName
                   adminSubmission.submissionTime = this.workorder.timeSynced
                   this.displaySubmissions.push(adminSubmission)
               })
               .catch((err) => console.log(err))
        }
    }
    submission() {
        return {
            type:           '',
            firstname:      '',
            lastname:       '',
            submissionTime: Date,
        }
    }
    displayHistory() {
        return {
            panelName: '',
            itemName:  '',
            type:      '',
            before:    '',
            after:     '',
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woHistories', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woHistories.html',
        bindings: {
            workorder: '<',
        },
        controller: ['$scope', 'ApiRequestService', 'EditHistories', woHistories]
    })

class woJsaMisc {
    constructor($scope, $timeout, $uibModal, AlertService) {
        this.AS = AlertService
        this.modal = $uibModal
        this.scope = $scope
        this.timeout = $timeout
        this.modalInstance = null

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
    openJSA() {
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

class woLaborCodes {
    constructor($scope, $timeout, Utils, ObjectService, CommonWOfunctions, TimeDisplayService) {
        this.TDS = TimeDisplayService
        this.CWF = CommonWOfunctions
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils
        this.OS = ObjectService
        this.hours = woLaborCodes.getHours()
        this.minutes = woLaborCodes.getMinutes()
        this.elapsedTime = {
            hours:   0,
            minutes: 0,
            seconds: 0
        }
        this.changeThisTimeField = this.changeThisTimeField.bind(this)
        this.showUsed = this.showUsed.bind(this)
    }

    static getHours() {
        const hours = []
        for (let i = 0; i <= 24; i++) {
            hours.push(i)
        }
        return hours
    }

    static getMinutes() {
        const minutes = []
        for (let i = 0; i < 60; i += 5) {
            minutes.push(i)
        }
        return minutes
    }

    $onInit() {
        this.elapsedTime = this.CWF.getTimeElapsed(this.workorder)
        this.calcTime = this.CWF.getTotalLaborTime(this.workorder)
        this.unaccountedTime =
            this.CWF.getUnaccountedTime(this.elapsedTime.hours, this.elapsedTime.minutes, this.calcTime.laborH,
                this.calcTime.laborM)
    }

    /**
     * return bool to show current time field. Only show
     * time fields that have time in them.
     * @param timeObj
     */
    showUsed(timeObj) {
        const {hours, minutes} = timeObj
        if (this.disabled) {
            return (hours > 0) || (minutes > 0)
        } else {
            return true
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    timeChange() {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.elapsedTime = this.CWF.getTimeElapsed(wo)
                this.calcTime = this.CWF.getTotalLaborTime(this.workorder)
                this.unaccountedTime =
                    this.CWF.getUnaccountedTime(this.elapsedTime.hours, this.elapsedTime.minutes, this.calcTime.laborH,
                        this.calcTime.laborM)
            })
        })
    }

    changeThisTimeField(data, select) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select)
                state.laborCodeTimeChange = true
                state.laborCodeSelectionChange = true
                state.laborCodeReplaceEngine = this.CWF.engineReplace(wo)
                state.laborCodeReplaceFrame = this.CWF.frameReplace(wo)
                this.timeChange()
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woLaborCodes', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woLaborCodes.html',
        bindings:    {
            callBack:  '&',
            state:     '<',
            workorder: '<',
            disabled:  '<',
        },
        controller:  ['$scope', '$timeout', 'Utils', 'ObjectService', 'CommonWOfunctions', 'TimeDisplayService',
            woLaborCodes]
    })

class woNotes {
    constructor($scope, ApiRequestService, ReviewNotes) {
        this.RV = ReviewNotes
        this.scope = $scope
        this.ARS = ApiRequestService
        this.sendingNote = false
        this.reviewNotes = []

        this.classNote = this.classNote.bind(this)
        this.newNote = this.newNote.bind(this)
        this.comment = {}
    }
    $onInit() {
        this.ARS.ReviewNotes({workOrder: this.workorder._id})
           .then((res) => {
               this.reviewNotes = res
           }).catch(console.error)
        this.comment = this.classNote()
    }
    classNote() {
        return {
            note: '',
            workOrder: this.workorder._id
        }
    }
    newNote() {
        if (this.comment.note) {
            this.sendingNote = true
            this.RV.save({}, this.comment, (res) => {
                this.sendingNote = false
                this.ARS.ReviewNotes({workOrder: res.workOrder})
                    .then((res) => {
                        this.reviewNotes = res
                    }).catch(console.error)
                this.comment.note = null
            }, (err) => {
                console.error(err)
                this.sendingNote = false
                this.comment.note = null
            })
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woNotes', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woNotes.html',
        bindings: {
            workorder: '<',
        },
        controller: ['$scope', 'ApiRequestService', 'ReviewNotes', woNotes]
    })

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

            if (this.open) {
                document.getElementById('showSearch').classList.remove('collapse')
            } else {
                document.getElementById('showSearch').classList.add('collapse')
            }
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
            controller: function ($scope, $uibModalInstance) {

                $scope.ok = () => {
                    $uibModalInstance.close(true);
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss(false);
                };
            },//'SubmitAllModalCtrl',
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
class woOwnership {
    constructor($scope, $timeout) {
        this.scope = $scope
        this.timeout = $timeout
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
                wo.unitOwnership[type] = value
            })
        })
    }
}
angular
    .module('WorkOrderApp.Components')
    .component('woOwnership', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woOwnership.html',
        bindings: {
            callBack:  '&',
            workorder: '<',
            disabled: '<'
        },
        controller: ['$scope', '$timeout', woOwnership]
    })

class woPmChecks {
    constructor($scope, $timeout, Utils, ObjectService) {
        this.scope = $scope
        this.timeout = $timeout
        this.utils = Utils
        this.OS = ObjectService
        this.block = {
            'display':         'flex',
            'flex-wrap':       'wrap',
            'flex-direction':  'row',
            'justify-content': 'flex-start',
            'box-sizing':      'content-box'
        }
        this.inline = {
            'margin-top':      0,
            'flex':            1,
            'flex-wrap':       'wrap',
            'justify-content': 'flex-start',
        }
        this.changeThisCheckbox = this.changeThisCheckbox.bind(this)
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    changeThisCheckbox(data, select) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                this.OS.updateNestedObjectValue(wo, data, select)
            })
        })
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woPmChecks', {
        templateUrl:   '/lib/public/angular/apps/workorder/views/component.views/woPmChecks.html', bindings: {
            callBack:  '&',
            workorder: '<',
            disabled:  '<',
        }, controller: ['$scope', '$timeout', 'Utils', 'ObjectService', woPmChecks]
    })

class woParts {
    constructor($scope, $timeout, $uibModal) {
        this.scope = $scope;
        this.timeout = $timeout;
        this.modal = $uibModal;

        this.orderByFieldSelect = "description";
        this.orderByFieldResult = "description";
        this.reverseSortSelect = false;
        this.reverseSortResult = false;
        this.modalInstance = null;

        this.fuse = null;
        this.searchPhrase = "";

        this.red = "#f4bab2";

        this.selectableSearchedParts = [];
        this.selectedPartsObjs = [];
        this.usedLaborCodes = [];
        this.clearSearch = this.clearSearch.bind(this);
        this.sortPartsForSearch = this.sortPartsForSearch.bind(this);
        this.resortSelect = this.resortSelect.bind(this);
        this.resortResult = this.resortResult.bind(this);
        this.removePart = this.removePart.bind(this);
        this.getUsedLaborCodes = this.getUsedLaborCodes.bind(this);
        this.openManualPartModal = this.openManualPartModal.bind(this);
        this.isManual = this.isManual.bind(this);
    }

    $onInit() {
        this.selectedPartsObjs = this.workorder.parts;
        this.getUsedLaborCodes();
    }

    $doCheck() {
        if (this.searchPhrase.length >= 3) {
            this.selectableSearchedParts = this.fuse
                .search(this.searchPhrase)
                .slice(0, 50);
        } else {
            this.selectableSearchedParts = [];
        }
        if (this.state.laborCodeSelectionChange) {
            this.getUsedLaborCodes();
        }
    }

    $onChanges(ch) {
        if (
            ch.parts !== undefined &&
            ch.parts.currentValue !== undefined &&
            ch.parts.currentValue.length > 0
        ) {
            this.sortPartsForSearch(this.parts);
        }
    }

    isManual(part) {
        if (part.isManual === true) {
            return { backgroundColor: this.red };
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state);
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({ cb: this.dynamicCB(cb) });
    }

    sortPartsForSearch(parts) {
        const options = {
            shouldSort: true,
            matchAllTokens: true,
            threshold: 0.7,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: ["description", "componentName"]
        };
        try {
            this.fuse = new Fuse(parts, options);
        } catch (e) {
            console.error(e);
        }
    }

    clearSearch() {
        this.searchPhrase = "";
    }

    resortSelect(by) {
        this.orderByFieldSelect = by;
        this.reverseSortSelect = !this.reverseSortSelect;
    }

    resortResult(by) {
        this.orderByFieldResult = by;
        this.reverseSortResult = !this.reverseSortResult;
    }

    getUsedLaborCodes() {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                const usedLaborCoes = [];
                state.laborCodeSelectionChange = false;
                _.forEach(wo.laborCodes, lc => {
                    _.forEach(lc, code => {
                        if (code.hours > 0 || code.minutes > 0) {
                            if (usedLaborCoes.indexOf(code.text) === -1) {
                                usedLaborCoes.push(code.text);
                            }
                        }
                    });
                });
                this.usedLaborCodes = usedLaborCoes;
            });
        });
    }

    removePart(part) {
        this.timeout(() => {
            this.selectedPartsObjs.forEach((woPart, index, array) => {
                if (
                    part.netsuiteId !== undefined &&
                    part.netsuiteId !== null &&
                    part.netsuiteId !== 0 &&
                    part.netsuiteId !== "" &&
                    woPart.netsuiteId !== undefined &&
                        woPart.netsuiteId !== null &&
                        woPart.netsuiteId !== 0 &&
                        woPart.netsuiteId !== ""
                ) {
                    if (part.netsuiteId === woPart.netsuiteId) {
                        array.splice(index, 1);
                    }
                } else {
                    if (part.number === woPart.number) {
                        array.splice(index, 1);
                    }
                }
            });
        });
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.parts.forEach((woPart, index, array) => {
                    if (
                        part.netsuiteId !== undefined &&
                        part.netsuiteId !== null &&
                        part.netsuiteId !== 0 &&
                        part.netsuiteId !== "" &&
                        woPart.netsuiteId !== undefined &&
                            woPart.netsuiteId !== null &&
                            woPart.netsuiteId !== 0 &&
                            woPart.netsuiteId !== ""
                    ) {
                        if (part.netsuiteId === woPart.netsuiteId) {
                            array.splice(index, 1);
                        }
                    } else {
                        if (part.number === woPart.number) {
                            array.splice(index, 1);
                        }
                    }
                });
            });
        });
    }

    clearSearchPhraseAndSelect(part) {
        this.clearSearch();
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
        let number;
        let smartPart;
        let nsid;
        let manual;
        if (part._id !== undefined) {
            number = part.MPN;
            smartPart = part.componentName;
            nsid = part.netsuiteId;
            manual = false;
        } else {
            number = part.number;
            smartPart = part.number;
            nsid = 0;
            manual = true;
        }
        const woPart = {
            vendor: "",
            number: number,
            isWarranty: false,
            isBillable: false,
            isManual: manual,
            quantity: 0,
            smartPart: smartPart,
            laborCode: "",
            cost: 0,
            description: part.description,
            netsuiteId: nsid
        };
        let canAdd = true;
        this.selectedPartsObjs.forEach(part => {
            if (
                part.netsuiteId !== undefined &&
                part.netsuiteId !== null &&
                part.netsuiteId !== 0 &&
                part.netsuiteId !== "" &&
                woPart.netsuiteId !== undefined &&
                    woPart.netsuiteId !== null &&
                    woPart.netsuiteId !== 0 &&
                    woPart.netsuiteId !== ""
            ) {
                if (part.netsuiteId === woPart.netsuiteId) {
                    canAdd = false;
                }
            } else {
                if (part.number === woPart.number) {
                    canAdd = false;
                }
            }
        });
        if (canAdd) {
            this.toCb((wo, du, u, state) => {
                this.timeout(() => {
                    // this.selectedPartsObjs.push(woPart)
                    wo.parts.push(woPart);
                });
            });
        }
    }

    openManualPartModal() {
        this.clearSearch();
        this.modalInstance = this.modal.open({
            templateUrl:
                "/lib/public/angular/apps/workorder/views/modals/woManualAddModal.html",
            controller: "AddPartEditModalCtrl"
        });

        this.modalInstance.result.then(part => {
            this.clearSearchPhraseAndSelect(part);
        });
    }
}

angular.module("WorkOrderApp.Components").component("woParts", {
    templateUrl:
        "/lib/public/angular/apps/workorder/views/component.views/woParts.html",
    bindings: {
        callBack: "&",
        state: "<",
        parts: "<",
        workorder: "<",
        disabled: "<"
    },
    controller: ["$scope", "$timeout", "$uibModal", woParts]
});

class woReadingsInput {
    constructor($scope, Utils) {
        this.scope = $scope
        this.utils = Utils
        this.block = {
            'display':         'flex',
            'flex-wrap':       'wrap',
            'flex-direction':  'row',
            'justify-content': 'flex-start',
            'box-sizing':      'content-box'
        }
        this.inputStyling = {
            'flex':            1,
            'flex-wrap':       'wrap',
            'justify-content': 'flex-start',
        }
        this.inputStylingM = {
            'margin-left':     '5px',
            'margin-right':    '5px',
            'flex':            1,
            'flex-wrap':       'wrap',
            'justify-content': 'flex-start',
            'box-sizing':      'border-box'
        }
        this.inputStylingS = {
            'margin-right':    '5px',
            'flex':            1,
            'flex-wrap':       'wrap',
            'justify-content': 'flex-start',
            'box-sizing':      'border-box'
        }
        this.inputStylingE = {
            'margin-left':     '5px',
            'flex':            1,
            'flex-wrap':       'wrap',
            'justify-content': 'flex-start',
            'box-sizing':      'border-box'
        }
    }

    placeHolderDisplayer(ph) {
        if (ph !== '-') {
            return ph
        } else {
            return ''
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woReadingsInput', {
        templateUrl:   '/lib/public/angular/apps/workorder/views/component.views/woReadingsInput.html',
        bindings:      {
            workorder:   '<',
            inputObject: '<',
            disabled:    '<',
        }, controller: ['$scope', 'Utils', woReadingsInput]
    })

class woTimeSubmittedView {
    constructor($scope, $timeout, TimeDisplayService, CommonWOfunctions, ObjectService) {
        this.OS = ObjectService
        this.CWF = CommonWOfunctions
        this.TDS = TimeDisplayService
        this.scope = $scope
        this.timeout = $timeout
        this.elapsedTime = {
            hours:   0,
            minutes: 0,
            seconds: 0
        }
        this.calcTime = {
            hours:   0,
            minutes: 0
        }
    }

    dynamicCB(cb) {
        return (wo, du, u, state) => cb(wo, du, u, state)
    }

    toCb(cb) {
        this.scope.$ctrl.callBack({cb: this.dynamicCB(cb)})
    }

    $onInit() {
        this.elapsedTime = this.CWF.getTimeElapsed(this.workorder)
        this.calcTime = this.CWF.getTotalLaborTime(this.workorder)
    }

    $doCheck() {
        if (this.state.laborCodeTimeChange) {
            this.toCb((wo, du, u, state) => {
                this.timeout(() => {
                    state.laborCodeTimeChange = false
                    this.elapsedTime = this.CWF.getTimeElapsed(wo)
                    this.calcTime = this.CWF.getTotalLaborTime(wo)
                })
            })
        }
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woTimeSubmittedView', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woTimeSubmittedView.html',
        bindings:    {
            callBack:  '&',
            state:     '<',
            workorder: '<',
        },
        controller:  ['$scope', '$timeout', 'TimeDisplayService', 'CommonWOfunctions', 'ObjectService',
            woTimeSubmittedView]
    })

class woTypeSelector {
    constructor ($scope, $timeout, ApiRequestService, CommonWOfunctions) {
        this.type = [
            {text: 'Corrective', value: false},
            {text: 'Trouble Call', value: false},
            {text: 'New Set', value: false},
            {text: 'Transfer', value: false},
            {text: 'Swap', value: false},
            {text: 'Release', value: false},
            {text: 'Indirect', value: false},
        ]
        this.scope = $scope
        this.timeout = $timeout
        this.ARS = ApiRequestService
        this.common = CommonWOfunctions
        /**
         *
         * this.scope.$ctrl.callBack({cb: cbmethod})
         *
         * is the format to send execute a method on
         * the parent controller and call $timeout
         * to reset and call $apply to remake view
         *
         * params include (workorder, displayUnit, HeaderUnit)
         *
         *
         */
    }
    $onInit() {
        if (this.workorder.timeSubmitted !== undefined && this.workorder.timeSubmitted !== null && this.workorder.timeSubmitted !== '') {
            this.setTypeObj(this.workorder.type, true)
        }
    }
    /**
     * Static method with generic return method to
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

    setType (type) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.type = type
            })
        })
    }

    /**
     * Set all wo pm types to false and set
     * the specific PM to true/false
     * @param type
     * @param value
     */
    setPM (type, value) {
        this.toCb((wo, du, u, state) => {
            wo.pm = false
            wo.pm2 = false
            wo.pm3 = false
            wo.pm4 = false
            wo.pm5 = false
            this.timeout(() => {
                wo[type.toLowerCase()] = value
            })
        })
    }

    /**
     * Set the WO type and set this states types
     * also set the PM type
     * @param type
     * @param value
     */
    doItAll (type, value) {
        this.toCb((wo, du, u, state) => {
            this.timeout(() => {
                wo.type = type
                this.type = [...this.type.map((obj) => {
                    obj.value = false
                    return obj
                })]
                wo.pm = false
                wo.pm2 = false
                wo.pm3 = false
                wo.pm4 = false
                wo.pm5 = false
                wo[type.toLowerCase()] = value
            })
        })
    }

    /**
     * Set local states type
     * @param text
     * @param value
     */
    setTypeObj (text, value) {
        this.timeout(() => {
            this.type = [...this.type.map((obj) => {
                if (obj.text === text) {
                    obj.value = value
                }
                return obj
            })]
        })
    }

    /**
     * Reset Local States types
     */
    wipeTypeObj () {
        this.timeout(() => {
            this.type = [...this.type.map((obj) => {
                obj.value = false
                return obj
            })]
        })
    }

    pmChange (value, text) {
        this.typeChange({value, text})
    }

    /**
     * Run all operations on selected types
     * and then call appropriate methods to change
     * state and wo type
     * @param obj
     */
    typeChange (obj) {
        this.toCb((wo, du, u, state) => {
            state.typeSelectionChangeHeader = true
            const type = wo.type
            if (obj.text === 'PM' ||
                obj.text === 'PM2' ||
                obj.text === 'PM3' ||
                obj.text === 'PM4' ||
                obj.text === 'PM5') {
                if (type === 'New Set' ||
                    type === 'Release' ||
                    type === 'Indirect') {
                    this.doItAll(obj.text, obj.value)
                } else if ((type === 'Corrective' ||
                    type === 'Trouble Call' ||
                    type === 'Transfer' ||
                    type === 'Swap') &&
                    (!obj.value)) {
                    this.timeout(() => {
                        wo.pm = false
                        wo.pm2 = false
                        wo.pm3 = false
                        wo.pm4 = false
                        wo.pm5 = false
                    })
                } else {
                    if (obj.text !== type) {
                        if (type !== 'Corrective' &&
                            type !== 'Trouble Call' &&
                            type !== 'Transfer' &&
                            type !== 'Swap') {
                            this.setType(obj.text)
                        }
                        this.setPM(obj.text, obj.value)
                    } else {
                        if (type === 'Corrective' ||
                            type === 'Trouble Call' ||
                            type === 'Transfer' ||
                            type === 'Swap') {
                        } else {
                            if (!obj.value) {
                                this.setPM(obj.text, !obj.value)
                            }
                        }
                    }
                }
            } else {
                this.wipeTypeObj()
                if (obj.text === 'New Set' ||
                    obj.text === 'Release' ||
                    obj.text === 'Indirect') {
                    if (obj.text !== wo.type) {
                        this.setType(obj.text)
                        this.setTypeObj(obj.text, obj.value)
                    } else {
                        this.setType(obj.text)
                        this.setTypeObj(obj.text, !obj.value)
                    }
                    wo.pm = false
                    wo.pm2 = false
                    wo.pm3 = false
                    wo.pm4 = false
                    wo.pm5 = false
                } else if (obj.text === 'Corrective' ||
                    obj.text === 'Trouble Call' ||
                    obj.text === 'Transfer' ||
                    obj.text === 'Swap') {
                    if (wo.pm || wo.pm2 ||
                        wo.pm3 || wo.pm4 ||
                        wo.pm5) {
                        if ((type !== 'PM' &&
                            type !== 'PM2' &&
                            type !== 'PM3' &&
                            type !== 'PM4' &&
                            type !== 'PM5') && !obj.value) {
                            wo.type = wo.pm
                                ? 'PM' : (wo.pm2
                                    ? 'PM2' : (wo.pm3
                                        ? 'PM3' : (wo.pm4
                                            ? 'PM4' : (wo.pm5
                                                ? 'PM5' : obj.text))))
                            this.setTypeObj(obj.text, obj.value)
                        } else {
                            wo.type = obj.text
                            this.setTypeObj(obj.text, obj.value)
                        }
                    } else {
                        if (obj.text !== wo.type) {
                            this.setType(obj.text)
                            this.setTypeObj(obj.text, obj.value)
                        } else {
                            this.setType(obj.text)
                            this.setTypeObj(obj.text, !obj.value)
                        }
                    }
                }
            }
            this.runHeaderValidation()
        })
    }

    /**
     * Method used to change header information
     * depending on the type that is selected.
     */
    runHeaderValidation () {
        this.toCb((wo, a, b) => this.common.runHeaderValidation(wo, a, b))
    }
}

angular
    .module('WorkOrderApp.Components')
    .component('woTypeSelector', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/typeSelector.html',
        bindings:    {
            callBack:  '&',
            workorder: '<',
            disabled: '<',
        },
        controller:  ['$scope', '$timeout', 'ApiRequestService', 'CommonWOfunctions', woTypeSelector],
    })

class woUserInfo {
    constructor() {}
}
angular
    .module('WorkOrderApp.Components')
    .component('woUserInfo', {
        templateUrl: '/lib/public/angular/apps/workorder/views/component.views/woUserInfo.html',
        bindings: {
            workorder: '<',
        },
        controller: [woUserInfo]
    })

angular.module('WorkOrderApp.Directives')
.directive('newSerialNumbers', [function () {
  return {
    restrict: 'E',
    templateUrl: '/lib/public/angular/apps/workorder/views/newSerial.html',
    scope: true
  };
}]);

/**
 * Created by marcusjwhelan on 10/20/16.
 */
angular
    .module("WorkOrderApp.Directives")
    .directive("pesCollectionMatch", function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, elem, attr, ctrl) {
                // set the border of the input for color to be larger
                scope.myStyle = {
                    borderWidth: "6px",
                };
                // validity setters.
                var setInvalid = function (arg) {
                    ctrl.$setValidity(arg, false);
                    if (elem.parent().hasClass("has-success")) {
                        elem.parent().removeClass("has-success");
                        elem.parent().addClass("has-error");
                    } else {
                        elem.parent().addClass("has-error");
                    }
                };
                var setHighlight = function (arg) {
                    ctrl.$setValidity(arg, false);
                    if (elem.parent().hasClass("has-success")) {
                        elem.parent().removeClass("has-success");
                    }
                    if (elem.parent().hasClass("has-error")) {
                        elem.parent().removeClass("has-error");
                    }
                    elem.parent().addClass("has-highlight");
                };
                var setValid = function (arg) {
                    ctrl.$setValidity(arg, true);
                    if (elem.parent().hasClass("has-error")) {
                        elem.parent().removeClass("has-error");
                        elem.parent().addClass("has-success");
                    } else {
                        elem.parent().addClass("has-success");
                    }
                };

                // runs on page load and on item selection.
                scope.$watch(
                    attr.ngModel,
                    _.debounce(function (viewValue) {
                        scope.$apply(function () {
                            // get the model name EG header.unitNumber
                            // var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);
                            var attribute = attr.ngModel;
                            var unitExists;

                            // if there is a unit and not a Indirect WO
                            if (
                                scope.displayUnit &&
                                scope.workorder.type !== "Indirect"
                            ) {
                                unitExists = "is_unit";
                                // if there is no unit and not a Indirect WO
                            } else if (
                                !scope.displayUnit &&
                                scope.workorder.type !== "Indirect"
                            ) {
                                unitExists = "should_unit";
                                // its an Indirect WO. false unless empty
                            } else {
                                unitExists = "no_unit";
                            }

                            var checkUnitFields = function (vv) {
                                // get the index of the unit number out of the array
                                switch (attribute) {
                                    case "workorder.header.unitNumber":
                                        if (unitExists === "is_unit") {
                                            var number;
                                            if (
                                                scope.workorder.type ===
                                                "Transfer"
                                            ) {
                                                number =
                                                    scope.headerUnit.number;
                                            } else {
                                                number =
                                                    scope.displayUnit.number;
                                            }
                                            if (
                                                number.toUpperCase() ===
                                                scope.workorder.header.unitNumber.toUpperCase()
                                            ) {
                                                if (
                                                    scope.workorder.header.unitNumber.toUpperCase() ===
                                                        scope.workorder.unitNumber.toUpperCase() &&
                                                    scope.workorder.type !==
                                                        "Swap"
                                                ) {
                                                    setValid(attribute);
                                                } else {
                                                    setInvalid(attribute);
                                                }
                                            } else {
                                                setInvalid(attribute);
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }
                                        break;
                                    case "workorder.header.customerName":
                                        // customer
                                        if (unitExists === "is_unit") {
                                            var customerName;
                                            if (
                                                scope.workorder.type === "Swap"
                                            ) {
                                                customerName =
                                                    scope.headerUnit
                                                        .customerName;
                                            } else {
                                                customerName =
                                                    scope.displayUnit
                                                        .customerName;
                                            }
                                            if (
                                                customerName.toUpperCase() ===
                                                scope.workorder.header.customerName.toUpperCase()
                                            ) {
                                                setValid(attribute);
                                            } else {
                                                setInvalid(attribute);
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }

                                        break;
                                    case "workorder.header.leaseName":
                                        // lease
                                        if (unitExists === "is_unit") {
                                            var locationName;
                                            if (
                                                scope.workorder.type === "Swap"
                                            ) {
                                                locationName =
                                                    scope.headerUnit
                                                        .locationName;
                                            } else {
                                                locationName =
                                                    scope.displayUnit
                                                        .locationName;
                                            }
                                            if (
                                                locationName.toUpperCase() ===
                                                scope.workorder.header.leaseName.toUpperCase()
                                            ) {
                                                setValid(attribute);
                                            } else {
                                                setInvalid(attribute);
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }

                                        break;
                                    case "workorder.header.county":
                                        // county
                                        if (unitExists === "is_unit") {
                                            var county;
                                            if (
                                                scope.workorder.type === "Swap"
                                            ) {
                                                county =
                                                    scope.headerUnit.county ===
                                                        null ||
                                                    scope.headerUnit.county ===
                                                        undefined
                                                        ? ""
                                                        : scope.countiesObj[
                                                              scope.headerUnit
                                                                  .county
                                                          ].name;
                                            } else {
                                                county =
                                                    scope.displayUnit.county ===
                                                        null ||
                                                    scope.displayUnit.county ===
                                                        undefined
                                                        ? ""
                                                        : scope.countiesObj[
                                                              scope.displayUnit
                                                                  .county
                                                          ].name;
                                            }
                                            if (
                                                county.toUpperCase() ===
                                                scope.workorder.header.county.toUpperCase()
                                            ) {
                                                setValid(attribute);
                                            } else {
                                                setInvalid(attribute);
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }

                                        break;
                                    case "workorder.header.state":
                                        // state
                                        if (unitExists === "is_unit") {
                                            var state;
                                            if (
                                                scope.workorder.type === "Swap"
                                            ) {
                                                state =
                                                    scope.headerUnit.state ===
                                                        null ||
                                                    scope.headerUnit.state ===
                                                        undefined
                                                        ? ""
                                                        : scope.statesObj[
                                                              scope.headerUnit
                                                                  .state
                                                          ].name;
                                            } else {
                                                state =
                                                    scope.displayUnit.state ===
                                                        null ||
                                                    scope.displayUnit.state ===
                                                        undefined
                                                        ? ""
                                                        : scope.statesObj[
                                                              scope.displayUnit
                                                                  .state
                                                          ].name;
                                            }
                                            if (
                                                state.toUpperCase() ===
                                                scope.workorder.header.state.toUpperCase()
                                            ) {
                                                setValid(attribute);
                                            } else {
                                                setInvalid(attribute);
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }

                                        break;
                                    case "workorder.unitReadings.compressorSerial":
                                        // compressor serial
                                        if (unitExists === "is_unit") {
                                            var compressorSerial =
                                                scope.displayUnit
                                                    .compressorSerial === null
                                                    ? ""
                                                    : scope.displayUnit
                                                          .compressorSerial;
                                            if (
                                                compressorSerial ===
                                                scope.workorder.unitReadings
                                                    .compressorSerial
                                            ) {
                                                if (
                                                    scope.workorder.type ===
                                                    "Swap"
                                                ) {
                                                    setHighlight(attribute);
                                                } else {
                                                    setValid(attribute);
                                                }
                                            } else {
                                                if (
                                                    scope.workorder.type ===
                                                    "Swap"
                                                ) {
                                                    setHighlight(attribute);
                                                } else {
                                                    setInvalid(attribute);
                                                }
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }
                                        break;

                                    case "workorder.unitReadings.engineSerial":
                                        // Engine serial
                                        if (unitExists === "is_unit") {
                                            var engineSerial =
                                                scope.displayUnit
                                                    .engineSerial === null
                                                    ? ""
                                                    : scope.displayUnit
                                                          .engineSerial;
                                            if (
                                                engineSerial ===
                                                scope.workorder.unitReadings
                                                    .engineSerial
                                            ) {
                                                if (
                                                    scope.workorder.type ===
                                                    "Swap"
                                                ) {
                                                    setHighlight(attribute);
                                                } else {
                                                    setValid(attribute);
                                                }
                                            } else {
                                                if (
                                                    scope.workorder.type ===
                                                    "Swap"
                                                ) {
                                                    setHighlight(attribute);
                                                } else {
                                                    setInvalid(attribute);
                                                }
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }
                                        break;

                                    // case "workorder.geo.coordinates[1]":
                                    //   // Engine serial
                                    //   if (unitExists === 'is_unit') {
                                    //     var latitude;
                                    //     if (scope.workorder.type === 'Swap') {
                                    //       latitude = scope.headerUnit.geo.coordinates[1] === 0 ? 0 : scope.headerUnit.geo.coordinates[1];
                                    //     } else {
                                    //       latitude = scope.displayUnit.geo.coordinates[1] === 0 ? 0 : scope.displayUnit.geo.coordinates[1];
                                    //     }
                                    //     if (latitude === scope.workorder.geo.coordinates[1]) {
                                    //       setValid(attribute);
                                    //     } else {
                                    //       if (scope.workorder.atShop) {
                                    //         setValid(attribute);
                                    //       } else {
                                    //         setInvalid(attribute);
                                    //       }
                                    //     }
                                    //   } else if (unitExists === 'should_unit') {
                                    //     setInvalid(attribute);
                                    //   } else if (unitExists === 'no_unit') {
                                    //     if (vv) {
                                    //       setInvalid(attribute);
                                    //     } else {
                                    //       setValid(attribute);
                                    //     }
                                    //   }
                                    //   break;

                                    // case "workorder.geo.coordinates[0]":
                                    //   // Engine serial
                                    //   if (unitExists === 'is_unit') {
                                    //     var longitude;
                                    //     if (scope.workorder.type === 'Swap') {
                                    //       longitude = scope.headerUnit.geo.coordinates[0] === 0 ? 0 : scope.headerUnit.geo.coordinates[0];
                                    //     } else {
                                    //       longitude = scope.displayUnit.geo.coordinates[0] === 0 ? 0 : scope.displayUnit.geo.coordinates[0];
                                    //     }
                                    //     if (longitude === scope.workorder.geo.coordinates[0]) {
                                    //       setValid(attribute);
                                    //     } else {
                                    //       if (scope.workorder.atShop) {
                                    //         setValid(attribute);
                                    //       } else {
                                    //         setInvalid(attribute);
                                    //       }
                                    //     }
                                    //   } else if (unitExists === 'should_unit') {
                                    //     setInvalid(attribute);
                                    //   } else if (unitExists === 'no_unit') {
                                    //     if (vv) {
                                    //       setInvalid(attribute);
                                    //     } else {
                                    //       setValid(attribute);
                                    //     }
                                    //   }
                                    //   break;
                                    case "workorder.unitReadings.displayEngineModel":
                                        if (unitExists === "is_unit") {
                                            // get _id from current WO unit engine
                                            let engineModelID = "";

                                            scope.engineModels.forEach(
                                                (engine) => {
                                                    if (
                                                        scope.displayUnit
                                                            .engineModel
                                                    ) {
                                                        if (
                                                            engine.netsuiteId ===
                                                            scope.displayUnit
                                                                .engineModel
                                                        ) {
                                                            engineModelID =
                                                                engine.netsuiteId;
                                                        }
                                                    }
                                                }
                                            );

                                            if (
                                                engineModelID ===
                                                scope.workorder.unitReadings
                                                    .engineModel
                                            ) {
                                                setValid(attribute);
                                            } else {
                                                setInvalid(attribute);
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }
                                        break;
                                    case "workorder.unitReadings.displayFrameModel":
                                        if (unitExists === "is_unit") {
                                            // get _id from current WO unit engine
                                            let frameModelID = "";

                                            scope.frameModels.forEach(
                                                (frame) => {
                                                    if (
                                                        scope.displayUnit
                                                            .frameModel
                                                    ) {
                                                        if (
                                                            frame.netsuiteId ===
                                                            scope.displayUnit
                                                                .frameModel
                                                        ) {
                                                            frameModelID =
                                                                frame.netsuiteId;
                                                        }
                                                    }
                                                }
                                            );

                                            if (
                                                frameModelID ===
                                                scope.workorder.unitReadings
                                                    .compressorModel
                                            ) {
                                                setValid(attribute);
                                            } else {
                                                setInvalid(attribute);
                                            }
                                        } else if (
                                            unitExists === "should_unit"
                                        ) {
                                            setInvalid(attribute);
                                        } else if (unitExists === "no_unit") {
                                            if (vv) {
                                                setInvalid(attribute);
                                            } else {
                                                setValid(attribute);
                                            }
                                        }
                                        break;
                                }
                            };
                            // if empty don't set has-error
                            if (
                                viewValue ||
                                viewValue === "" ||
                                viewValue === null ||
                                viewValue === 0
                            ) {
                                checkUnitFields(viewValue);

                                return viewValue;
                            }
                        });
                    }, 300)
                ); // 300 ms wait. Don't do it every change
            },
        };
    })
    .directive("unitInput", [
        function () {
            return {
                restrict: "E",
                templateUrl:
                    "/lib/public/angular/apps/workorder/views/unitInput.html",
                scope: false,
            };
        },
    ]);

angular.module('WorkOrderApp.Directives')
  .directive('pesSwapCollectionMatch', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attr, ctrl){
        scope.myStyle = {
          borderWidth: "6px",
        };
        // validity setters.
        var setInvalid = function(arg){
          ctrl.$setValidity( arg, false);
          if(elem.parent().hasClass('has-success')){
            elem.parent().removeClass('has-success');
            elem.parent().addClass('has-highlight');
          } else {
            elem.parent().addClass('has-highlight');
          }
        };
        var setValid = function(arg){
          ctrl.$setValidity( arg, true );
          if(elem.parent().hasClass('has-error')){
            elem.parent().removeClass('has-error');
            elem.parent().addClass('has-highlight');
          } else {
            elem.parent().addClass('has-highlight');
          }
        };

        scope.$watch(attr.ngModel, _.debounce(function(viewValue){
          scope.$apply(function(){
            // get the model name EG header.unitNumber
            // var attribute = attr.ngModel.slice(attr.ngModel.indexOf('.') + 1);
            var attribute = attr.ngModel;
            var unitExists;
            // if there is a unit and not a Indirect WO
            if(scope.displayUnit && scope.workorder.type !== 'Indirect'){
              unitExists = 'is_unit';
              // if there is no unit and not a Indirect WO
            } else if(!scope.displayUnit && scope.workorder.type !== 'Indirect') {
              unitExists = 'should_unit';
              // its an Indirect WO. false unless empty
            } else {
              unitExists = 'no_unit'
            }

            var checkUnitFields = function () {
              switch(attribute) {
                case 'workorder.unitChangeInfo.transferCounty':
                  if (unitExists === 'is_unit') {
                      var county = (scope.displayUnit.county === null ||
                          scope.displayUnit.county === undefined)
                          ? ''
                          : scope.countiesObj[scope.displayUnit.county].name
                    if (county.toUpperCase() === scope.workorder.unitChangeInfo.transferCounty.toUpperCase()) {
                      setValid(attribute)
                    } else {
                      setInvalid(attribute)
                    }
                  } else if (unitExists === 'should_unit') {
                    setInvalid(attribute);
                  }
                  break;
                case 'workorder.unitChangeInfo.transferState':
                  if (unitExists === 'is_unit') {
                      var state = (scope.displayUnit.state === null || scope.displayUnit.state ===
                          undefined) ? '' : scope.statesObj[scope.displayUnit.state].name
                    if (state.toUpperCase() === scope.workorder.unitChangeInfo.transferState.toUpperCase()) {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  } else if (unitExists === 'should_unit') {
                    setInvalid(attribute);
                  }
                  break;
                case 'workorder.unitChangeInfo.transferLease':
                  if (unitExists === 'is_unit') {
                    if (scope.displayUnit.locationName.toUpperCase() === scope.workorder.unitChangeInfo.transferLease.toUpperCase()) {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  } else if (unitExists === 'should_unit') {
                    setInvalid(attribute);
                  }
                  break;
                case 'workorder.unitChangeInfo.swapUnitNumber':
                  if (unitExists === 'is_unit') {
                    if (scope.displayUnit.number.toUpperCase() === scope.workorder.unitChangeInfo.swapUnitNumber.toUpperCase()) {
                      setValid(attribute);
                    } else {
                      setInvalid(attribute);
                    }
                  } else if (unitExists === 'should_unit') {
                    setInvalid(attribute);
                  }
                  break;
              }
            };

            if(viewValue || viewValue === '' || viewValue === null || viewValue === 0){
              checkUnitFields(viewValue);

              return viewValue;
            }
          })
        },300)); // 300 ms wait. Don't do it every change
      }
    }
  })
  .directive('unitChangeInfo', [function() {
    return {
      restrict: 'E',
      templateUrl: '/lib/public/angular/apps/workorder/views/woChangeInfo.html',
      scope: true
    };
  }]);

function WorkOrderCreateCtrlFunc(
    $scope,
    $location,
    AlertService,
    ApiRequestService,
    GeneralPartSearchService,
    CommonWOfunctions,
    Utils,
    me
) {
    const { debounce, isEmpty } = Utils;
    // set variables on scope to be passed down
    const ARS = ApiRequestService;
    $scope.locations = [];
    $scope.woInputMatrix = [];
    $scope.frameModels = [];
    $scope.engineModels = [];
    $scope.assetTypes = [];
    $scope.parts = [];
    $scope.states = [];
    $scope.counties = [];
    $scope.applicationTypes = [];
    $scope.killCodes = [];
    $scope.customers = [];
    $scope.users = [];
    $scope.me = me;
    $scope.workorder = CommonWOfunctions.defaultWO();
    $scope.displayUnit = null;
    $scope.headerUnit = null;
    $scope.disabled = false;
    console.log($scope.workorder);

    // page state -> passed in cb for manipulation
    $scope.state = {
        typeSelectionChangeHeader: false, // set in type selection, unset in HeaderInfo
        laborCodeTimeChange: false, // set in labor codes, unset in timeSubmittedView
        laborCodeSelectionChange: false, // set in labor codes, unset in parts view
        laborCodeReplaceEngine: false, // set in labor codes, unset in dynamic unit readings
        laborCodeReplaceFrame: false, // set in labor codes, unset in dynamic unit readings
        swapUnitChange: false, // set in wo change info, unset in wo header info
    };
    if (CommonWOfunctions.engineReplace($scope.workorder)) {
        $scope.state.laborCodeReplaceEngine = true;
    }
    if (CommonWOfunctions.frameReplace($scope.workorder)) {
        $scope.state.laborCodeReplaceFrame = true;
    }

    /**
     *
     * Generic cb method to be called in child components
     * Pass in the callback method and have the wo available
     * to edit and $timeout to execute changes.
     * @param cb
     * @returns {*}
     */
    $scope.runCb = (cb) =>
        cb(
            $scope.workorder,
            $scope.displayUnit,
            $scope.headerUnit,
            $scope.state
        );

    /**
     * load variables asynchronously then stop loading symbol
     */
    ARS.http.get.locations({ size: 1000, page: 0 }).then(
        (res) => {
            $scope.locations = res.data;
        },
        (err) => {
            console.error(err);
        }
    );
    ARS.WoUnitInputMatrixes({})
        .then((res) => {
            $scope.woInputMatrix = res;
        })
        .catch(console.error);
    ARS.FrameModels({})
        .then((res) => {
            $scope.frameModels = res;
        })
        .catch(console.error);
    ARS.EngineModels({})
        .then((res) => {
            $scope.engineModels = res;
        })
        .catch(console.error);
    ARS.AssetTypes({})
        .then((res) => {
            $scope.assetTypes = res;
        })
        .catch(console.error);
    ARS.Parts({})
        .then((res) => {
            $scope.parts = res;
            $scope.setParstModel($scope.parts);
        })
        .catch(console.error);
    ARS.States({})
        .then((res) => {
            $scope.states = res;
        })
        .catch(console.error);
    ARS.Counties({})
        .then((res) => {
            $scope.counties = res;
        })
        .catch(console.error);
    ARS.ApplicationTypes({})
        .then((res) => {
            $scope.applicationTypes = res;
        })
        .catch(console.error);
    ARS.KillCodes({})
        .then((res) => {
            $scope.killCodes = res;
        })
        .catch(console.error);
    ARS.Customers({})
        .then((res) => {
            $scope.customers = res;
        })
        .catch(console.error);
    ARS.Users({})
        .then((res) => {
            $scope.users = res;
        })
        .catch(console.error);
    /**
     * Used in selectStartEndDate Component
     * @param input
     */
    $scope.setWOTimeStarted = (input) => {
        $scope.workorder.timeStarted = input;
    };
    /**
     * Used in selectStartEndDate Component
     * @param input
     */
    $scope.setWOTimeSubmitted = (input) => {
        $scope.workorder.timeSubmitted = input;
    };

    $scope.removePart = (part) => {
        const index = $scope.workorder.parts.indexOf(part);
        $scope.workorder.parts.splice(index, 1);
    };

    $scope.setParstModel = (parts) => {
        $scope.partsTableModel = GeneralPartSearchService.partTableModel(
            parts,
            "wo",
            $scope.workorder
        );
    };

    $scope.setParstModel($scope.parts);
    /**
     * submit admin work order to back end Orion
     * back end save to mongodb
     * then sync to netsuite
     * then save the netsuite Id to the workorder
     */
    $scope.submit = () => {
        let canSubmit = true;
        if (!isEmpty($scope.workorder.parts)) {
            $scope.workorder.parts.forEach((part) => {
                if (
                    part.quantity === undefined ||
                    part.quantity < 1 ||
                    part.quantity === null
                ) {
                    AlertService.add("danger", "Part is missing a quantity");
                    canSubmit = false;
                }
            });
        }
        if ($scope.workorder.type !== "Indirect") {
            if (
                $scope.workorder.type !== "Swap" &&
                (isEmpty($scope.workorder.header.unitNumberNSID) ||
                    isEmpty($scope.workorder.header.unitNumber))
            ) {
                AlertService.add("danger", "No unit selected");
                canSubmit = false;
            }
        }
        if (
            $scope.workorder.type === "Swap" &&
            (isEmpty($scope.workorder.unitChangeInfo.swapUnitNSID) ||
                isEmpty($scope.workorder.unitChangeInfo.swapUnitNumber))
        ) {
            AlertService.add("danger", "No Swap unit Selected");
            canSubmit = false;
        }
        if (
            $scope.workorder.type === "Indirect" &&
            isEmpty($scope.workorder.techId)
        ) {
            AlertService.add("danger", "No user selected");
            canSubmit = false;
        }
        if (
            $scope.workorder.type !== "Indirect" &&
            (isEmpty($scope.workorder.truckId) ||
                isEmpty($scope.workorder.techId))
        ) {
            AlertService.add("danger", "No user or truck selected");
            canSubmit = false;
        }
        if (
            $scope.workorder.type !== "Indirect" &&
            $scope.workorder.atShop === false &&
            isEmpty($scope.workorder.unitReadings.hourReading)
        ) {
            AlertService.add("danger", "Missing unit hour reading");
            canSubmit = false;
        }

        if (
            (isEmpty($scope.workorder.laborCodes.basic.contractor.hours) ||
                $scope.workorder.laborCodes.basic.contractor.hours === 0) &&
            (isEmpty($scope.workorder.laborCodes.basic.contractor.minutes) ||
                $scope.workorder.laborCodes.basic.contractor.minutes === 0)
        ) {
            AlertService.add("danger", "No time added");
            canSubmit = false;
        }
        if (
            isEmpty($scope.workorder.timeSubmitted) ||
            isEmpty($scope.workorder.timeStarted)
        ) {
            AlertService.add("danger", "No time selected for work order");
            canSubmit = false;
        }
        if (canSubmit) {
            const now = new Date();
            $scope.workorder.approvedBy = $scope.me.username;
            $scope.workorder.syncedBy = $scope.me.username;
            $scope.workorder.timeApproved = now;
            $scope.workorder.timeSynced = now;
            $scope.workorder.managerApproved = true;
            $scope.netsuiteSyned = true;
            $scope.workorder.totalMileage =
                $scope.workorder.header.endMileage -
                $scope.workorder.header.startMileage;
            ARS.http.post.AdminWorkorder($scope.workorder).then(
                (res) => {
                    console.log("nsid: " + res.data.netsuiteId);
                    AlertService.add(
                        "success",
                        `Successfully synced to Netsuite: NSID: ${res.data.netsuiteId}`
                    );
                    $location.path("/workorder");
                },
                (err) => {
                    if ($scope.workorder.type === "Indirect") {
                        AlertService.add(
                            "info",
                            "Indirects do not sync to Netsuite but this work order saved."
                        );
                        $location.path("/workorder");
                    } else {
                        AlertService.add(
                            "danger",
                            "Not synced to Netsuite, no NSID in response."
                        );
                    }
                    console.error(err);
                }
            );
        }
    };
    $scope.debounceSubmit = debounce($scope.submit, 10000, true);
}

angular
    .module("WorkOrderApp.Controllers")
    .controller("WorkOrderCreateCtrl", [
        "$scope",
        "$location",
        "AlertService",
        "ApiRequestService",
        "GeneralPartSearchService",
        "CommonWOfunctions",
        "Utils",
        "me",
        WorkOrderCreateCtrlFunc,
    ]);

function WorkOrderCtrl ($window, $location, $scope, SessionService, ApiRequestService, AlertService, $http, STARTTIME, ENDTIME, WOTYPE, TECHNICIANID, DateService, me) {
    // Variables-------------------------------------------
    const SS = SessionService                 // local
    const ARS = ApiRequestService              // local
    const DS = DateService                     // local
    $scope.me = me
    $scope.infiniteScroll = false              // local
    $scope.spinner = true                      // local
    $scope.loaded = true                       // local
    $scope.WOSearchCount = 0                   // to OverviewTable
    $scope.reportDisabled = false              // to OverviewTable
    $scope.STARTTIME = STARTTIME     // to OverviewTable
    $scope.ENDTIME = ENDTIME         // to OverviewTable
    $scope.WOTYPE = WOTYPE                     // to OverviewTable
    $scope.TECHNICIANID = TECHNICIANID         // to OverviewTable
    // ----------------------------------------------------

    // Clear unit parameter from service when routing away from /myaccount
    $window.onhashchange = () => SS.drop('unitNumber')

    // Turn Spinner on and off
    $scope.spinnerOff = function () {
        $scope.spinner = false
    }
    $scope.spinnerOn = function () {
        $scope.spinner = true
    }
    // ----------------------------------------------------

    $scope.routeToCrreate = () => {
        $location.url('/workorder/create')
    }

    $scope.routeToCrreate2 = () => {
        $location.url('/workorder/createShop')
    }

    // Passed to Component --------------------------------
    // Function called any time page loads or user scrolls
    $scope.lookup = (query) => {
        query.skip = 0
        console.log('lookup')
        console.log(query)
        console.info(query)
        // quite current query if still running
        $scope.infiniteScroll = false
        const queryParams = $location.search()

        if (queryParams.unit) {
            obj.unit = queryParams
        }

        $scope.loaded = false
        $scope.spinnerOn()
        if (SS.get('unitNumber')) {
            ARS.http.get.UnitWorkOrders(query)
               .then((res) => {
                   $scope.workorders = res.data.map(mapWorkorders)
                   $scope.loaded = true
                   $scope.spinnerOff()
                   ARS.http.get.WorkOrdersNoIdentityCount(query)
                      .then((res) => {
                          $scope.WOSearchCount = res.data
                          if (query.skip < $scope.WOSearchCount) {
                              query.skip += query.limit
                              $scope.infiniteScroll = true
                              $scope.WorkOrderScrollLookup(query)
                          }
                      }, (err) => {
                          console.log(`Counting Error: ${err}`)
                      })
               }, (err) => {
                   console.log(`Failure: ${err}`)
               })
        } else {
            // load workorders based on query
            ARS.WorkOrders(query)
               .then((res) => {
                   $scope.workorders = res.map(mapWorkorders)
                   $scope.loaded = true
                   $scope.spinnerOff()
                   ARS.http.get.WorkOrderCount(query)
                      .then((res) => {
                          $scope.WOSearchCount = res.data
                          if (query.skip < $scope.WOSearchCount) {
                              query.skip += query.limit
                              $scope.infiniteScroll = true
                              $scope.WorkOrderScrollLookup(query)
                          }
                      }, (err) => {
                          console.log(`Counting Error: ${err}`)
                      })
               }, (err) => {
                   console.log(`Failure: ${err}`)
               })
            // get count of the same query
        }
    }

    $scope.WorkOrderScrollLookup = (query) => {
        console.log('Scroll')
        console.log(query)
        if (SS.get('unitNumber')) {
            ARS.http.get.UnitWorkOrders(query)
               .then((res) => {
                   const wo = res.data.map(mapWorkorders)
                   $scope.workorders = $scope.workorders.concat(wo)
                   if ($scope.infiniteScroll) {
                       if (query.skip < $scope.WOSearchCount) {
                           query.skip += query.limit
                           $scope.infiniteScroll = true
                           $scope.WorkOrderScrollLookup(query)
                       } else if ($scope.workorders.length === $scope.WOSearchCount) {
                           $scope.infiniteScroll = false
                       }
                   }
               }, (err) => {
                   console.log(`Failure: ${err}`)
               })
        } else {
            ARS.WorkOrders(query)
               .then((res) => {
                   const wo = res.map(mapWorkorders)
                   $scope.workorders = $scope.workorders.concat(wo)
                   if ($scope.infiniteScroll) {
                       if (query.skip < $scope.WOSearchCount) {
                           query.skip += query.limit
                           $scope.infiniteScroll = true
                           $scope.WorkOrderScrollLookup(query)
                       } else if ($scope.workorders.length === $scope.WOSearchCount) {
                           $scope.infiniteScroll = false
                       }
                   }
               }, (err) => {
                   console.log(`Failure: ${err}`)
               })
        }
    }

    /**
     * Stop Loading work orders once page is left.
     */
    $scope.$on('$destroy', function () {
        $scope.infiniteScroll = false
    })

  
    
    /**     
     * Create download link for payroll dump of workorders
     * @param query
     */
    //console.info(query)
    $scope.payrollDumpReport = (query) => {
       
        $http({
            cache: false,
            method: 'GET',
            url: '/api/WorkOrderPayrollDump',
            params: query
        })
            .then((res) => {
                let D = document
                let a = D.createElement('a')
                let strMimeType = 'application/octet-stream;charset=utf-8'
                let rawFile

                if ('download' in a) {
                    const blob = new Blob([res.data], {
                        type: strMimeType,
                    })
                    rawFile = URL.createObjectURL(blob)
                    a.setAttribute('download', 'payrollDump.csv')
                } else {
                    rawFile = 'data:' + strMimeType + ',' + encodeURIComponent(res.data)
                    a.setAttribute('target', '_blank')
                }
                a.href = rawFile
                a.setAttribute('style', 'display:none;')
                D.body.appendChild(a)
                setTimeout(function () {
                    if (a.click) {
                        a.click()
                        // Workaround for Safari 5
                    } else if (document.createEvent) {
                        const eventObj = document.createEvent('MouseEvents')
                        eventObj.initEvent('click', true, true)
                        a.dispatchEvent(eventObj)
                    }
                    D.body.removeChild(a)

                }, 100)
            }, (err) => {
                AlertService.add('danger', 'Work Order Report failed', 2000)
                console.log(err)
                $scope.reportDisabled = false
            })
    }

    /**
     * Create download link for work order dump csv
     * @param query
     */
    $scope.woDumpReport = (query) => {
        $http({
            cache:  false,
            method: 'GET',
            url:    '/api/WorkOrderDump',
            params: query,
        })
            .then((res) => {
                let D = document
                let a = D.createElement('a')
                let strMimeType = 'application/octet-stream;charset=utf-8'
                let rawFile

                if ('download' in a) {
                    const blob = new Blob([res.data], {
                        type: strMimeType,
                    })
                    rawFile = URL.createObjectURL(blob)
                    a.setAttribute('download', 'woDump.csv')
                } else {
                    rawFile = 'data:' + strMimeType + ',' + encodeURIComponent(res.data)
                    a.setAttribute('target', '_blank')
                }
                a.href = rawFile
                a.setAttribute('style', 'display:none;')
                D.body.appendChild(a)
                setTimeout(function () {
                    if (a.click) {
                        a.click()
                        // Workaround for Safari 5
                    } else if (document.createEvent) {
                        const eventObj = document.createEvent('MouseEvents')
                        eventObj.initEvent('click', true, true)
                        a.dispatchEvent(eventObj)
                    }
                    D.body.removeChild(a)

                }, 100)
            }, (err) => {
                AlertService.add('danger', 'Work Order Report failed', 2000)
                console.log(err)
                $scope.reportDisabled = false
            })
    }

    /**
     * Create download link for work order parts dump csv
     * @param query
     */
    $scope.woPartsDumpReport = (query) => {
        $http({method: 'GET', url: '/api/WorkorderPartDump', params: query})
            .then((res) => {
                let D = document
                let a = D.createElement('a')
                let strMimeType = 'applicaiton/octet-stream;charset=utf-8'
                let rawFile

                if ('download' in a) {
                    const blob = new Blob([res.data], {
                        type: strMimeType,
                    })
                    rawFile = URL.createObjectURL(blob)
                    a.setAttribute('download', 'woPartsDump.tsv')
                } else {
                    rawFile = 'data:' + strMimeType + ',' + encodeURIComponent(res.data)
                    a.setAttribute('target', '_blank')
                }
                a.href = rawFile
                a.setAttribute('style', 'display:none;')
                D.body.appendChild(a)
                setTimeout(function () {
                    if (a.click) {
                        a.click()
                        // Workaround for Safari 5
                    } else if (document.createEvent) {
                        const eventObj = document.createEvent('MouseEvents')
                        eventObj.initEvent('click', true, true)
                        a.dispatchEvent(eventObj)
                    }
                    D.body.removeChild(a)

                }, 100)
                $scope.reportDisabled = false
            }, (err) => {
                AlertService.add('danger', 'Work Order Parts Report failed', 2000)
                console.log(err)
                $scope.reportDisabled = false
            })
    }

    //Set fields and sanity checks
    function mapWorkorders (wo) {
        if (wo.unitNumber) wo.unitSort = Number(wo.unitNumber.replace(/\D+/g, ''))
        else wo.unitSort = 0

        if (wo.technician) wo.techName = wo.technician.firstName + ' ' + wo.technician.lastName
        else wo.techName = wo.techId

        if (wo.header) {
            if (!wo.header.customerName) wo.header.customerName = ''
            wo.customerName = wo.header.customerName
            wo.locationName = wo.header.leaseName
            if (wo.header.state) {
                wo.stateName = wo.header.state
            } else {
                wo.stateName = ''
            }
        } else {
            wo.stateName = ''
            wo.customerName = ''
            wo.locationName = ''
        }

        if (wo.timeStarted) {
            wo.timeStarted = DS.displayLocal(new Date(wo.timeStarted))
            wo.epoch = new Date(wo.timeStarted).getTime()
        } else {
            wo.epoch = 0
        }
        wo.totalMinutes = (wo.totalWoTime.hours * 60) + wo.totalWoTime.minutes
        //let displayName = "";
        if (!wo.header || !wo.header.leaseName) {
            // do nothing
        } else if (wo.header.leaseName <= 20) {
            wo.displayLocationName = wo.header.leaseName
        } else {
            wo.displayLocationName = wo.header.leaseName.slice(0, 17) + '...'
        }
        return wo
    }
}
angular.module('WorkOrderApp.Controllers').controller('WorkOrderCtrl',
    ['$window', '$location', '$scope', 'SessionService', 'ApiRequestService', 'AlertService', '$http', 'STARTTIME', 'ENDTIME', 'WOTYPE', 'TECHNICIANID', 'DateService', 'me', WorkOrderCtrl]);

function WorkOrderViewCtrl(
    $scope,
    $location,
    $timeout,
    $uibModal,
    $cookies,
    AlertService,
    ApiRequestService,
    GeneralPartSearchService,
    DateService,
    CommonWOfunctions,
    Utils,
    me,
    workorder,
    WorkOrders
) {
    const { debounce, isEmpty } = Utils;
    const ARS = ApiRequestService;
    const DS = DateService;
    $scope.locations = [];
    $scope.woInputMatrixes = [];
    $scope.frameModels = [];
    $scope.engineModels = [];
    $scope.assetTypes = [];
    $scope.parts = [];
    $scope.states = [];
    $scope.counties = [];
    $scope.applicationTypes = [];
    $scope.killCodes = [];
    $scope.customers = [];
    $scope.users = [];
    $scope.me = me;
    $scope.workorder = workorder;
    $scope.displayUnit = null;
    $scope.headerUnit = null;
    $scope.disabled = true;
    $scope.submittingWorkOrder = false;

    // page state -> passed in cb for manipulation
    $scope.state = {
        typeSelectionChangeHeader: false, // set in type selection, unset in HeaderInfo
        laborCodeTimeChange: false, // set in labor codes, unset in timeSubmittedView
        laborCodeSelectionChange: false, // set in labor codes, unset in parts view
        laborCodeReplaceEngine: false, // set in labor codes, unset in dynamic unit readings
        laborCodeReplaceFrame: false, // set in labor codes, unset in dynamic unit readings
        swapUnitChange: false, // set in wo change info, unset in wo header info
    };
    if ($scope.workorder.netsuiteSyned || $scope.workorder.timeSynced) {
        $scope.SyncedToNetsuite =
            $scope.workorder.timeSynced || $scope.workorder.updated_at;
    }

    if (CommonWOfunctions.engineReplace($scope.workorder)) {
        $scope.state.laborCodeReplaceEngine = true;
    }
    if (CommonWOfunctions.frameReplace($scope.workorder)) {
        $scope.state.laborCodeReplaceFrame = true;
    }

    console.log($scope.workorder);

    // set display unit
    const setDisplayUnit = (headerNumber, swapNumber) => {
        if ($scope.workorder.type === "Swap") {
            ARS.Units({ regexN: swapNumber })
                .then((units) => {
                    if (units.length === 1) {
                        $timeout(() => {
                            $scope.displayUnit = units[0];
                        });
                    }
                    return ARS.Units({ regexN: headerNumber });
                })
                .then((units) => {
                    if (units.length === 1) {
                        $timeout(() => {
                            $scope.headerUnit = units[0];
                        });
                    }
                })
                .catch((err) => console.log(err));
        } else {
            ARS.Units({ regexN: headerNumber })
                .then((units) => {
                    if (units.length === 1) {
                        $timeout(() => {
                            $scope.displayUnit = units[0];
                            $scope.headerUnit = units[0];
                        });
                    }
                })
                .catch((err) => console.log(err));
        }
    };
    if ($scope.workorder.unitNumber) {
        setDisplayUnit(
            $scope.workorder.unitNumber,
            $scope.workorder.unitChangeInfo.swapUnitNumber
        );
    }
    /**
     *
     * Generic cb method to be called in child components
     * Pass in the callback method and have the wo available
     * to edit and $timeout to execute changes.
     * @param cb
     * @returns {*}
     */
    $scope.runCb = (cb) =>
        cb(
            $scope.workorder,
            $scope.displayUnit,
            $scope.headerUnit,
            $scope.state
        );

    $scope.edit = () => {
        $scope.disabled = !$scope.disabled;
    };

    ARS.http.get
        .locations({
            size: 1000,
            page: 0,
        })
        .then(
            (res) => {
                $scope.locations = res.data;
            },
            (err) => {
                console.log(err);
            }
        );
    ARS.WoUnitInputMatrixes({})
        .then((res) => {
            $scope.woInputMatrixes = res;
            $scope.woUnitInputMatrixObject = $scope.woInputMatrixes.reduce(
                (acc, cur) => {
                    cur.enginesObj = {};
                    cur.framesObj = {};
                    cur.engines.forEach((engine) => {
                        cur.enginesObj[engine.netsuiteId] = engine;
                    });
                    cur.compressors.forEach((compressor) => {
                        cur.framesObj[compressor.netsuiteId] = compressor;
                    });
                    return acc.concat(cur);
                },
                []
            );
        })
        .catch(console.error);

    ARS.FrameModels({})
        .then((res) => {
            $scope.frameModels = res;
            $scope.frameModelsObj = $scope.frameModels.reduce((acc, cur) => {
                acc[cur.netsuiteId] = cur;
                return acc;
            }, {});
        })
        .catch(console.error);
    ARS.EngineModels({})
        .then((res) => {
            $scope.engineModels = res;
            $scope.engineModelsObj = $scope.engineModels.reduce((acc, cur) => {
                acc[cur.netsuiteId] = cur;
                return acc;
            }, {});
        })
        .catch(console.error);
    ARS.AssetTypes({})
        .then((res) => {
            $scope.assetTypes = res;
        })
        .catch(console.error);
    ARS.Parts({})
        .then((res) => {
            $scope.parts = res ? res : [];
        })
        .catch(console.error);
    ARS.States({})
        .then((res) => {
            $scope.states = res;
        })
        .catch(console.error);
    ARS.Counties({})
        .then((res) => {
            $scope.counties = res;
        })
        .catch(console.error);
    ARS.ApplicationTypes({})
        .then((res) => {
            $scope.applicationTypes = res;
        })
        .catch(console.error);
    ARS.KillCodes({})
        .then((res) => {
            $scope.killCodes = res;
        })
        .catch(console.error);
    ARS.Customers({})
        .then((res) => {
            $scope.customers = res;
        })
        .catch(console.error);
    ARS.Users({})
        .then((res) => {
            $scope.users = res;
        })
        .catch(console.error);

    // set times to server
    const setSave = (wo) => {
        if (wo.timeStarted) {
            console.log("setSave");
            console.log(wo.timeStarted);
            wo.timeStarted = DS.saveToOrion(new Date(wo.timeStarted));
            console.log(wo.timeStarted);
        }
        if (wo.timeSubmitted) {
            wo.timeSubmitted = DS.saveToOrion(new Date(wo.timeSubmitted));
        }
        if (wo.timeApproved) {
            wo.timeApproved = DS.saveToOrion(new Date(wo.timeApproved));
        }
        if (wo.timeSynced) {
            wo.timeSynced = DS.saveToOrion(new Date(wo.timeSynced));
        }
    };
    // set times to display
    const setDisplay = (wo) => {
        /*
      wo.timeStarted &&
        (console.log("setDisplay for timeStarted -----------"),
        console.log(wo.timeStarted),
        (wo.timeStarted = DS.displayLocal(new Date(wo.timeStarted))),
        console.log(wo.timeStarted),
        console.log("after change -------------------------")),
        wo.timeSubmitted &&
          (wo.timeSubmitted = DS.displayLocal(new Date(wo.timeSubmitted))),
        wo.timeApproved &&
          (wo.timeApproved = DS.displayLocal(new Date(wo.timeApproved))),
        wo.timeSynced &&
          (wo.timeSynced = DS.displayLocal(new Date(wo.timeSynced)));
          */
    };
    const unSync = () => {
        $timeout(() => {
            $scope.submittingWorkOrder = false;
            $scope.workorder.netsuiteSyned = false;
            $scope.workorder.timeSynced = null;
            $scope.workorder.syncedBy = "";
            WorkOrders.update(
                { id: $scope.workorder._id },
                $scope.workorder,
                (response) => {
                    setDisplay(workorder);
                },
                (err) => {
                    setDisplay(workorder);
                    console.error(err);
                    AlertService.add(
                        "danger",
                        "An error occurred while Unsync work order."
                    );
                }
            );
        });
    };
    $scope.submit = () => {
        $scope.submittingWorkOrder = true;
        let allowSubmit = true;

        // Last calibration is saved as a decimal displayed as a Date. Uploaded to NS
        // as a Date but saved to Orion as Number.
        if (
            $scope.workorder.emissionsReadings.lastCalibration &&
            Object.prototype.toString.call(
                $scope.workorder.emissionsReadings.lastCalibration
            ) !== "[object Number]"
        ) {
            try {
                $scope.workorder.emissionsReadings.lastCalibration = new Date(
                    $scope.workorder.emissionsReadings.lastCalibration
                ).getTime();
            } catch (e) {
                allowSubmit = false;
                $scope.submittingWorkOrder = false;
                AlertService.add(
                    "danger",
                    "Unable to Convert last calibration to a number"
                );
            }
        }

        if (
            $scope.workorder.header.timeOfCallout &&
            Object.prototype.toString.call(
                $scope.workorder.header.timeOfCallout
            ) !== "[object Number]"
        ) {
            try {
                $scope.workorder.header.timeOfCallout = new Date(
                    $scope.workorder.header.timeOfCallout
                ).getTime();
            } catch (e) {
                allowSubmit = false;
                $scope.submittingWorkOrder = false;
                AlertService.add(
                    "danger",
                    "Unable to Convert time of callout back to a number."
                );
            }
        }

        if (
            $scope.workorder.type !== "Indirect" &&
            $scope.workorder.atShop === false &&
            isEmpty($scope.workorder.unitReadings.hourReading)
        ) {
            allowSubmit = false;
            $scope.submittingWorkOrder = false;
            AlertService.add("danger", "Missing unit hour reading");
        }
        if ($scope.disabled) {
            // Review
            console.log("Submitting...");

            /**
             * -----------------------------------------------------
             * ("manager") && (!managerApproved || !timeApproved)
             * && allowSubmit)
             *
             * To: WO->controllers.update( sec:1 )->managers.(UpdateToSync
             * || managerApprove)() which will either Sync or set as
             * manager approved depending on if the manager put any update
             * notes in.
             *
             * if () {
             */
            if (
                $cookies.get("role") === "manager" &&
                (!$scope.workorder.managerApproved ||
                    !$scope.workorder.timeApproved) &&
                allowSubmit
            ) {
                setSave($scope.workorder);
                console.log("manager && !approved");

                WorkOrders.update(
                    { id: $scope.workorder._id },
                    $scope.workorder,
                    () => {
                        $scope.submittingWorkOrder = false;
                        AlertService.add(
                            "success",
                            "Successfully submitted for admin approval."
                        );
                        $location.path("/workorder");
                    },
                    (err) => {
                        console.error(err);
                        $scope.submittingWorkOrder = false;
                        setDisplay($scope.workorder);
                        AlertService.add(
                            "danger",
                            "An error occurred while attempting to submit."
                        );
                    }
                );
                /**
                 * -----------------------------------------------------
                 * ("admin" && (!managerApproved && !timeApproved)
                 * && allowSubmit)
                 *
                 * Admin's actions will approve the WO in this else if
                 *
                 * } else if() {
                 */
            } else if (
                $cookies.get("role") === "admin" &&
                !$scope.workorder.managerApproved &&
                !$scope.workorder.timeApproved &&
                allowSubmit
            ) {
                /**
                 * -----------------------------------------------------
                 * ("admin" && (!managerApproved && !timeApproved)
                 * && allowSubmit)
                 * (type !== 'Indirect')
                 *
                 * Since not Indirect
                 *
                 * To: WO->controllers.update( sec: 4 )
                 * ->managers.UpdateToSync().updateDoc()
                 *
                 * which will either
                 * approve the WO as the admin and Sync the WO.
                 *
                 * if() {
                 */
                if ($scope.workorder.type !== "Indirect") {
                    console.log("admin && !approved && !indirect");
                    AlertService.add(
                        "info",
                        "Will route to dashboard when netsuite returns ID. Otherwise a warning will show here."
                    );
                    $scope.workorder.netsuiteSyned = true;
                    setSave($scope.workorder);

                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        (response) => {
                            if (response.netsuiteId !== "") {
                                $scope.submittingWorkOrder = false;
                                AlertService.add(
                                    "success",
                                    "Successfully synced to netsuite."
                                );
                                $location.path("/workorder");
                            } else {
                                unSync($scope.workorder);
                                AlertService.add(
                                    "danger",
                                    "Not synced to Netsuite, no NSID in response."
                                );
                            }
                        },
                        (err) => {
                            console.error(err);
                            unSync($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to sync."
                            );
                        }
                    );
                    /**
                     * -----------------------------------------------------
                     * ("admin" && (!managerApproved && !timeApproved)
                     * && allowSubmit)
                     * (type === 'Indirect')
                     *
                     * Since Indirect
                     *
                     * To: WO->controllers.update( sec: 4 )
                     * ->managers.UpdateToSync().updateDoc()
                     *
                     * will set approved and set to sync Indirect but need
                     * to set netsuiteSyned so back end will do things
                     * correctly
                     *
                     * } else {
                     */
                } else {
                    console.log("admin && !approved && indirect");
                    $scope.workorder.netsuiteSyned = true;
                    setSave($scope.workorder);

                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        (response) => {
                            $scope.submittingWorkOrder = false;
                            AlertService.add(
                                "success",
                                "Successfully Submitted Indirect."
                            );
                            $location.path("/workorder");
                        },
                        (err) => {
                            console.error(err);
                            unSync($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to save work order."
                            );
                        }
                    );
                }
                /**
                 * -----------------------------------------------------
                 * ("admin" && managerApproved && allowSubmit)
                 *
                 * } else if () {
                 */
            } else if (
                $cookies.get("role") === "admin" &&
                $scope.workorder.managerApproved &&
                allowSubmit
            ) {
                /**
                 * -----------------------------------------------------
                 * ("admin" && managerApproved && allowSubmit)
                 * (type !== 'Indirect')
                 *
                 * To: WO->controllers.update( sec: 5 )
                 * ->managers.UpdateToSync().updateDoc()
                 *
                 * Approved. Set to sync by setting netsuiteSyned.
                 * Since not Indirect this will sync to Netsuite
                 *
                 * if () {
                 */
                if ($scope.workorder.type !== "Indirect") {
                    console.log("admin && approved && !indirect");
                    AlertService.add(
                        "info",
                        "Will route to dashboard when netsuite returns ID. Otherwise a warning will show here."
                    );
                    $scope.workorder.netsuiteSyned = true;
                    setSave($scope.workorder);

                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        (response) => {
                            if (response.netsuiteId !== "") {
                                $scope.submittingWorkOrder = false;
                                AlertService.add(
                                    "success",
                                    "Successfully synced to netsuite."
                                );
                                $location.path("/workorder");
                            } else {
                                unSync($scope.workorder);
                                AlertService.add(
                                    "danger",
                                    "Not synced to Netsuite, no NSID in response. Work order would not submit."
                                );
                            }
                        },
                        (err) => {
                            console.error(err);
                            unSync($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to sync."
                            );
                        }
                    );
                    /**
                     * -----------------------------------------------------
                     * ("admin" && managerApproved && allowSubmit)
                     * (type === 'Indirect')
                     *
                     * To: WO->controllers.update( sec: 5 )
                     * ->managers.UpdateToSync().updateDoc()
                     *
                     *  Here everything is ready to be synced. But Indirect.
                     *  Let back end handle setting correct params.
                     *
                     * } else {
                     */
                } else {
                    console.log("admin && approved && indirect");
                    $scope.workorder.netsuiteSyned = true;
                    setSave($scope.workorder);

                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        () => {
                            $scope.submittingWorkOrder = false;
                            AlertService.add(
                                "success",
                                "Successfully saved Indirect work order, not synced to Netsuite."
                            );
                            $location.path("/workorder");
                        },
                        (err) => {
                            console.error(err);
                            unSync($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to save work order."
                            );
                        }
                    );
                }
            } else {
                AlertService.add(
                    "info",
                    "Either not allowed to submit or no decision based on your authorization could be made."
                );
                $scope.submittingWorkOrder = false;
            }
        } else {
            // Edit
            if (
                +$scope.workorder.header.startMileage >
                +$scope.workorder.header.endMileage
            ) {
                $scope.openErrorModal("woMileageError.html");
                allowSubmit = false;
            }
            if (
                ($scope.unaccountedH < 0 ||
                    $scope.unaccountedM < -15 ||
                    $scope.unaccountedH > 0 ||
                    $scope.unaccountedM > 15) &&
                $scope.timeAdjustment === false
            ) {
                $scope.openErrorModal("woUnaccoutedTimeError.html");
                allowSubmit = false;
            }
            if (
                +$scope.workorder.header.endMileage -
                    +$scope.workorder.header.startMileage >
                    75 &&
                !$scope.highMileageConfirm
            ) {
                $scope.openConfirmationModal("woHighMileageConfirmation.html");
                allowSubmit = false;
            }
            if (
                !isEmpty($scope.workorder.unitReadings.compressorModel) ||
                !isEmpty($scope.workorder.unitReadings.engineModel)
            ) {
                // clear all emissions, unitReadings, pmChecklist
                // items that are not associated with this wo
                $scope.workorder = CommonWOfunctions.clearNoneEngineFrame(
                    $scope.workorder,
                    $scope.woInputMatrixes
                );
            }
            // TODO: Make sure and uncommented this once Tiffany is done submitting
            // current work orders. 8/8/2019
            /*if ($scope.workorder.type === 'Trouble Call' &&
                (isEmpty($scope.workorder.header.killCode) || isEmpty($scope.workorder.header.timeOfCallout))) {
                $scope.openErrorModal('woMissingKillCodeCallout.html')
                allowSubmit = false
            }*/
            if (
                !isEmpty($scope.workorder.header.timeOfCallout) &&
                $scope.workorder.header.timeOfCallout < 0
            ) {
                $scope.openErrorModal("woTimeOfCalloutError.html");
                allowSubmit = false;
            }
            if (
                $scope.workorder.emissionsReadings.spotCheck &&
                !isEmpty($scope.workorder.emissionsReadings.lastCalibration) &&
                $scope.workorder.emissionsReadings.lastCalibration < 0
            ) {
                $scope.openErrorModal("woLastCalibrationError.html");
                allowSubmit = false;
            }

            /**
             * -----------------------------------------------------
             *
             * To: WO->controllers.update( sec: 2 & 3 )
             * ->managers.(simpleUpdateAndApprove() || updateDoc())
             *
             * Approve if not approved. And update. but do not sync
             * this is all taken care of on the back end.
             *
             * DO NOT SET nestuiteSyned in the update ctrl
             *
             * if () {
             */
            if (allowSubmit) {
                $scope.workorder.totalMileage =
                    $scope.workorder.header.endMileage -
                    $scope.workorder.header.startMileage;
                if ($cookies.get("role") === "admin") {
                    setSave($scope.workorder);
                    WorkOrders.update(
                        { id: $scope.workorder._id },
                        $scope.workorder,
                        (res) => {
                            $scope.submittingWorkOrder = false;
                            AlertService.add(
                                "success",
                                "Update was successful!"
                            );
                            $scope.disabled = true;
                            console.log($scope.workorder._id);
                            $location.url(
                                "/workorder/view/" + $scope.workorder._id
                            );
                        },
                        (err) => {
                            $scope.submittingWorkOrder = false;
                            console.error(err);
                            setDisplay($scope.workorder);
                            AlertService.add(
                                "danger",
                                "An error occurred while attempting to update."
                            );
                        }
                    );
                }
            }
        }
    };

    $scope.openErrorModal = (modalUrl) => {
        const modalInstance = $uibModal.open({
            templateUrl:
                "/lib/public/angular/apps/workorder/views/modals/" + modalUrl,
            controller: "ErrorCtrl",
        });
    };
    $scope.openConfirmationModal = (modalUrl) => {
        const modalInstance = $uibModal.open({
            templateUrl:
                "/lib/public/angular/apps/workorder/views/modals/" + modalUrl,
            controller: "ConfirmationCtrl",
        });

        modalInstance.result.then(() => {
            $scope.highMileageConfirm = true;
            $scope.submit();
        });
    };

    setDisplay($scope.workorder);
    $scope.debounceSubmit = debounce($scope.submit, 10000, true);
}

angular
    .module("WorkOrderApp.Controllers")
    .controller("WorkOrderViewCtrl", [
        "$scope",
        "$location",
        "$timeout",
        "$uibModal",
        "$cookies",
        "AlertService",
        "ApiRequestService",
        "GeneralPartSearchService",
        "DateService",
        "CommonWOfunctions",
        "Utils",
        "me",
        "workorder",
        "WorkOrders",
        WorkOrderViewCtrl,
    ]);

function CommonWOfunctions($timeout, ObjectService, ApiRequestService, TimeDisplayService) {
    const TDS = TimeDisplayService
    const OS = ObjectService
    const ARS = ApiRequestService
    const timeout = $timeout
    return {
        engineReplace(wo) {
            return (+wo.laborCodes.engine.replaceEngine.hours > 0 || +wo.laborCodes.engine.replaceEngine.minutes > 0)
        },
        frameReplace(wo) {
            return (+wo.laborCodes.compressor.replace.hours > 0 || +wo.laborCodes.compressor.replace.minutes > 0)
        },
        getUnaccountedTime(eHours, eMinutes, laborH, laborM) {
            let unaccountedHours = 0
            let unaccountedMinutes = (eHours - laborH) * 60
            unaccountedMinutes += eMinutes - laborM
            if (unaccountedMinutes > 0) {
                unaccountedHours = Math.floor(unaccountedMinutes / 60)
            } else {
                unaccountedHours = Math.ceil(unaccountedMinutes / 60)
            }
            unaccountedMinutes = Math.round(unaccountedMinutes % 60)
            return TDS.timeManager(unaccountedHours, unaccountedMinutes)
        },
        getTotalLaborTime(wo) {
            let laborH = 0
            let laborM = 0
            let totalMinutes = 0
            let AdjMinutes = 0

            const {laborCodes} = wo
            const laborCs = Object.keys(laborCodes)
            laborCs.forEach((item) => {
                const lcChild = Object.keys(laborCodes[item])
                lcChild.forEach((child) => {
                    if (laborCodes[item][child].text === 'Negative Time Adjustment') {
                        totalMinutes -= +laborCodes[item][child].hours * 60
                        totalMinutes -= +laborCodes[item][child].minutes
                        AdjMinutes -= +laborCodes[item][child].hours * 60
                        AdjMinutes -= +laborCodes[item][child].minutes
                    } else {
                        totalMinutes += +laborCodes[item][child].hours * 60
                        totalMinutes += +laborCodes[item][child].minutes
                        if (laborCodes[item][child].text === 'Positive Time Adjustment' ||
                            laborCodes[item][child].text === 'Lunch') {
                            AdjMinutes += +laborCodes[item][child].hours * 60
                            AdjMinutes += +laborCodes[item][child].minutes
                        }
                    }
                })
            })
            let AdjH
            if (AdjMinutes > 0) {
                AdjH = Math.floor(AdjMinutes / 60)
            } else {
                AdjH = Math.ceil(AdjMinutes / 60)
            }
            if (totalMinutes > 0) {
                laborH = Math.floor(totalMinutes / 60)
            } else {
                laborH = Math.ceil(totalMinutes / 60)
            }
            laborM = Math.round(totalMinutes % 60)
            const AdjM = Math.round(AdjMinutes % 60)
            const ShowH = laborH - AdjH
            const ShowM = laborM - AdjM
            return {laborH, laborM, totalLaborTime: TDS.timeManager(ShowH, ShowM)}
        },
        getTimeElapsed(wo) {
            const start = new Date(wo.timeStarted)
            const end = new Date(wo.timeSubmitted)

            const milli = (end.getTime() - start.getTime()).toFixed()
            const seconds = Math.floor(((milli/1000) % 60))
            const minutes = Math.floor(((milli/6e4) % 60))
            const hours = Math.floor(((milli/36e5)))
            return {hours, minutes, seconds}
        },

        /**
         *  Method used to change header information
         * depending on the type that is selected
         * @param wo - workorder
         * @param du - display unit
         * @param hu - header unit
         */
        runHeaderValidation (wo, du, hu) {
            const header = wo.header
            wo.header = null
            if (wo.type !== 'Swap') {
                //this.setDisplayUnit(header.unitNumber, wo, du, hu)
                wo.comments.swapReason = ''
                wo.unitChangeInfo.swapUnitNSID = ''
                wo.unitChangeInfo.swapUnitNumber = ''
                wo.unitChangeInfo.swapDestination = ''
            }
            if (wo.type !== 'Transfer') {
                wo.unitChangeInfo.transferLease = ''
                wo.unitChangeInfo.transferCounty = ''
                wo.unitChangeInfo.transferState = ''
                wo.comments.transferReason = ''
            }
            if (wo.type !== 'Release') {
                wo.unitChangeInfo.releaseDestination = ''
            }
            timeout(() => {
                wo.header = header
            })
        },

        /**
         * Change Display and Header unit if swap is selected
         * only used in runHeaderValidation local method
         * @param number - unit number
         * @param wo - passed from parent method
         * @param du - passed from parent method
         * @param hu - passed from parent method
         */
        setDisplayUnit (number, wo, du, hu) {
            ARS.Units({regexN: number})
               .then((units) => {
                   timeout(() => {
                       du = units[0]
                       hu = units[0]
                   })
               })
               .catch((err) => console.error(err))
        },

        // Add Component Name to every part in wo -------------
        addComponentNameToParts (wo, parts) {
            if (wo.hasOwnProperty('parts')) {
                if (wo.parts.length !== 0) {
                    wo.parts.map(function (part) {
                        const netsuiteId = +part.netsuiteId
                        _.forEach(parts, function (obj) {
                            if (obj.netsuiteId === netsuiteId) {
                                part.componentName = (obj.componentName) ? obj.componentName : ''
                            }
                        })
                    })
                }
            }
            return wo
        },
        // ----------------------------------------------------

        // clear all emissions, unitReadings, pmChecklist items
        // that are not associated with this WO
        clearNoneEngineFrame (wo, woInputs) {
            woInputs.forEach((input) => {
                let found = false
                const always = new RegExp('-')
                input.engines.forEach((engine) => {
                    if (engine.netsuiteId === wo.unitReadings.engineModel || input.pmType.match(always)) {
                        found = true
                    }
                })
                input.compressors.forEach((frame) => {
                    if (frame.netsuiteId === wo.unitReadings.compressorModel || input.pmType.match(always)) {
                        found = true
                    }
                })
                if (!found) {
                    // clear this input
                    OS.setObjValue(wo, input.path, '')
                }
            })
            return wo
        },

        defaultWO () {
            return {
                netsuiteId:          '',
                netsuiteSyned:       false,
                truckId:             '',
                truckNSID:           '',
                unitNumber:          '',
                techId:              '',
                newEngineSerial:     '',
                newCompressorSerial: '',

                managerApproved: false,
                approvedBy:      '',
                syncedBy:        '',

                timePosted: new Date(),

                timeStarted:   null,
                timeSubmitted: null,
                timeApproved:  null,
                timeSynced:    null,

                pm:     false, // pm1
                pm2:    false,
                pm3:    false,
                pm4:    false,
                pm5:    false,
                totalMileage: 0,
                type:   '',
                atShop: false,

                header: {
                    unitNumber:      '',
                    unitNumberNSID:  '',
                    customerName:    '',
                    contactName:     '',
                    county:          '',
                    state:           '',
                    leaseName:       '',
                    rideAlong:       '',
                    startMileage:    null,
                    endMileage:      null,
                    applicationtype: '',
                },

                unitChangeInfo: {
                    releaseDestination: '',
                    transferLease:      '',
                    transferCounty:     '',
                    transferState:      '',
                    swapUnitNSID:       '',
                    swapUnitNumber:     '',
                    swapDestination:    '',
                },

                unitOwnership: {
                    isRental:       false,
                    isCustomerUnit: false,
                },

                billingInfo: {
                    billableToCustomer: false,
                    billed:             false,
                    warrantyWork:       false,
                    AFENumber:          '',
                    AFE:                false,
                },

                misc: {
                    leaseNotes:               '',
                    unitNotes:                '',
                    typeOfAsset:              '',
                    isUnitRunningOnDeparture: false,
                },

                geo: {
                    type:        'Point', // default: 'Point' },
                    coordinates: [0.0, 0.0], // default: [0.0, 0.0],
                },

                unitReadings: {
                    // for local use ONLY
                    displayEngineModel:    '',
                    displayFrameModel:     '',
                    // Engine
                    engineModel:           '',
                    engineSerial:          '',   //       *
                    engBattery:            '',
                    engOilTemp:            '', // guage
                    engOilTempKill:        '',
                    engineJWTemp:          '', // guage *
                    engineJWTempKill:      '',
                    engineOilPressure:     '', // guage *
                    engOilPressureKill:    '',
                    alternatorOutput:      '', // guage *
                    hourReading:           '', // guage *
                    engAirInletTemp:       '', // guage
                    engAirInletTempKill:   '',
                    engJWPress:            '',
                    engJWPressKill:        '',
                    engTurboExhTempR:      '', // guage
                    engTurboExhTempRKill:  '',
                    engTurboExhTempL:      '', // guage
                    engTurboExhTempLKill:  '',
                    rpm:                   '', // guage *
                    engIgnitionTiming:     '', // guage
                    engVacuumBoostR:       '', // guage
                    engVacuumBoostRKill:   '',
                    engVacuumBoostL:       '', // guage
                    engVacuumBoostLKill:   '',
                    engManifoldTempR:      '', // guage
                    engManifoldTempRKill:  '',
                    engManifoldTempL:      '', // guage
                    engManifoldTempLKill:  '',
                    engineManifoldVac:     '', //       *
                    // Compressor
                    compressorModel:       '',
                    compressorSerial:      '',   //       *
                    suctionPressure:       '', // guage *
                    compInterPress1:       '', // guage
                    compInterPress1Low:    '',
                    compInterPress1High:   '',
                    compInterPress2:       '', // guage
                    compInterPress2Low:    '',
                    compInterPress2High:   '',
                    compInterPress3:       '', // guage
                    compInterPress3Low:    '',
                    compInterPress3High:   '',
                    dischargePressure:     '', // final *
                    dischargeTemp1:        '', // guage *
                    dischargeTemp2:        '', // guage *
                    dischargeStg1Temp:     '',
                    dischargeStg1TempKill: '',
                    dischargeStg3Temp:     '',
                    dischargeStg3TempKill: '',
                    dischargeStg4Temp:     '',
                    dischargeStg4TempKill: '',
                    compressorOilPressure: '', // guage *
                    compOilPressKill:      '',
                    compOilTemp:           '', // guage
                    compOilTempKill:       '',
                    compDiffPCFilter:      '', // guage
                    compDiffPCFilterKill:  '',
                    lubeRate:              '',
                    flowMCF:               '', // guage *
                },

                emissionsReadings: {
                    afrmvTarget:             '',
                    catalystTempPre:         '',
                    catalystTempPreCatKill:  '',
                    catalystTempPost:        '',
                    catalystTempPostCatKill: '',
                    afrMake:                 '',
                    afrModel:                '',
                    afrSN:                   '',
                    EICSCPUSoftware:         '',
                    EICSDisplaySoftware:     '',
                    catalystHousingMake:     '',
                    catalystHousingModel:    '',
                    catalystHousingSN:       '',
                    catalystElementMake:     '',
                    catalystElementSN1:      '',
                    catalystElementSN2:      '',
                    o2Sensors:               '',
                    NOxSensor:               '',
                    testPInchesH2O:          '',
                    spotCheck:               false,
                    noSpotCheck:             false,
                    lastCalibration:         null,
                    NOxGrams:                '',
                    COGrams:                 '',
                    NOxAllowable:            '',
                    COAllowable:             '',
                },

                pmChecklist: {

                    killSettings: {
                        highSuctionKill:       '',
                        highDischargeKill:     '',
                        lowSuctionKill:        '',
                        lowDischargeKill:      '',
                        highDischargeTempKill: '',
                    },
                    taskList:     [],
                    engineChecks: {
                        battery:             false,
                        capAndRotor:         false,
                        airFilter:           false,
                        oilAndFilters:       false,
                        magPickup:           false,
                        belts:               false,
                        guardsAndBrackets:   false,
                        sparkPlugs:          false,
                        plugWires:           false,
                        driveLine:           false,
                        batteryNa:           false,
                        capAndRotorNa:       false,
                        airFilterNa:         false,
                        oilAndFiltersNa:     false,
                        magPickupNa:         false,
                        beltsNa:             false,
                        guardsAndBracketsNa: false,
                        sparkPlugsNa:        false,
                        plugWiresNa:         false,
                        driveLineNa:         false,
                    },

                    generalChecks: {
                        kills:                  false,
                        airHoses:               false,
                        coolerForCracks:        false,
                        coolerLouverMovement:   false,
                        coolerLouverCleaned:    false,
                        pressureReliefValve:    false,
                        scrubberDump:           false,
                        plugInSkid:             false,
                        filledDayTank:          false,
                        fanForCracking:         false,
                        panelWires:             false,
                        oilPumpBelt:            false,
                        killsNa:                false,
                        airHosesNa:             false,
                        coolerForCracksNa:      false,
                        coolerLouverMovementNa: false,
                        coolerLouverCleanedNa:  false,
                        pressureReliefValveNa:  false,
                        scrubberDumpNa:         false,
                        plugInSkidNa:           false,
                        filledDayTankNa:        false,
                        fanForCrackingNa:       false,
                        panelWiresNa:           false,
                        oilPumpBeltNa:          false,
                    },

                    fuelPressureFirstCut:  '',
                    fuelPressureSecondCut: '',
                    fuelPressureThirdCut:  '',
                    visibleLeaksNotes:     '',
                    engineCompression:     {
                        cylinder1:  '',
                        cylinder2:  '',
                        cylinder3:  '',
                        cylinder4:  '',
                        cylinder5:  '',
                        cylinder6:  '',
                        cylinder7:  '',
                        cylinder8:  '',
                        cylinder9:  '',
                        cylinder10: '',
                        cylinder11: '',
                        cylinder12: '',
                        cylinder13: '',
                        cylinder14: '',
                        cylinder15: '',
                        cylinder16: '',
                    },
                },

                comments: {
                    repairsDescription:  '',
                    repairsReason:       '',
                    calloutReason:       '',
                    swapReason:          '',
                    transferReason:      '',
                    newsetNotes:         '',
                    releaseNotes:        '',
                    indirectNotes:       '',
                    timeAdjustmentNotes: '',
                },

                laborCodes: {
                    basic: {
                        contractor:    {hours: 0, minutes: 0, text: 'Contractor'},
                        safety:        {hours: 0, minutes: 0, text: 'Safety'},
                        positiveAdj:   {hours: 0, minutes: 0, text: 'Positive Time Adjustment'},
                        negativeAdj:   {hours: 0, minutes: 0, text: 'Negative Time Adjustment'},
                        lunch:         {hours: 0, minutes: 0, text: 'Lunch'},
                        custRelations: {hours: 0, minutes: 0, text: 'Cust. Relations'},
                        telemetry:     {hours: 0, minutes: 0, text: 'Telemetry'},
                        environmental: {hours: 0, minutes: 0, text: 'Environment'},
                        diagnostic:    {hours: 0, minutes: 0, text: 'Diagnostic'},
                        serviceTravel: {hours: 0, minutes: 0, text: 'Service Travel'},
                        optimizeUnit:  {hours: 0, minutes: 0, text: 'Optimize Unit'},
                        pm:            {hours: 0, minutes: 0, text: 'PM'},
                        washUnit:      {hours: 0, minutes: 0, text: 'Wash Unit'},
                        inventory:     {hours: 0, minutes: 0, text: 'Inventory'},
                        training:      {hours: 0, minutes: 0, text: 'Training'},
                    },

                    engine:     {
                        oilAndFilter:          {hours: 0, minutes: 0, text: 'Oil and Filter'},
                        addOil:                {hours: 0, minutes: 0, text: 'Add Oil'},
                        compression:           {hours: 0, minutes: 0, text: 'Compression'},
                        replaceEngine:         {hours: 0, minutes: 0, text: 'Replace Engine'},
                        replaceCylHead:        {hours: 0, minutes: 0, text: 'Replace Cyl Head'},
                        coolingSystem:         {hours: 0, minutes: 0, text: 'Cooling System'},
                        fuelSystem:            {hours: 0, minutes: 0, text: 'Fuel System'},
                        ignition:              {hours: 0, minutes: 0, text: 'Ignition'},
                        starter:               {hours: 0, minutes: 0, text: 'Starter'},
                        lubrication:           {hours: 0, minutes: 0, text: 'Lubrication'},
                        exhaust:               {hours: 0, minutes: 0, text: 'Exhaust'},
                        alternator:            {hours: 0, minutes: 0, text: 'Alternator'},
                        driveOrCoupling:       {hours: 0, minutes: 0, text: 'Drive or Coupling'},
                        sealsAndGaskets:       {hours: 0, minutes: 0, text: 'Seals and Gaskets'},
                        engineVibrationSwitch: {hours: 0, minutes: 0, text: 'Vibration Switch'},
                        engineBelts:           {hours: 0, minutes: 0, text: 'Belts'},
                        harnessRepair:         {hours: 0, minutes: 0, text: 'Harness Repair'},
                        EICSSensorActuators:   {
                            hours:   0,
                            minutes: 0,
                            text:    'EICS Sensor/Actuators',
                        },
                    },
                    emissions:  {
                        install:                 {hours: 0, minutes: 0, text: 'Install'},
                        test:                    {hours: 0, minutes: 0, text: 'Test'},
                        repair:                  {hours: 0, minutes: 0, text: 'Repair'},
                        o2SensorReplace:         {hours: 0, minutes: 0, text: 'O2 Sensor Replace'},
                        catalystReplace:         {hours: 0, minutes: 0, text: 'Catalyst Replace'},
                        emissionsThermocoupling: {hours: 0, minutes: 0, text: 'Thermocoupling'},
                        exhaustGasketReplace:    {
                            hours:   0,
                            minutes: 0,
                            text:    'Exhaust Gasket Replace',
                        },
                        facilitySetup:           {hours: 0, minutes: 0, text: 'Facility Setup'},
                        adjustment:              {hours: 0, minutes: 0, text: 'Adjustment'},
                        troubleshooting:         {hours: 0, minutes: 0, text: 'Troubleshooting'},
                        standBy:                 {hours: 0, minutes: 0, text: 'Stand-by'},
                    },
                    panel:      {
                        panel:           {hours: 0, minutes: 0, text: 'Panel'},
                        electrical:      {hours: 0, minutes: 0, text: 'Electrical'},
                        wiring:          {hours: 0, minutes: 0, text: 'Wiring'},
                        conduit:         {hours: 0, minutes: 0, text: 'Conduit'},
                        gauges:          {hours: 0, minutes: 0, text: 'Gauges'},
                        panelDampners:   {hours: 0, minutes: 0, text: 'Dampners'},
                        tubing:          {hours: 0, minutes: 0, text: 'Tubing'},
                        programming:     {hours: 0, minutes: 0, text: 'Programming'},
                        annuciator:      {hours: 0, minutes: 0, text: 'Annuciator'},
                        safetyShutdowns: {hours: 0, minutes: 0, text: 'Safety Shutdowns'},
                    },
                    compressor: {
                        inspect:                   {hours: 0, minutes: 0, text: 'Inspect'},
                        replace:                   {hours: 0, minutes: 0, text: 'Replace'},
                        addOil:                    {hours: 0, minutes: 0, text: 'Add Oil'},
                        lubePump:                  {hours: 0, minutes: 0, text: 'Lube Pump'},
                        valves:                    {hours: 0, minutes: 0, text: 'Valves'},
                        alignment:                 {hours: 0, minutes: 0, text: 'Alignment'},
                        piston:                    {hours: 0, minutes: 0, text: 'Piston'},
                        packing:                   {hours: 0, minutes: 0, text: 'Packing'},
                        compressorThermocouples:   {hours: 0, minutes: 0, text: 'Thermocouples'},
                        noFlowSwitch:              {hours: 0, minutes: 0, text: 'No Flow Switch'},
                        overhaul:                  {hours: 0, minutes: 0, text: 'Overhaul'},
                        compressorVibrationSwitch: {hours: 0, minutes: 0, text: 'Vibration Switch'},
                    },
                    cooler:     {
                        cooling:               {hours: 0, minutes: 0, text: 'Cooling'},
                        coolTubeRepair:        {hours: 0, minutes: 0, text: 'Cool Tube Repair'},
                        leakTesting:           {hours: 0, minutes: 0, text: 'Leak Testing'},
                        pluggingCoolerTube:    {hours: 0, minutes: 0, text: 'Plugging Cooler Tube'},
                        flushCooler:           {hours: 0, minutes: 0, text: 'Flush Cooler'},
                        washCooler:            {hours: 0, minutes: 0, text: 'Wash Cooler'},
                        coolerBelts:           {hours: 0, minutes: 0, text: 'Belts'},
                        shaftBearing:          {hours: 0, minutes: 0, text: 'Shaft Bearing'},
                        idlerBearing:          {hours: 0, minutes: 0, text: 'Idler Bearing'},
                        fan:                   {hours: 0, minutes: 0, text: 'Fan'},
                        shivePulley:           {hours: 0, minutes: 0, text: 'Shive Pulley'},
                        coolerVibrationSwitch: {hours: 0, minutes: 0, text: 'Vibration Switch'},
                    },
                    vessel:     {
                        dumpControl:      {hours: 0, minutes: 0, text: 'Dump Control'},
                        reliefValve:      {hours: 0, minutes: 0, text: 'Relief Valve'},
                        suctionValve:     {hours: 0, minutes: 0, text: 'Suction Valve'},
                        dumpValve:        {hours: 0, minutes: 0, text: 'Dump Valve'},
                        piping:           {hours: 0, minutes: 0, text: 'Piping'},
                        screenWitchesHat: {hours: 0, minutes: 0, text: 'Screen/Witches Hat'},
                        vesselDampners:   {hours: 0, minutes: 0, text: 'Dampners'},
                    },
                },
                parts:      [],

                jsa: {
                    agree:                false,
                    location:             '',
                    customer:             '',
                    descriptionOfWork:    '',
                    emergencyEvac:        '',
                    hazardPlanning:       '',
                    techinicians:         [],
                    controlsAndPractices: {
                        confinedSpaceEntry:        false,
                        spillKit:                  false,
                        restrictAccess:            false,
                        cutResistantGloves:        false,
                        ppe:                       false,
                        reviewEmergencyActionPlan: false,
                        drinkWater:                false,
                        electrician:               false,
                        heatResistantGloves:       false,
                        lockoutTagout:             false,
                        depressurize:              false,
                        chemGloves:                false,
                        siteJobOrientation:        false,
                        samplingMonitoring:        false,
                        equipmentCooldown:         false,
                        fireExtinguisher:          false,
                    },
                    potentialHazards:     {
                        bodyPosition:           false,
                        pinch:                  false,
                        crushOrStriking:        false,
                        sharpEdges:             false,
                        materialHandling:       false,
                        environmental:          false,
                        lifting:                false,
                        elevatedBodyTemp:       false,
                        h2s:                    false,
                        hotColdSurfaces:        false,
                        laceration:             false,
                        chemExposure:           false,
                        fallFromElevation:      false,
                        slickSurfaces:          false,
                        excavation:             false,
                        slips:                  false,
                        trips:                  false,
                        falls:                  false,
                        equipment:              false,
                        fireExplosionPotential: false,
                        eletricShock:           false,
                        confinedSpace:          false,
                    },
                },
            }
        },
    }
}

angular
    .module('WorkOrderApp.Services')
    .factory('CommonWOfunctions',
        ['$timeout', 'ObjectService', 'ApiRequestService', 'TimeDisplayService', CommonWOfunctions])

'use strict';

/**
 * Build method used to add MongoDB connection details
 * @param {MongoClient} mdb instance of MongoClient to use
 * @param {String} collection name collection we want to use ('agendaJobs')
 * @param {Function} cb called when MongoDB connection fails or passes
 * @returns {exports} instance of Agenda
 */
module.exports = function(mdb, collection, cb) {
  this._mdb = mdb;
  this.db_init(collection, cb);
  return this;
};

angular.module('MCDiligenceApp.Controllers')
    .controller('mcDiligenceModalCtrl', ['$window', '$scope', '$uibModalInstance',
        function ($window, $scope, $uibModalInstance) {
            $scope.unit = {};
            $scope.latLong = $scope.$parent.latLong;
            $scope.unit.geo = {
                type:        'Point',
                coordinates: [$scope.latLong[1], $scope.latLong[0]],
            };

            $scope.toUnitPage = () => {
                $uibModalInstance.close();
                $window.open('#/unit/page/' + $scope.unit.geo.coordinates[1] + ',' +
                    $scope.unit.geo.coordinates[0]);
            };
            $scope.ok = () => {
                $uibModalInstance.close();
            };
        }]);

angular.module('WorkOrderApp.Controllers').controller('AddPartEditModalCtrl',
  function ( $scope, $uibModalInstance, ObjectService){
    $scope.part = {};
    
    $scope.changePartTextAreaField = (changedData, selected) => {
      ObjectService.updateNonNestedObjectValue($scope.part, changedData, selected);
    };
    
    $scope.changePartTextField = ( changedData, selected ) => {
      ObjectService.updateNonNestedObjectValue($scope.part, changedData, selected);
    };
    
    $scope.addPart = () => {
      $uibModalInstance.close($scope.part);
    };
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  });

angular.module('WorkOrderApp.Controllers').controller('ConfirmationCtrl',
  function ($scope, $uibModalInstance){
    $scope.confirm = () => {
      $uibModalInstance.close(true);
    };
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  });

angular.module('WorkOrderApp.Controllers').controller('ErrorCtrl',
  function ($scope, $uibModalInstance){
    $scope.ok = () => {
      $uibModalInstance.close();
    };
  });

angular.module('WorkOrderApp.Controllers').controller('JsaEditModalCtrl',
  function ( $scope, $uibModalInstance, jsa, ObjectService ){
    $scope.jsa = jsa;
    
    $scope.changeJsaTextAreaField = (changeData, selected) => {
      ObjectService.updateNestedObjectValue($scope.jsa, changeData, selected);
    };
    
    $scope.changeJsaCheckbox = (changedData, selected) => {
      ObjectService.updateNestedObjectValue($scope.jsa, changedData, selected);
    };
    $scope.changeJsaTextField = (changedData, selected) => {
      ObjectService.updateNonNestedObjectValue($scope.jsa, changedData, selected);
    };
    
    $scope.ok = () => {
      $uibModalInstance.close($scope.jsa);
    };
    $scope.cancel = function (){
      $uibModalInstance.dismiss('cancel');
    };
    $scope.removeTech = (tech) => {
      const index = $scope.jsa.techinicians.indexOf(tech);
      $scope.jsa.techinicians.splice(index, 1);
    };
  });

function NotesModal($scope, $uibModalInstance, obj){
    $scope.notes = obj.notes;
    $scope.disabled = obj.disabled

    $scope.changeNoteTextAreaField = ( changedData, selected ) => {
        $scope.notes = changedData;
    };

    $scope.ok = () => {
        $uibModalInstance.close($scope.notes);
    };
    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };
}

angular
    .module('WorkOrderApp.Controllers')
    .controller('NotesModalCtrl', NotesModal);

angular.module('WorkOrderApp.Controllers').controller('SubmitAllModalCtrl',
    function ($scope, $uibModalInstance) {

        $scope.ok = () => {
            $uibModalInstance.close(true);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss(false);
        };
    });

function geoViewModal($window, $scope, $uibModalInstance, obj) {
    $scope.unit = obj.unit;
    $scope.unit.geo = obj.geo;

    $scope.toUnitPage = () => {
        $uibModalInstance.close();
        $window.open('#/unit/page/' + $scope.unit.geo.coordinates[1]+','+$scope.unit.geo.coordinates[0]);
    };
    $scope.ok = () => {
        $uibModalInstance.close();
    };
}

angular
    .module('WorkOrderApp.Controllers')
    .controller('woLocationModalCtrl',['$window', '$scope', '$uibModalInstance', 'obj', geoViewModal]);

/*
 *
 * Copyright (c) 2006-2014 Sam Collett (http://www.texotela.co.uk)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version 1.4
 * Demo: http://www.texotela.co.uk/code/jquery/numeric/
 *
 */
(function ($) {
/*
 * Allows only valid characters to be entered into input boxes.
 * Note: fixes value when pasting via Ctrl+V, but not when using the mouse to paste
  *      side-effect: Ctrl+A does not work, though you can still use the mouse to select (or double-click to select all)
 *
 * @name     numeric
 * @param    config      { decimal : "." , negative : true }
 * @param    callback     A function that runs if the number is not valid (fires onblur)
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @example  $(".numeric").numeric();
 * @example  $(".numeric").numeric(","); // use , as separator
 * @example  $(".numeric").numeric({ decimal : "," }); // use , as separator
 * @example  $(".numeric").numeric({ negative : false }); // do not allow negative values
 * @example  $(".numeric").numeric(null, callback); // use default values, pass on the 'callback' function
 *
 */
$.fn.numeric = function (config, callback)
{
	if(typeof config === 'boolean')
	{
		config = { decimal: config };
	}
	config = config || {};
	// if config.negative undefined, set to true (default is to allow negative numbers)
	if(typeof config.negative == "undefined") { config.negative = true; }
	// set decimal point
	var decimal = (config.decimal === false) ? "" : config.decimal || ".";
	// allow negatives
	var negative = (config.negative === true) ? true : false;
	// callback function
	callback = (typeof(callback) == "function" ? callback : function () {});
	// set data and methods
	return this.data("numeric.decimal", decimal).data("numeric.negative", negative).data("numeric.callback", callback).keypress($.fn.numeric.keypress).keyup($.fn.numeric.keyup).blur($.fn.numeric.blur);
};

$.fn.numeric.keypress = function (e)
{
	// get decimal character and determine if negatives are allowed
	var decimal = $.data(this, "numeric.decimal");
	var negative = $.data(this, "numeric.negative");
	// get the key that was pressed
	var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
	// allow enter/return key (only when in an input box)
	if(key == 13 && this.nodeName.toLowerCase() == "input")
	{
		return true;
	}
	else if(key == 13)
	{
		return false;
	}
	var allow = false;
	// allow Ctrl+A
	if((e.ctrlKey && key == 97 /* firefox */) || (e.ctrlKey && key == 65) /* opera */) { return true; }
	// allow Ctrl+X (cut)
	if((e.ctrlKey && key == 120 /* firefox */) || (e.ctrlKey && key == 88) /* opera */) { return true; }
	// allow Ctrl+C (copy)
	if((e.ctrlKey && key == 99 /* firefox */) || (e.ctrlKey && key == 67) /* opera */) { return true; }
	// allow Ctrl+Z (undo)
	if((e.ctrlKey && key == 122 /* firefox */) || (e.ctrlKey && key == 90) /* opera */) { return true; }
	// allow or deny Ctrl+V (paste), Shift+Ins
	if((e.ctrlKey && key == 118 /* firefox */) || (e.ctrlKey && key == 86) /* opera */ ||
	  (e.shiftKey && key == 45)) { return true; }
	// if a number was not pressed
	if(key < 48 || key > 57)
	{
	  var value = $(this).val();
		/* '-' only allowed at start and if negative numbers allowed */
		if($.inArray('-', value.split('')) !== 0 && negative && key == 45 && (value.length === 0 || parseInt($.fn.getSelectionStart(this), 10) === 0)) { return true; }
		/* only one decimal separator allowed */
		if(decimal && key == decimal.charCodeAt(0) && $.inArray(decimal, value.split('')) != -1)
		{
			allow = false;
		}
		// check for other keys that have special purposes
		if(
			key != 8 /* backspace */ &&
			key != 9 /* tab */ &&
			key != 13 /* enter */ &&
			key != 35 /* end */ &&
			key != 36 /* home */ &&
			key != 37 /* left */ &&
			key != 39 /* right */ &&
			key != 46 /* del */
		)
		{
			allow = false;
		}
		else
		{
			// for detecting special keys (listed above)
			// IE does not support 'charCode' and ignores them in keypress anyway
			if(typeof e.charCode != "undefined")
			{
				// special keys have 'keyCode' and 'which' the same (e.g. backspace)
				if(e.keyCode == e.which && e.which !== 0)
				{
					allow = true;
					// . and delete share the same code, don't allow . (will be set to true later if it is the decimal point)
					if(e.which == 46) { allow = false; }
				}
				// or keyCode != 0 and 'charCode'/'which' = 0
				else if(e.keyCode !== 0 && e.charCode === 0 && e.which === 0)
				{
					allow = true;
				}
			}
		}
		// if key pressed is the decimal and it is not already in the field
		if(decimal && key == decimal.charCodeAt(0))
		{
			if($.inArray(decimal, value.split('')) == -1)
			{
				allow = true;
			}
			else
			{
				allow = false;
			}
		}
	}
	else
	{
		allow = true;
	}
	return allow;
};

$.fn.numeric.keyup = function (e)
{
	var val = $(this).val();
	if(val && val.length > 0)
	{
		// get carat (cursor) position
		var carat = $.fn.getSelectionStart(this);
		var selectionEnd = $.fn.getSelectionEnd(this);
		// get decimal character and determine if negatives are allowed
		var decimal = $.data(this, "numeric.decimal");
		var negative = $.data(this, "numeric.negative");

		// prepend a 0 if necessary
		if(decimal !== "" && decimal !== null)
		{
			// find decimal point
			var dot = $.inArray(decimal, val.split(''));
			// if dot at start, add 0 before
			if(dot === 0)
			{
				this.value = "0" + val;
				carat++;
            			selectionEnd++;
			}
			// if dot at position 1, check if there is a - symbol before it
			if(dot == 1 && val.charAt(0) == "-")
			{
				this.value = "-0" + val.substring(1);
				carat++;
            			selectionEnd++;
			}
			val = this.value;
		}

		// if pasted in, only allow the following characters
		var validChars = [0,1,2,3,4,5,6,7,8,9,'-',decimal];
		// get length of the value (to loop through)
		var length = val.length;
		// loop backwards (to prevent going out of bounds)
		for(var i = length - 1; i >= 0; i--)
		{
			var ch = val.charAt(i);
			// remove '-' if it is in the wrong place
			if(i !== 0 && ch == "-")
			{
				val = val.substring(0, i) + val.substring(i + 1);
			}
			// remove character if it is at the start, a '-' and negatives aren't allowed
			else if(i === 0 && !negative && ch == "-")
			{
				val = val.substring(1);
			}
			var validChar = false;
			// loop through validChars
			for(var j = 0; j < validChars.length; j++)
			{
				// if it is valid, break out the loop
				if(ch == validChars[j])
				{
					validChar = true;
					break;
				}
			}
			// if not a valid character, or a space, remove
			if(!validChar || ch == " ")
			{
				val = val.substring(0, i) + val.substring(i + 1);
			}
		}
		// remove extra decimal characters
		var firstDecimal = $.inArray(decimal, val.split(''));
		if(firstDecimal > 0)
		{
			for(var k = length - 1; k > firstDecimal; k--)
			{
				var chch = val.charAt(k);
				// remove decimal character
				if(chch == decimal)
				{
					val = val.substring(0, k) + val.substring(k + 1);
				}
			}
		}
		// set the value and prevent the cursor moving to the end
		this.value = val;
		$.fn.setSelection(this, [carat, selectionEnd]);
	}
};

$.fn.numeric.blur = function ()
{
	var decimal = $.data(this, "numeric.decimal");
	var callback = $.data(this, "numeric.callback");
	var val = this.value;
	if(val !== "")
	{
		var re = new RegExp("^\\d+$|^\\d*" + decimal + "\\d+$");
		if(!re.exec(val))
		{
			callback.apply(this);
		}
	}
};

$.fn.removeNumeric = function ()
{
	return this.data("numeric.decimal", null).data("numeric.negative", null).data("numeric.callback", null).unbind("keypress", $.fn.numeric.keypress).unbind("blur", $.fn.numeric.blur);
};

// Based on code from http://javascript.nwbox.com/cursor_position/ (Diego Perini <dperini@nwbox.com>)
$.fn.getSelectionStart = function (o)
{
	if(o.type === "number"){
		return undefined;
	}
	else if (o.createTextRange)
	{
		var r;
        if(typeof document.selection == "undefined") {
            //On IE < 9 && IE >= 11 : "document.selection" is deprecated and you should use "document.getSelection()"
            //https://github.com/SamWM/jQuery-Plugins/issues/62
            r = document.getSelection();
        } else {
            r = document.selection.createRange().duplicate();
            r.moveEnd('character', o.value.length);
        }
		if (r.text == '') return o.value.length;

		return o.value.lastIndexOf(r.text);
	} else {
        try { return o.selectionStart; }
        catch(e) { return 0; }
    }
};

// Based on code from http://javascript.nwbox.com/cursor_position/ (Diego Perini <dperini@nwbox.com>)
$.fn.getSelectionEnd = function (o)
{
	if(o.type === "number"){
		return undefined;
	}
	else if (o.createTextRange) {
		var r = document.selection.createRange().duplicate()
		r.moveStart('character', -o.value.length)
		return r.text.length
	} else return o.selectionEnd
}

// set the selection, o is the object (input), p is the position ([start, end] or just start)
$.fn.setSelection = function (o, p)
{
	// if p is number, start and end are the same
	if(typeof p == "number") { p = [p, p]; }
	// only set if p is an array of length 2
	if(p && p.constructor == Array && p.length == 2)
	{
		if(o.type === "number") {
			o.focus();
		}
		else if (o.createTextRange)
		{
			var r = o.createTextRange();
			r.collapse(true);
			r.moveStart('character', p[0]);
			r.moveEnd('character', p[1]);
			r.select();
		}
		else {
            o.focus();
            try{
                if(o.setSelectionRange)
                {
                    o.setSelectionRange(p[0], p[1]);
                }
            } catch(e) {
            }
        }
	}
};

})(jQuery);

/*!
 * Bootstrap v3.2.0 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function (a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function (b){var c=!1,d=this;a(this).one("bsTransitionEnd",function (){c=!0});var e=function (){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function (){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function (b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function (b){a(b).on("click",c,this.close)};d.VERSION="3.2.0",d.prototype.close=function (b){function c(){f.detach().trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",c).emulateTransitionEnd(150):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function (){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function (b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.2.0",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function (b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),d[e](null==f[b]?this.options[b]:f[b]),setTimeout(a.proxy(function (){"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function (){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}a&&this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function (){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function (c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),c.preventDefault()})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function (b,c){this.$element=a(b).on("keydown.bs.carousel",a.proxy(this.keydown,this)),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.2.0",c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},c.prototype.keydown=function (a){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()},c.prototype.cycle=function (b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function (a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.to=function (b){var c=this,d=this.getItemIndex(this.$active=this.$element.find(".item.active"));return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function (){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},c.prototype.pause=function (b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function (){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function (){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function (b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}if(e.hasClass("active"))return this.sliding=!1;var j=e[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:g});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,f&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(e)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:g});return a.support.transition&&this.$element.hasClass("slide")?(e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one("bsTransitionEnd",function (){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function (){i.$element.trigger(m)},0)}).emulateTransitionEnd(1e3*d.css("transition-duration").slice(0,-1))):(d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger(m)),f&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function (){return a.fn.carousel=d,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function (c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}}),a(window).on("load",function (){a('[data-ride="carousel"]').each(function (){var c=a(this);b.call(c,c.data())})})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b);!e&&f.toggle&&"show"==b&&(b=!b),e||d.data("bs.collapse",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function (b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};c.VERSION="3.2.0",c.DEFAULTS={toggle:!0},c.prototype.dimension=function (){var a=this.$element.hasClass("width");return a?"width":"height"},c.prototype.show=function (){if(!this.transitioning&&!this.$element.hasClass("in")){var c=a.Event("show.bs.collapse");if(this.$element.trigger(c),!c.isDefaultPrevented()){var d=this.$parent&&this.$parent.find("> .panel > .in");if(d&&d.length){var e=d.data("bs.collapse");if(e&&e.transitioning)return;b.call(d,"hide"),e||d.data("bs.collapse",null)}var f=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[f](0),this.transitioning=1;var g=function (){this.$element.removeClass("collapsing").addClass("collapse in")[f](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return g.call(this);var h=a.camelCase(["scroll",f].join("-"));this.$element.one("bsTransitionEnd",a.proxy(g,this)).emulateTransitionEnd(350)[f](this.$element[0][h])}}},c.prototype.hide=function (){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function (){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(d,this)).emulateTransitionEnd(350):d.call(this)}}},c.prototype.toggle=function (){this[this.$element.hasClass("in")?"hide":"show"]()};var d=a.fn.collapse;a.fn.collapse=b,a.fn.collapse.Constructor=c,a.fn.collapse.noConflict=function (){return a.fn.collapse=d,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function (c){var d,e=a(this),f=e.attr("data-target")||c.preventDefault()||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""),g=a(f),h=g.data("bs.collapse"),i=h?"toggle":e.data(),j=e.attr("data-parent"),k=j&&a(j);h&&h.transitioning||(k&&k.find('[data-toggle="collapse"][data-parent="'+j+'"]').not(e).addClass("collapsed"),e[g.hasClass("in")?"addClass":"removeClass"]("collapsed")),b.call(g,i)})}(jQuery),+function (a){"use strict";function b(b){b&&3===b.which||(a(e).remove(),a(f).each(function (){var d=c(a(this)),e={relatedTarget:this};d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown",e)),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown",e))}))}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function d(b){return this.each(function (){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function (b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.2.0",g.prototype.toggle=function (d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus"),f.toggleClass("open").trigger("shown.bs.dropdown",h)}return!1}},g.prototype.keydown=function (b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var e=c(d),g=e.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.divider):visible a",i=e.find('[role="menu"]'+h+', [role="listbox"]'+h);if(i.length){var j=i.index(i.filter(":focus"));38==b.keyCode&&j>0&&j--,40==b.keyCode&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function (){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function (a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f+', [role="menu"], [role="listbox"]',g.prototype.keydown)}(jQuery),+function (a){"use strict";function b(b,d){return this.each(function (){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function (b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$backdrop=this.isShown=null,this.scrollbarWidth=0,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function (){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.2.0",c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function (a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function (b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.$body.addClass("modal-open"),this.setScrollbar(),this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function (){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(c.$body),c.$element.show().scrollTop(0),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one("bsTransitionEnd",function (){c.$element.trigger("focus").trigger(e)}).emulateTransitionEnd(300):c.$element.trigger("focus").trigger(e)}))},c.prototype.hide=function (b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.$body.removeClass("modal-open"),this.resetScrollbar(),this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},c.prototype.enforceFocus=function (){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function (a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function (){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function (a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},c.prototype.hideModal=function (){var a=this;this.$element.hide(),this.backdrop(function (){a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function (){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function (b){var c=this,d=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var e=a.support.transition&&d;if(this.$backdrop=a('<div class="modal-backdrop '+d+'" />').appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function (a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),e&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;e?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(150):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var f=function (){c.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",f).emulateTransitionEnd(150):f()}else b&&b()},c.prototype.checkScrollbar=function (){document.body.clientWidth>=window.innerWidth||(this.scrollbarWidth=this.scrollbarWidth||this.measureScrollbar())},c.prototype.setScrollbar=function (){var a=parseInt(this.$body.css("padding-right")||0,10);this.scrollbarWidth&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function (){this.$body.css("padding-right","")},c.prototype.measureScrollbar=function (){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function (){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function (c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function (a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function (){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function (a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};c.VERSION="3.2.0",c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function (b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(this.options.viewport.selector||this.options.viewport);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function (){return c.DEFAULTS},c.prototype.getOptions=function (b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function (){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function (a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function (b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function (){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show()},c.prototype.leave=function (b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function (){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function (){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var c=a.contains(document.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!c)return;var d=this,e=this.tip(),f=this.getUID(this.type);this.setContent(),e.attr("id",f),this.$element.attr("aria-describedby",f),this.options.animation&&e.addClass("fade");var g="function"==typeof this.options.placement?this.options.placement.call(this,e[0],this.$element[0]):this.options.placement,h=/\s?auto?\s?/i,i=h.test(g);i&&(g=g.replace(h,"")||"top"),e.detach().css({top:0,left:0,display:"block"}).addClass(g).data("bs."+this.type,this),this.options.container?e.appendTo(this.options.container):e.insertAfter(this.$element);var j=this.getPosition(),k=e[0].offsetWidth,l=e[0].offsetHeight;if(i){var m=g,n=this.$element.parent(),o=this.getPosition(n);g="bottom"==g&&j.top+j.height+l-o.scroll>o.height?"top":"top"==g&&j.top-o.scroll-l<0?"bottom":"right"==g&&j.right+k>o.width?"left":"left"==g&&j.left-k<o.left?"right":g,e.removeClass(m).addClass(g)}var p=this.getCalculatedOffset(g,j,k,l);this.applyPlacement(p,g);var q=function (){d.$element.trigger("shown.bs."+d.type),d.hoverState=null};a.support.transition&&this.$tip.hasClass("fade")?e.one("bsTransitionEnd",q).emulateTransitionEnd(150):q()}},c.prototype.applyPlacement=function (b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top=b.top+g,b.left=b.left+h,a.offset.setOffset(d[0],a.extend({using:function (a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=k.left?2*k.left-e+i:2*k.top-f+j,m=k.left?"left":"top",n=k.left?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(l,d[0][n],m)},c.prototype.replaceArrow=function (a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},c.prototype.setContent=function (){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function (){function b(){"in"!=c.hoverState&&d.detach(),c.$element.trigger("hidden.bs."+c.type)}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.removeAttr("aria-describedby"),this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one("bsTransitionEnd",b).emulateTransitionEnd(150):b(),this.hoverState=null,this)},c.prototype.fixTitle=function (){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function (){return this.getTitle()},c.prototype.getPosition=function (b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName;return a.extend({},"function"==typeof c.getBoundingClientRect?c.getBoundingClientRect():null,{scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop(),width:d?a(window).width():b.outerWidth(),height:d?a(window).height():b.outerHeight()},d?{top:0,left:0}:b.offset())},c.prototype.getCalculatedOffset=function (a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function (a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.width&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function (){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function (a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function (){return this.$tip=this.$tip||a(this.options.template)},c.prototype.arrow=function (){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.validate=function (){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},c.prototype.enable=function (){this.enabled=!0},c.prototype.disable=function (){this.enabled=!1},c.prototype.toggleEnabled=function (){this.enabled=!this.enabled},c.prototype.toggle=function (b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function (){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function (){return a.fn.tooltip=d,this}}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||"destroy"!=b)&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function (a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.2.0",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function (){return c.DEFAULTS},c.prototype.setContent=function (){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").empty()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function (){return this.getTitle()||this.getContent()},c.prototype.getContent=function (){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function (){return this.$arrow=this.$arrow||this.tip().find(".arrow")},c.prototype.tip=function (){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function (){return a.fn.popover=d,this}}(jQuery),+function (a){"use strict";function b(c,d){var e=a.proxy(this.process,this);this.$body=a("body"),this.$scrollElement=a(a(c).is("body")?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",e),this.refresh(),this.process()}function c(c){return this.each(function (){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.2.0",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function (){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function (){var b="offset",c=0;a.isWindow(this.$scrollElement[0])||(b="position",c=this.$scrollElement.scrollTop()),this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight();var d=this;this.$body.find(this.selector).map(function (){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+c,e]]||null}).sort(function (a,b){return a[0]-b[0]}).each(function (){d.offsets.push(this[0]),d.targets.push(this[1])})},b.prototype.process=function (){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<=e[0])return g!=(a=f[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function (b){this.activeTarget=b,a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function (){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function (){a('[data-spy="scroll"]').each(function (){var b=a(this);c.call(b,b.data())})})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function (b){this.element=a(b)};c.VERSION="3.2.0",c.prototype.show=function (){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.closest("li"),c),this.activate(g,g.parent(),function (){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},c.prototype.activate=function (b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one("bsTransitionEnd",e).emulateTransitionEnd(150):e(),f.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function (){return a.fn.tab=d,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function (c){c.preventDefault(),b.call(a(this),"show")})}(jQuery),+function (a){"use strict";function b(b){return this.each(function (){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function (b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.2.0",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getPinnedOffset=function (){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function (){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function (){if(this.$element.is(":visible")){var b=a(document).height(),d=this.$target.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top(this.$element)),"function"==typeof h&&(h=f.bottom(this.$element));var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=b-h?"bottom":null!=g&&g>=d?"top":!1;if(this.affixed!==i){null!=this.unpin&&this.$element.css("top","");var j="affix"+(i?"-"+i:""),k=a.Event(j+".bs.affix");this.$element.trigger(k),k.isDefaultPrevented()||(this.affixed=i,this.unpin="bottom"==i?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed"))),"bottom"==i&&this.$element.offset({top:b-this.$element.height()-h}))}}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function (){return a.fn.affix=d,this},a(window).on("load",function (){a('[data-spy="affix"]').each(function (){var c=a(this),d=c.data();d.offset=d.offset||{},d.offsetBottom&&(d.offset.bottom=d.offsetBottom),d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
