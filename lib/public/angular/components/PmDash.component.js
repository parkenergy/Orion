angular.module('CommonComponents')
.component('pmDash', {
  templateUrl: '/lib/public/angular/views/component.views/pmReport.html',
  bindings: {
    units: '<',
    users: '<',
    unapproved: '<'
  },
  controller: ['$timeout', '$location', 'PmDashService', 'SessionService', class PmDashCtrl {
    // Create values to be shown --------------------------
    constructor ($timeout, $location, PmDashService, SessionService) {
      this.$timeout = $timeout;
      this.$location = $location;
      this.PMS = PmDashService;
      this.SS = SessionService;
      
      this.activePMStatus = 0;
      this.active = 0;
      this.test = 0;
      this.idle = 0;
      this.total = 0;
      
      this.areas = [];
      this.activeUnits = [];
      this.userAreas = [];
      this.fullNameAreas = [];
      this.sortReverse = false;
      this.sortType = "percent";
    }
    // ----------------------------------------------------
    
    // Init values ----------------------------------------
    $onInit() {
      // fill all areas from users to be shown. Don't need Corporate
      this.users.forEach((user) => {
        if(user.area){
          const area = user.area.split(":")[0].slice(2).trim();
          if(this.userAreas.indexOf(area) === -1 && area !== "CORPORATE") {
            this.userAreas.push(area);
            this.fullNameAreas.push(user.area);
            // Create list of areas
            const thisArea = this.newArea();
            thisArea.locationName = area;
            this.areas.push(thisArea);
          }
        }
      });
      
      // for each area map users and get associated units and users.
      this.areas.forEach((area) => {
        const areaPercentages = [];
        this.users.map((user) => {
          if(user.area) {
            const userArea = user.area.split(":")[0].slice(2).trim();
            // if the area for the user is the same as the area we are working on
            if(userArea === area.locationName) {
              const thisUsersUnits = [];
              // get all units for this user and add them to array
              this.units.forEach((unit) => {
                if(unit.assignedTo === user.username){
                  thisUsersUnits.push(unit);
                }
              });
              // push 1 or 0 into a new array to get a percentage.
              // depends on unit nextPM time
              if(thisUsersUnits.length > 0) {
                areaPercentages.push(this.PMS.returnUnitsPmPercent(thisUsersUnits));
              }
              const activeUnits = this.PMS.returnActiveUnits(thisUsersUnits);
              area.activeUnits += activeUnits.length;
            }
          }
        });
        // calc total area percentages
        const total = areaPercentages.reduce((a,b) => a + b, 0);
        if(areaPercentages.length === 0 && total === 0) {
          area.percent = 0;
        } else {
          area.percent = +((total / areaPercentages.length).toFixed(2) * 100).toFixed(0);
        }
      });
      // remove area from the list, has no active units
      const toDelete = new Set([0]);
      this.areas = this.areas.filter((obj) => !toDelete.has(obj.activeUnits));
      
      // Set heading information, Total, Idle, Active, Percent
      this.setHeader();
    }
    // ----------------------------------------------------
    
    // Changes due to async code --------------------------
    $onChanges(changes) {
      this.$timeout(() => {
        this.areas.forEach((a) => {
          this.unapproved.forEach((u) => {
            if(a.locationName === u.area) {
              a.unapproved = u.count;
            }
          })
        });
      }, 300)
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
        activeUnits: 0,
        percent: 0
      }
    }
    // ----------------------------------------------------
    
    // Set header information -----------------------------
    setHeader() {
      this.units.forEach((unit) => {
        if(unit.status !== "Sold Unit") {
          this.total += 1;
        }
        if(unit.status === "Active - On Contract") {
          this.active += 1;
        } else if(unit.status === "Active - On Test" || unit.status === "Test") {
          this.test += 1;
        } else if(unit.status === "Idle") {
          this.idle += 1;
        }
      });
      this.activePMStatus = this.PMS.totalPercent(this.areas);
    }
    // ----------------------------------------------------
    
    // Routing --------------------------------------------
    routeToArea(area) {
      const location = area.locationName;
      this.$location.path(`/areapmreport/${location}`);
    }
    // ----------------------------------------------------
  }]
});