'user strict';

/*
* Helper object
* */
const User = require('../models/user'),
    WorkOrder = require('../models/workOrder');

const taskHelper = {
  startOfDay(a) {
    const From = new Date(a);
    return new Date(From.setHours(0, 0, 0, 0));
  },
  
  endOfDay(b) {
    const To = new Date(b);
    return new Date(To.setHours(23, 59, 59, 999));
  },
  
  getUsers() {
    return new Promise((resolve, reject) => {
      User.find({}).exec()
      .then(resolve)
      .catch(reject);
    });
  },
  
  updateUser(username, obj) {
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate({
        username,
      }, obj, {upsert: false}).exec()
      .then(resolve)
      .catch(reject);
    });
  },
  
  /**
   * Produce to - from dates for current week Sunday - Thursday
   * for WO querying
   * to set the day set num = #
   * Sunday = 7
   * Monday = 1
   * Tuesday = 2
   * Wednesday = 3
   * Thursday = 4 .. so on
   * @returns {{returnStart: *, returnEnd: *}}
   */
  getToFromDates(num, num2) {
    let returnStart;
    let returnEnd;
    const now = new Date();
    const toStart = new Date();
    const toEnd = new Date();
    const day = now.getDay();
    if (num2 !== false) {
      toStart.setDate(now.getDate() - num2);
    } else {
      toStart.setDate(now.getDate() - day);
    }
    returnStart = this.startOfDay(toStart);
    toEnd.setDate(now.getDate() + (num - day));
    returnEnd = this.endOfDay(toEnd);
    return {returnStart, returnEnd};
  },
  
  /**
   * Return the total work order time for a specific day
   * @param wo
   * @returns {Promise}
   */
  getTotalLaborCodeTime(wo) {
    return new Promise((resolve, reject) => {
      try {
        const Total = {
          hours: 0,
          minutes: 0,
        };
        const laborCodes = Object.keys(wo.laborCodes); // basic, engine, ... so on
        laborCodes.forEach((lb) => {
          const childLaborCodeKeys = Object.keys(wo.laborCodes[lb]); // basic: { safety... so on
          childLaborCodeKeys.forEach((chlb) => {
            if((chlb !== '$init' && chlb !== 'positiveAdj' && chlb !== 'negativeAdj' && chlb !== 'lunch')) {
              Total.hours += +wo.laborCodes[lb][chlb].hours;
              Total.minutes += +wo.laborCodes[lb][chlb].minutes;
            }
          });
        });
        Total.hours += Total.minutes / 60;
        resolve({Total});
      } catch(e) {
        return reject(e);
      }
    })
  },
  
  /**
   * Get work order hours for date time given. Should only be a single day
   * and returns it as an object with the tech and day ant total hours
   * for that day.
   * @param user
   * @param date -> Sunday... etc {times: {}, day: 'Sunday'} like this
   * @returns {Promise}
   */
  getUserWorkOrdersHours(user, date) {
    return new Promise((resolve, reject) => {
      WorkOrder.find({
        techId: user.username,
        timeStarted: {$gte: date.times.returnStart, $lte: date.times.returnEnd},
      }).exec()
      .then((wos) => {
        const promises = [];
        if (wos.length === 0) {
          promises.push(new Promise((res) => res({
            Total: {hours: 0, minutes: 0},
          })));
        } else {
          wos.forEach((wo) => {
            promises.push(this.getTotalLaborCodeTime(wo));
          });
        }
        return Promise.all(promises);
      })
      .then((objArr) => {
        if (objArr.length === 1) {
          resolve({user, Total: objArr[0].Total.hours, date: date});
        } else {
          const Total = objArr.reduce((a, b) => {
            return a + b.Total.hours;
          }, 0);
          resolve({user, Total, date: date});
        }
      })
      .catch(reject);
    });
  },
};

module.exports = taskHelper;