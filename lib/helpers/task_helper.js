'user strict';

/*
* Helper object
* */
const User = require('../models/user');

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
};

module.exports = taskHelper;
