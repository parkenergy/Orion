function PmDashService () {
    const PMS = {};

    PMS.white = '#ffffff';
    PMS.green = '#b2f4b3';
    PMS.yellow = '#eff4b2';
    PMS.red = '#f4bab2';

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
        const unitPercent1 = {col: 0, percentName: 'nextPM1Date', percentages: [], total: 0}
        const unitPercent2 = {col: 1, percentName: 'nextPM2Date', percentages: [], total: 0}
        const unitPercent3 = {col: 2, percentName: 'nextPM3Date', percentages: [], total: 0}
        /*const unitPercent4 = {col: 3, percentName: 'nextPM4Date', percentages: [], total: 0}
        const unitPercent5 = {col: 4, percentName: 'nextPM5Date', percentages: [], total: 0}*/
        const unitPercentages = [unitPercent1, unitPercent2, unitPercent3/*, unitPercent4, unitPercent5*/];
        const now = new Date().getTime(); // right now
        const isPMed = (row, unit, percentages) => {
            const percentTime = new Date(unit[row.percentName]).getTime()
            if (percentTime > now) {
                // next pm date has not come yet.
                percentages[row.col].percentages.push(1)
            } else if (percentTime < now) {
                // the next pm date has passed.
                percentages[row.col].percentages.push(0)
            }
        }
        const idle = new RegExp('Idle', 'i')
        const sold = new RegExp('Sold', 'i')
        const sale = new RegExp('Sale', 'i')
        unitPercentages.forEach((rowPercent) => {
            units.forEach((unit) => {
                if (!unit.status.match(sold) && !unit.status.match(idle) && !unit.status.match(sale)) {
                    isPMed(rowPercent, unit, unitPercentages)
                }
            })
        })
        // calc total unit percentages
        const percentsLength = unitPercentages.reduce((a, b) =>{
            return a + b.percentages.length
        }, 0)
        let total = 0
        unitPercentages.forEach((col) => {
            total += col.percentages.reduce((a, b) => a + b, 0)
        })
        if (percentsLength === 0 && total === 0) {
            return 0
        } else {
            return +(total / percentsLength).toFixed(2)
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
        const idle = new RegExp('Idle', 'i')
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
        const idle = new RegExp('Idle', 'i')
        const sold = new RegExp('Sold', 'i')
        const sale = new RegExp('Sale', 'i')
        if (units.length > 0) {
            units.forEach((unit) => {
                if (!unit.status.match(sold) && !unit.status.match(idle) &&
                    !unit.status.match(sale)) {
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
        } else if ((now < dateTime) && (dateTime < green)) {
            return PMS.yellow;
        } else if (dateTime < now) {
            return PMS.red;
        } else {
            return 'white';
        }
    };
    PMS.setDate2Background = (unit) => {
        const checker = 604800000 // 1 week
        const now = new Date().getTime() // right now
        const dateTime = new Date(unit.nextPM2Date).getTime() // pm is due
        const green = now + checker // seven days from now
        if (unit.engineHP >= 60 && dateTime) {
            if (dateTime > green) {
                return PMS.green
            } else if ((now < dateTime) && (dateTime < green)) {
                return PMS.yellow
            } else if (dateTime < now) {
                return PMS.red
            } else {
                return 'white'
            }
        } else if (unit.engineHP < 60) {
            return 'white'
        } else {
            return PMS.red
        }
    }
    PMS.setDate3Background = (unit) => {
        const checker = 604800000 // 1 week
        const now = new Date().getTime() // right now
        const dateTime = new Date(unit.nextPM3Date).getTime() // pm is due
        const green = now + checker // seven days from now
        if (unit.engineHP >= 60 && dateTime) {
            if (dateTime > green) {
                return PMS.green
            } else if ((now < dateTime) && (dateTime < green)) {
                return PMS.yellow
            } else if (dateTime < now) {
                return PMS.red
            } else {
                return 'white'
            }
        } else if (unit.engineHP < 60) {
            return 'white'
        } else {
            return PMS.red
        }
    }
    PMS.setDate4Background = (unit) => {
        const checker = 604800000 // 1 week
        const now = new Date().getTime() // right now
        const dateTime = new Date(unit.nextPM4Date).getTime() // pm is due
        const green = now + checker // seven days from now
        if (unit.engineHP >= 60 && dateTime) {
            if (dateTime > green) {
                return PMS.green
            } else if ((now < dateTime) && (dateTime < green)) {
                return PMS.yellow
            } else if (dateTime < now) {
                return PMS.red
            } else {
                return 'white'
            }
        } else {
            return 'white'
        }
    }
    PMS.setDate5Background = (unit) => {
        const checker = 604800000 // 1 week
        const now = new Date().getTime() // right now
        const dateTime = new Date(unit.nextPM5Date).getTime() // pm is due
        const green = now + checker // seven days from now
        if (unit.engineHP >= 60 && dateTime) {
            if (dateTime > green) {
                return PMS.green
            } else if ((now < dateTime) && (dateTime < green)) {
                return PMS.yellow
            } else if (dateTime < now) {
                return PMS.red
            } else {
                return 'white'
            }
        } else if (unit.engineHP < 60) {
            return 'white'
        } else {
            return PMS.red
        }
    }
    // ----------------------------------------------------

    // Get total percentage from all areas units-----------
    PMS.totalUnitPercent = (objListWithePercentField) => {
        const activeUnits = objListWithePercentField.reduce((array, obj) => {
            if (obj.activeUnits !== 0) {
                return array.concat(obj.unitPercent / 100)
            } else {
                return array
            }
        }, [])
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

angular.module('CommonServices')
       .factory('PmDashService', [PmDashService])
