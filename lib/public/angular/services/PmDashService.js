angular.module('CommonServices')
.factory('PmDashService', [function () {
  const PMS = {};
  
  PMS.green = "#b2f4b3";
  PMS.yellow = "#eff4b2";
  PMS.red = "#f4bab2";
  
  // Set the background colors for percentages ----------
  PMS.setBackgroundColor = (percent) => {
    if(percent > 95) {
      return PMS.green;
    } else if(percent > 90 && percent < 95) {
      return PMS.yellow;
    } else {
      return PMS.red;
    }
  };
  // ----------------------------------------------------
  
  // Get the percentage in decimal format for a group of units
  PMS.returnUnitsPmPercent = (units) => {
    const unitPercentages = [];
    const now = new Date().getTime(); // right now
    units.forEach((unit) => {
      if (unit.status !== "Sold Unit" || unit.status !== "Idle") {
        const unitNextPM = new Date(unit.nextPmDate).getTime();  // pm is due
        if(unitNextPM > now) {
          // next pm date has not come yet.
          unitPercentages.push(1);
        } else if(unitNextPM < now) {
          // the next pm date has passed.
          unitPercentages.push(0);
        }
      }
    });
    // calc total unit percentages
    const total = unitPercentages.reduce((a,b) => a + b, 0);
    if(unitPercentages.length === 0 && total === 0) {
      return 0;
    } else {
      return +(total / unitPercentages.length).toFixed(2);
    }
  };
  // ----------------------------------------------------
  
  // Return all active units in a list of units ---------
  PMS.returnActiveUnits = (units) => {
    const activeUnits = [];
    if(units.length > 0) {
      units.forEach((unit) => {
        if(unit.status !== "Sold Unit" && unit.status !== "Idle") {
          activeUnits.push(unit);
        }
      });
    }
    return activeUnits;
  };
  // ----------------------------------------------------
  
  // Set background color for date ----------------------
  PMS.setDateBackground = (date) => {
    const checker = 86400000; // 1 week
    const now = new Date().getTime(); // right now
    const dateTime = new Date(date).getTime(); // pm is due
    const green = now + checker; // seven days from now
  
    if(dateTime > green){
      return PMS.green;
    } else if( now < dateTime && dateTime < green ){
      return PMS.yellow;
    } else if( dateTime < now){
      return PMS.red;
    }
    return 'white';
  };
  // ----------------------------------------------------
  
  // Get total percentage from all areas ----------------
  PMS.totalPercent = (objListWithePercentField) => {
    const activeUnits = objListWithePercentField.map((obj) => {
      return obj.percent/100;
    });
    const total = activeUnits.reduce((a,b) => a + b, 0);
    return +(total / activeUnits.length).toFixed(2) * 100;
  };
  // ----------------------------------------------------
  
  return PMS;
}]);
