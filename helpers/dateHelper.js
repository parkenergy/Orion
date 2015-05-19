/* Declaration
----------------------------------------------------------------------------- */
var DateHelper = function () {
  this.now = new Date();
}

/* Functions
----------------------------------------------------------------------------- */
DateHelper.prototype.oneSecondAgo = function (fromDate) {
  var date = (fromDate instanceof Date) ? new Date(fromDate) : new Date(this.now);
  date.setSeconds(date.getSeconds() - 1);
  return date;
};

DateHelper.prototype.oneMinuteAgo = function (fromDate) {
  var date = (fromDate instanceof Date) ? new Date(fromDate) : new Date(this.now);
  date.setMinutes(date.getMinutes() - 1);
  return date;
};

DateHelper.prototype.oneHourAgo = function (fromDate) {
  var date = (fromDate instanceof Date) ? new Date(fromDate) : new Date(this.now);
  date.setHours(date.getHours() - 1);
  return date;
};

DateHelper.prototype.oneDayAgo = function (fromDate) {
  var date = (fromDate instanceof Date) ? new Date(fromDate) : new Date(this.now);
  date.setDate(date.getDate() - 1);
  return date;
};

DateHelper.prototype.oneWeekAgo = function (fromDate) {
  var date = (fromDate instanceof Date) ? new Date(fromDate) : new Date(this.now);
  date.setDate(date.getDate() - 7);
  return date;
};

DateHelper.prototype.oneMonthAgo = function (fromDate) {
  var date = (fromDate instanceof Date) ? new Date(fromDate) : new Date(this.now);
  date.setMonth(date.getMonth() - 1);
  return date;
};

DateHelper.prototype.oneYearAgo = function (fromDate) {
  var date = (fromDate instanceof Date) ? new Date(fromDate) : new Date(this.now);
  date.setYear(date.getYear() - 1);
  return date;
};

DateHelper.prototype.beginningOfTime = function () {
  return new Date(0); // which is 00:00 January 1, 1970 (UTC);
};

DateHelper.prototype.timeDifferenceMilliseconds = function (date1, date2) {
  var date1 = (date1 instanceof Date) ? date1 : new Date(this.now);
  var date2 = (date2 instanceof Date) ? date2 : new Date(this.now);
  return Math.abs(date1.getTime() - date2.getTime());
};

DateHelper.prototype.timeDifferenceSeconds = function (date1, date2) {
  var ms = this.timeDifferenceMilliseconds(date1, date2);
  return (ms / 1000);
};

DateHelper.prototype.timeDifferenceMinutes = function (date1, date2) {
  var seconds = this.timeDifferenceSeconds(date1, date2);
  return (seconds / 60);
};

DateHelper.prototype.timeDifferenceHours = function (date1, date2) {
  var minutes = this.timeDifferenceMinutes(date1, date2);
  return (minutes / 60);
};

DateHelper.prototype.timeDifferenceDays = function (date1, date2) {
  var hours = this.timeDifferenceHours(date1, date2);
  return (hours / 24);
};

DateHelper.prototype.timeDifferenceWeeks = function (date1, date2) {
  var days = this.timeDifferenceDays(date1, date2);
  return (days / 7);
};

DateHelper.prototype.timeDifferenceYears = function (date1, date2) {
  var weeks = this.timeDifferenceWeeks(date1, date2);
  return (weeks / 52);
};

/* Exports
----------------------------------------------------------------------------- */
module.exports = DateHelper;
