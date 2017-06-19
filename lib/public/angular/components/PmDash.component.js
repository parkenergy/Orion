angular.module('CommonComponents')
.component('pmDash', {
  templateUrl: '/lib/public/angular/views/component.views/pmReport.html',
  bindings: {
    units: '<',
    users: '<'
  },
  controller: ['$location', class PmDashCtrl {
    // Create values to be shown --------------------------
    constructor ($location) {
      this.$loc = $location;
      this.activePMStatus = 0;
      this.active = 0;
      this.idle = 0;
      this.total = 0;
      
      this.green = "#b2f4b3";
      this.yellow = "#eff4b2";
      this.red = "#f4bab2";
      
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
              // push 1, .5, or 0 into a new array to get a percentage.
              // depends on unit nextPM time and unit cycle time.
              if(thisUsersUnits.length > 0) {
                areaPercentages.push(this.returnUnitsPmPercent(thisUsersUnits));
              }
              const activeUnits = this.returnActiveUnits(thisUsersUnits);
              area.activeUnits += activeUnits.length;
            }
          }
        });
        // calc total area percentages
        const total = areaPercentages.reduce((a,b) => a + b, 0);
        if(areaPercentages.length === 0 && total === 0) {
          area.percent = 0;
        } else {
          area.percent = +(total / areaPercentages.length).toFixed(2) * 100;
        }
      });
      // remove area from the list, has no active units
      const toDelete = new Set([0]);
      this.areas = this.areas.filter((obj) => !toDelete.has(obj.activeUnits));
      
      // Set heading information, Total, Idle, Active, Percent
      this.setHeader();
    }
    // ----------------------------------------------------
  
    // Set the background colors for percentages ----------
    setBackgroundColor(percent) {
      if(percent > 95) {
        return this.green;
      } else if(percent > 90 && percent < 95) {
        return this.yellow;
      } else {
        return this.red;
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
        activeUnits: 0,
        percent: 0
      }
    }
    // ----------------------------------------------------
    
    // Get the percentage in decimal format for a group of units
    returnUnitsPmPercent(units) {
      const unitPercentages = [];
      const now = new Date().getTime(); // right now
      units.forEach((unit) => {
        const unitNextPM = new Date(unit.nextPmDate).getTime();  // pm is due
        if(unitNextPM > now) {
          // next pm date has not come yet.
          unitPercentages.push(1);
        } else if(unitNextPM < now) {
          // the next pm date has passed.
          unitPercentages.push(0);
        }
      });
      // calc total unit percentages
      const total = unitPercentages.reduce((a,b) => a + b, 0);
      return +(total / unitPercentages.length).toFixed(2);
    }
    // ----------------------------------------------------

    // Return all active units in a list of units ---------
    returnActiveUnits(units) {
      const activeUnits = [];
      if(units.length > 0) {
        units.forEach((unit) => {
          if(unit.status === "Active - On Contract") {
            activeUnits.push(unit);
          }
        });
      }
      return activeUnits;
    }
    // ----------------------------------------------------
    
    // Set header information -----------------------------
    setHeader() {
      this.units.forEach((unit) => {
        this.total += 1;
        if(unit.status === "Active - On Contract") {
          this.active += 1;
        } else {
          this.idle += 1;
        }
      });
      this.activePMStatus = this.areaPercentage(this.areas);
    }
    // ----------------------------------------------------
    
    // Get total percentage from all areas ----------------
    areaPercentage(areas) {
      const activeUnits = this.areas.map((area) => {
        return area.percent/100;
      });
      const total = activeUnits.reduce((a,b) => a + b, 0);
      return +(total / activeUnits.length).toFixed(2) * 100;
    }
    // ----------------------------------------------------
    
    // Routing --------------------------------------------
    routeToArea(area) {
      const location = area.locationName;
      this.$loc.path(`/areapmreport/${location}`);
    }
    // ----------------------------------------------------
  }]
});
