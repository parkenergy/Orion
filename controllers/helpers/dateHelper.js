

var DateHelper = function () {
  this.now = new Date();
}

DateHelper.prototype.oneSecondAgo = function (fromDate) {
  var date = fromDate || new Date(this.now);
  date.setSeconds(date.getSeconds() - 1);
  return date;
};

DateHelper.prototype.oneMinuteAgo = function (fromDate) {
  var date = fromDate || new Date(this.now);
  date.setMinutes(date.getMinutes() - 1);
  return date;
};

DateHelper.prototype.oneHourAgo = function (fromDate) {
  var date = fromDate || new Date(this.now);
  date.setHours(date.getHours() - 1);
  return date;
};

DateHelper.prototype.oneDayAgo = function (fromDate) {
  var date = fromDate || new Date(this.now);
  date.setDate(date.getDate() - 1);
  return date;
};

DateHelper.prototype.oneWeekAgo = function (fromDate) {
  var date = fromDate || new Date(this.now);
  date.setDate(date.getDate() - 7);
  return date;
};

DateHelper.prototype.oneMonthAgo = function (fromDate) {
  var date = fromDate || new Date(this.now);
  date.setMonth(date.getMonth() - 1);
  return date;
};

DateHelper.prototype.oneYearAgo = function (fromDate) {
  var date = fromDate || new Date(this.now);
  date.setYear(date.getYear() - 1);
  return date;
};

DateHelper.prototype.beginningOfTime = function (fromDate) {
  return new Date(0); // which is 00:00 January 1, 1970 (UTC);
};

module.exports = DateHelper;
