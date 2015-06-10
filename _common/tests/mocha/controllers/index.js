/* Includes
----------------------------------------------------------------------------- */
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;

var Controller = require('../../../controllers/index.js');

describe('DateHelper', function() {

  /* Basic Functionality
  --------------------------------------------------------------------------- */
  describe('Object Functionality', function () {
    it('should have a typeof "function"', function () {
      assert.equal(typeof Controller, 'function');
    });
    describe('new Controller(collection)', function(){
      it('should throw when collection is invalid', function () {
        expect(Controller).to.throw(Error);
        expect(function () { new Controller("badCollection");}).to.throw(Error);
        expect(function () { new Controller("Customers"); }).to.throw(Error);
        expect(function () { new Controller("Customer"); }).to.throw(Error);
      });
      it('should not throw when collection is valid', function () {
        expect(function () { new Controller("customers");}).to.not.throw(Error);
      });
    });
  });

  /* API Functionality
  --------------------------------------------------------------------------- */
  describe('#handler()', function(){
    var controller = new Controller("customers");
    expect(controller.handler).to.equal(undefined);
  });
  describe('#list()', function(){
    it('should be a function', function () {
      var controller = new Controller("customers");
      expect(typeof controller.list).to.equal('function');
    });
  });
  describe('#list()', function(){
    it('should be a function', function () {
      var controller = new Controller("customers");
      expect(typeof controller.list).to.equal('function');
    });
  });
});
