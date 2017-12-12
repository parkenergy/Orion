angular.module('CommonComponents')
.component('areaPmDash', {
  templateUrl: '/lib/public/angular/views/component.views/areaPmDash.html',
  bindings: {
    units: '<',
    users: '<',
    areaName: '<'
  },
  controller: ['$location', 'PmDashService', class AreaPmDashCtrl{
    // Create values to be shown --------------------------
    constructor ($location, PmDashService) {
      this.$location = $location;
      this.PMS = PmDashService;
      
      this.activePMStatus = 0;
      this.active = 0;
      this.test = 0;
      this.idle = 0;
      this.total = 0;
      
      this.usersUnits = [];
      this.displayUsers = [];
      this.activeUnits = [];
      this.usernames = [];
      this.sortReverse = false;
      this.sortType = "percent";
    }
    // ----------------------------------------------------
    
    // Init values ----------------------------------------
    $onInit() {
      // get usernames from list of users and fill full name
      this.users.forEach((user) => {
        this.usernames.push(user.username);
        // create new user display object
        const thisUser = this.newDisplayUser();
        thisUser.username = user.username;
        thisUser.name = user.firstName.concat(" ").concat(user.lastName);
        if (user.email) {
          this.displayUsers.push(thisUser);
        }
      });
      // for each user map through and add to users units
      this.displayUsers.forEach((user) => {
        this.units.forEach((unit) => {
          if(unit.assignedTo === user.username) {
            this.usersUnits.push(unit);
          }
        });
      });
      
      // for each user map through associated units
      this.displayUsers.forEach((user) => {
        const thisUsersUnits = [];
        // get all units for this user and add them to array
        this.usersUnits.forEach((unit) => {
          if(unit.assignedTo === user.username){
            this.total += 1;
            thisUsersUnits.push(unit);
            if(unit.status === "Active - On Contract") {
              this.active += 1;
              user.activeUnits += 1;
            } else if (unit.status === "Active - On Test" || unit.status === "Test") {
              this.test += 1;
              user.testUnits += 1;
            } else if(unit.status === "Idle") {
              this.idle += 1;
              user.idleUnits += 1;
            }
          }
        });
        // calc total user percentage
        if(thisUsersUnits.length > 0) {
          user.percent = +(this.PMS.returnUnitsPmPercent(thisUsersUnits) * 100).toFixed(2);
        }
      });
      // remove user from list, has no active units
      const toDelete = new Set([0]);
      this.displayUsers = this.displayUsers.filter((obj) => !toDelete.has(obj.activeUnits));
      
      // set activePMstatus for all users
      this.activePMStatus = this.PMS.totalPercent(this.displayUsers).toFixed(0);
    }
    // ----------------------------------------------------
    
    // Construct visual object for listing. and resort method
    resort(by) {
      this.sortType = by;
      this.sortReverse = !this.sortReverse;
    }
    
    newDisplayUser() {
      return {
        username: "",
        name: "",
        idleUnits: 0,
        activeUnits: 0,
        testUnits: 0,
        percent: 0
      }
    }
    // ----------------------------------------------------
    
    // Routing --------------------------------------------
    routeToUser(user) {
      const username = user.username;
      this.$location.url(`/areapmreport/${this.areaName}/${username}`);
    }
    // ----------------------------------------------------
  }]
});
