/* Includes
----------------------------------------------------------------------------- */
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;

var DateHelper = require('../../../helpers/DateHelper');
var dateHelper = new DateHelper();

describe('DateHelper', function() {

  /* Basic Functionality
  --------------------------------------------------------------------------- */
  describe('Object Functionality', function () {
    it('should have a typeof "function"', function () {
      assert.equal(typeof DateHelper, 'function');
    });

    it('should create a new object when called', function () {
      assert.equal(typeof new DateHelper(), 'object');
    });

    it('should create an instance of itself', function () {
      expect(new DateHelper()).to.be.instanceof(DateHelper);
    });
  });

  /* API Functionality
  --------------------------------------------------------------------------- */
  describe('#oneSecondAgo(fromDate)', function(){
    it('should return one second prior to now for null argument', function () {
      var dateHelper = new DateHelper();
      var result = dateHelper.oneSecondAgo();
      dateHelper.now.setSeconds(dateHelper.now.getSeconds()-1);
      expect(result).to.not.equal(dateHelper.now); // objects not equal
      expect(result).to.eql(dateHelper.now); // fields are equal
    });
    it('should return one second prior to provided date argument ', function () {
      var date = new Date(0);
      var dateHelper = new DateHelper();
      var result = dateHelper.oneSecondAgo(date);
      date.setSeconds(date.getSeconds()-1);
      expect(result).to.not.equal(date); // objects not equal
      expect(result).to.eql(date); // fields are equal
    });
  });

  describe('#oneMinuteAgo(fromDate)', function(){
    it('should return one minute prior to now for null argument', function () {
      var dateHelper = new DateHelper();
      var result = dateHelper.oneMinuteAgo();
      dateHelper.now.setMinutes(dateHelper.now.getMinutes()-1);
      expect(result).to.not.equal(dateHelper.now); // objects not equal
      expect(result).to.eql(dateHelper.now); // fields are equal
    });
    it('should return one minute prior to provided date argument ', function () {
      var date = new Date(0);
      var dateHelper = new DateHelper();
      var result = dateHelper.oneMinuteAgo(date);
      date.setMinutes(date.getMinutes()-1);
      expect(result).to.not.equal(date); // objects not equal
      expect(result).to.eql(date); // fields are equal
    });
  });

  describe('#oneHourAgo(fromDate)', function(){
    it('should return one hour prior to now for null argument', function () {
      var dateHelper = new DateHelper();
      var result = dateHelper.oneHourAgo();
      dateHelper.now.setHours(dateHelper.now.getHours()-1);
      expect(result).to.not.equal(dateHelper.now); // objects not equal
      expect(result).to.eql(dateHelper.now); // fields are equal
    });
    it('should return one hour prior to provided date argument ', function () {
      var date = new Date(0);
      var dateHelper = new DateHelper();
      var result = dateHelper.oneHourAgo(date);
      date.setHours(date.getHours()-1);
      expect(result).to.not.equal(date); // objects not equal
      expect(result).to.eql(date); // fields are equal
    });
  });

  describe('#oneDayAgo(fromDate)', function(){
    it('should return one day prior to now for null argument', function () {
      var dateHelper = new DateHelper();
      var result = dateHelper.oneDayAgo();
      dateHelper.now.setDate(dateHelper.now.getDate()-1);
      expect(result).to.not.equal(dateHelper.now); // objects not equal
      expect(result).to.eql(dateHelper.now); // fields are equal
    });
    it('should return one day prior to provided date argument ', function () {
      var date = new Date(0);
      var dateHelper = new DateHelper();
      var result = dateHelper.oneDayAgo(date);
      date.setDate(date.getDate()-1);
      expect(result).to.not.equal(date); // objects not equal
      expect(result).to.eql(date); // fields are equal
    });
  });

  describe('#oneWeekAgo(fromDate)', function(){
    it('should return one week prior to now for null argument', function () {
      var dateHelper = new DateHelper();
      var result = dateHelper.oneWeekAgo();
      dateHelper.now.setDate(dateHelper.now.getDate()-7);
      expect(result).to.not.equal(dateHelper.now); // objects not equal
      expect(result).to.eql(dateHelper.now); // fields are equal
    });
    it('should return one week prior to provided date argument ', function () {
      var date = new Date(0);
      var dateHelper = new DateHelper();
      var result = dateHelper.oneWeekAgo(date);
      date.setDate(date.getDate()-7);
      expect(result).to.not.equal(date); // objects not equal
      expect(result).to.eql(date); // fields are equal
    });
  });

  describe('#oneMonthAgo(fromDate)', function(){
    it('should return one month prior to now for null argument', function () {
      var dateHelper = new DateHelper();
      var result = dateHelper.oneMonthAgo();
      dateHelper.now.setMonth(dateHelper.now.getMonth()-1);
      expect(result).to.not.equal(dateHelper.now); // objects not equal
      expect(result).to.eql(dateHelper.now); // fields are equal
    });
    it('should return one month prior to provided date argument ', function () {
      var date = new Date(0);
      var dateHelper = new DateHelper();
      var result = dateHelper.oneMonthAgo(date);
      date.setMonth(date.getMonth()-1);
      expect(result).to.not.equal(date); // objects not equal
      expect(result).to.eql(date); // fields are equal
    });
  });

  describe('#oneYearAgo(fromDate)', function(){
    it('should return one year prior to now for null argument', function () {
      var dateHelper = new DateHelper();
      var result = dateHelper.oneYearAgo();
      dateHelper.now.setYear(dateHelper.now.getFullYear()-1);
      expect(result).to.not.equal(dateHelper.now); // objects not equal
      expect(result).to.eql(dateHelper.now); // fields are equal
    });
    it('should return one year prior to provided date argument ', function () {
      var date = new Date(0);
      var dateHelper = new DateHelper();
      var result = dateHelper.oneYearAgo(date);
      date.setYear(date.getFullYear()-1);
      expect(result).to.not.equal(date); // objects not equal
      expect(result).to.eql(date); // fields are equal
    });
  });

  describe('#beginningOfTime()', function(){
    it('should return the earliest (non-negative) time', function () {
      var dateHelper = new DateHelper();
      var result = dateHelper.beginningOfTime();
      var begOfTime = new Date(0);
      expect(result).to.not.equal(begOfTime); // objects not equal
      expect(result).to.eql(begOfTime); // fields are equal
    });
  });

  describe('#timeDifferenceMilliseconds(date1, date2)', function() {
    it('should return ms time diff between 2 provided dates', function () {
      var date1 = new Date();
      var difference = 1000;
      var date2 = new Date(date1.getTime() + difference);
      var dateHelper = new DateHelper();
      var result = dateHelper.timeDifferenceMilliseconds(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return ms time diff between param1 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1000;
      var date1 = new Date(dateHelper.now.getTime() + difference);
      var result = dateHelper.timeDifferenceMilliseconds(date1, null);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return ms time diff between param2 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1000;
      var date2 = new Date(dateHelper.now.getTime() + difference);
      var result = dateHelper.timeDifferenceMilliseconds(null, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return no time diff between null params', function () {
      var dateHelper = new DateHelper();
      var difference = 0;
      var result = dateHelper.timeDifferenceMilliseconds(null, null);
      expect(result).to.equal(difference);
    });
  });

  describe('#timeDifferenceSeconds(date1, date2)', function() {
    it('should return sec time diff between 2 provided dates', function () {
      var difference = 1000;
      var date1 = new Date();
      var date2 = new Date(date1);
      date2.setSeconds(date2.getSeconds() + difference);
      var dateHelper = new DateHelper();
      var result = dateHelper.timeDifferenceSeconds(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return sec time diff between date1 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1000;
      var date1 = new Date(dateHelper.now);
      var date2 = null;
      date1.setSeconds(date1.getSeconds() + difference);
      var result = dateHelper.timeDifferenceSeconds(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return sec time diff between date2 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1000;
      var date1 = null;
      var date2 = new Date(dateHelper.now);
      date2.setSeconds(date2.getSeconds() + difference);
      var result = dateHelper.timeDifferenceSeconds(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return no time diff between null params', function () {
      var dateHelper = new DateHelper();
      var difference = 0;
      var result = dateHelper.timeDifferenceSeconds(null, null);
      expect(result).to.equal(difference);
    });
  });

  describe('#timeDifferenceMinutes(date1, date2)', function() {
    it('should return min time diff between 2 provided dates', function () {
      var difference = 1000;
      var date1 = new Date();
      var date2 = new Date(date1);
      date2.setMinutes(date2.getMinutes() + difference);
      var dateHelper = new DateHelper();
      var result = dateHelper.timeDifferenceMinutes(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return min time diff between date1 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1000;
      var date1 = new Date(dateHelper.now);
      var date2 = null;
      date1.setMinutes(date1.getMinutes() + difference);
      var result = dateHelper.timeDifferenceMinutes(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return min time diff between date2 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1000;
      var date1 = null;
      var date2 = new Date(dateHelper.now);
      date2.setMinutes(date2.getMinutes() + difference);
      var result = dateHelper.timeDifferenceMinutes(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return no time diff between null params', function () {
      var dateHelper = new DateHelper();
      var difference = 0;
      var result = dateHelper.timeDifferenceMinutes(null, null);
      expect(result).to.equal(difference);
    });
  });

  // TODO: Figure out why these test are erroring out

  // describe('#timeDifferenceHours(date1, date2)', function() {
  //   it('should return hour time diff between 2 provided dates', function () {
  //     var difference = 1000;
  //     var date1 = new Date();
  //     var date2 = new Date(date1);
  //     date2.setHours(date2.getHours() + difference);
  //     var dateHelper = new DateHelper();
  //     var result = dateHelper.timeDifferenceHours(date1, date2);
  //     expect(result).to.be.at.least(0);
  //     expect(result).to.equal(difference);
  //   });
  //   it('should return hour time diff between date1 and now', function () {
  //     var dateHelper = new DateHelper();
  //     var difference = 1000;
  //     var date1 = new Date(dateHelper.now);
  //     var date2 = null;
  //     date1.setHours(date1.getHours() + difference);
  //     var result = dateHelper.timeDifferenceHours(date1, date2);
  //     expect(result).to.be.at.least(0);
  //     expect(result).to.equal(difference);
  //   });
  //   it('should return hour time diff between date2 and now', function () {
  //     var dateHelper = new DateHelper();
  //     var difference = 1000;
  //     var date1 = null;
  //     var date2 = new Date(dateHelper.now);
  //     date2.setHours(date2.getHours() + difference);
  //     var result = dateHelper.timeDifferenceHours(date1, date2);
  //     expect(result).to.be.at.least(0);
  //     expect(result).to.equal(difference);
  //   });
  //   it('should return no time diff between null params', function () {
  //     var dateHelper = new DateHelper();
  //     var difference = 0;
  //     var result = dateHelper.timeDifferenceHours(null, null);
  //     expect(result).to.equal(difference);
  //   });
  // });

  describe('#timeDifferenceDays(date1, date2)', function() {
    it('should return day time diff between 2 provided dates', function () {
      var difference = 5;
      var date1 = new Date();
      console.log(date1);
      var date2 = new Date(date1);
      console.log(date2);
      date2.setDate(date2.getDate() + difference);
      console.log(date2);
      var dateHelper = new DateHelper();
      var result = dateHelper.timeDifferenceDays(date1, date2);
      console.log(result);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return day time diff between date1 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 5;
      var date1 = new Date(dateHelper.now);
      var date2 = null;
      date1.setDate(date1.getDate() + difference);
      var result = dateHelper.timeDifferenceDays(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return day time diff between date2 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 5;
      var date1 = null;
      var date2 = new Date(dateHelper.now);
      date2.setDate(date2.getDate() + difference);
      var result = dateHelper.timeDifferenceDays(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return no time diff between null params', function () {
      var dateHelper = new DateHelper();
      var difference = 0;
      var result = dateHelper.timeDifferenceDays(null, null);
      expect(result).to.equal(difference);
    });
  });

  describe('#timeDifferenceWeeks(date1, date2)', function() {
    it('should return week time diff between 2 provided dates', function () {
      var difference = 1;
      var date1 = new Date();
      var date2 = new Date(date1);
      date2.setDate(date2.getDate() + difference*7);
      var dateHelper = new DateHelper();
      var result = dateHelper.timeDifferenceWeeks(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return week time diff between date1 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1;
      var date1 = new Date(dateHelper.now);
      var date2 = null;
      date1.setDate(date1.getDate() + difference*7);
      var result = dateHelper.timeDifferenceWeeks(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return week time diff between date2 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1;
      var date1 = null;
      var date2 = new Date(dateHelper.now);
      date2.setDate(date2.getDate() + difference*7);
      var result = dateHelper.timeDifferenceWeeks(date1, date2);
      expect(result).to.be.at.least(0);
      expect(result).to.equal(difference);
    });
    it('should return no time diff between null params', function () {
      var dateHelper = new DateHelper();
      var difference = 0;
      var result = dateHelper.timeDifferenceDays(null, null);
      expect(result).to.equal(difference);
    });
  });

  describe('#timeDifferenceYears(date1, date2)', function() {
    it('should return year time diff between 2 provided dates', function () {
      var difference = 1;
      var date1 = new Date();
      var date2 = new Date(date1);
      date2.setYear(date2.getFullYear() + difference);
      var dateHelper = new DateHelper();
      var result = dateHelper.timeDifferenceYears(date1, date2);
      expect(result).to.be.at.least(0);
      expect(Math.floor(result)).to.equal(difference);
    });
    it('should return year time diff between date1 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1;
      var date1 = new Date(dateHelper.now);
      var date2 = null;
      date1.setYear(date1.getFullYear() + difference);
      var result = dateHelper.timeDifferenceYears(date1, date2);
      expect(result).to.be.at.least(0);
      expect(Math.floor(result)).to.equal(difference);
    });
    it('should return year time diff between date2 and now', function () {
      var dateHelper = new DateHelper();
      var difference = 1;
      var date1 = null;
      var date2 = new Date(dateHelper.now);
      date2.setYear(date2.getFullYear() + difference);
      var result = dateHelper.timeDifferenceYears(date1, date2);
      expect(result).to.be.at.least(0);
      expect(Math.floor(result)).to.equal(difference);
    });
    it('should return no time diff between null params', function () {
      var dateHelper = new DateHelper();
      var difference = 0;
      var result = dateHelper.timeDifferenceYears(null, null);
      expect(Math.floor(result)).to.equal(difference);
    });
  });

});
