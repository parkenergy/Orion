angular.module('CommonComponents')
.component('userPmDash', {
  templateUrl: '/lib/public/angular/views/component.views/userPmDash.html',
  bindings: {
    updateWorkOrders: '&',
    spin: '<',
    loaded: '<',
    user: '<',
    units: '<',
    workorders: '<'
  },
  controller: ['$window', '$location', 'PmDashService', 'ApiRequestService', 'SessionService', class UserPmDashCtrl{
    // Create values to be shown --------------------------
    constructor ($window, $location, PmDashService, ApiRequestService, SessionService) {
      this.$window = $window;
      this.$location = $location;
      this.PMS = PmDashService;
      this.ARS = ApiRequestService;
      this.SS = SessionService;
      
      this.fullName = "";
      
      this.activePMStatus = 0;
      this.active = 0;
      this.test = 0;
      this.idle = 0;
      this.total = 0;
      this.totalWorkorders = "..Loading";
      this.totalShownWOs = "..Loading";
      this.indirect = 0;
      
      this.days = 90;
      this.displayUnits = [];
      this.sortReverse = true;
      this.sortType = "nextPmDate";
      this.supervisor = "";
    }
    // ----------------------------------------------------
    
    // Init values ----------------------------------------
    $onInit() {
      this.fullName = this.user.firstName.concat(" ").concat(this.user.lastName);
      this.ARS.Users({textId: this.user.supervisor})
        .then((res) => {
          if(res.length > 0) {
            this.supervisor = res[0].firstName.concat(" ").concat(res[0].lastName);
          }
        })
        .catch((err) => console.log(err));
    }
    // ----------------------------------------------------
    
    // On any one way data bound change -------------------
    $onChanges(changes) {
      if(changes.hasOwnProperty("workorders")){
        if(this.workorders) {
          this.totalWorkorders = this.workorders.length;
          this.createDisplayUnits(this.units);
        }
      }
      if(changes.hasOwnProperty("units")){
        // call method to rework display units info
        //this.createDisplayUnits(changes.units.currentValue);
        if(this.units){
          this.setHeader(this.units);
          this.activePMStatus = +(this.PMS.returnUnitsPmPercent(this.units) * 100).toFixed(2);
        }
      }
    }
    // ----------------------------------------------------
    
    // Set Header -----------------------------------------
    setHeader(units) {
      // Set Header values
      units.forEach((unit) => {
        this.total += 1;
        if(unit.status === "Active - On Contract"){
          this.active += 1;
        } else if (unit.status === "Active - On Test" || unit.status === "Test") {
          this.test += 1;
        } else if(unit.status === "Idle") {
          this.idle += 1;
        }
      })
    }
    // ----------------------------------------------------
    
    // Create Display Units from Units --------------------
    createDisplayUnits(units) {
      this.displayUnits = [];
      if(units){
        units.forEach((unit) => {
          const thisUnit = this.newDisplayUnit();
          thisUnit.unitNumber = unit.number;
          thisUnit.status = unit.status.split(" ")[0];
          thisUnit.nextPmDate = unit.nextPmDate;
          this.workorders.forEach((wo) => {
            if(wo.unitNumber && wo.unitNumber === unit.number){
              switch (wo.type) {
                case "PM":
                  thisUnit.PM += 1;
                  break;
                case "Trouble Call":
                  thisUnit.troubleCall += 1;
                  break;
                case "New Set":
                  thisUnit.newSet += 1;
                  break;
                case "Release":
                  thisUnit.release += 1;
                  break;
                case "Corrective":
                  thisUnit.corrective += 1;
                  break;
              }
            }
          });
          this.displayUnits.push(thisUnit);
        });
      }
      this.totalShownWOs = 0;
      // fill out total # of shown workorders count
      this.displayUnits.forEach((unit) => {
        this.totalShownWOs += unit.corrective;
        this.totalShownWOs += unit.release;
        this.totalShownWOs += unit.newSet;
        this.totalShownWOs += unit.troubleCall;
        this.totalShownWOs += unit.PM;
      });
    }
    // ----------------------------------------------------
    
    // Search & Changes -----------------------------------
    dayChange(changedData) {
      this.days = changedData
    }
    search() {
      this.totalWorkorders = "...Loading";
      this.updateWorkOrders({days: this.days});
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
        corrective: 0,
        release: 0,
        troubleCall: 0,
        newSet: 0,
        PM: 0,
        status: "",
        nextPmDate: ""
      }
    }
    // ----------------------------------------------------
  
    // Routing --------------------------------------------
    searchUnits(unit) {
      this.SS.add("unitNumber", unit.unitNumber);
      this.$window.open(`#/workorder`);
    }
    // ----------------------------------------------------
  }]
});
