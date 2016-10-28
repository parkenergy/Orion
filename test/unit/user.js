var User = require('../../lib/models/user');
var mongoose = require('mongoose');
var config = require('../../config');
var should = require('should');
var _ = require('lodash');
var fixture = require('../fixture/user.json');

before(function(done) {
  User.remove({}, done);
});

after(function(done) {
  User.remove({}, done);
});

describe("User", function () {

  describe("#createDoc()", function () {
    var uid, user;
    it('Should create a user document', function () {
      return User.createDoc(fixture)
        .then(function (docs) {
          docs.should.be.length(1);
          docs[0].username.should.equal("TEST001");
          uid = docs[0]._id;
          user = docs[0];
        });
    });
  });

  describe("#updateDoc()", function () {
    it('Should update user document', function () {
      fixture.netsuiteId = '1234';
      return User.updateDoc('TEST001', fixture)
        .then(function (doc) {
          doc.netsuiteId.should.equal('1234');
        });
    });
  });

  describe("#fetch()", function () {
    it('Should fetch user document by username', function () {
      return User.fetch('TEST001')
        .then(function (doc) {
          doc.username.should.equal("TEST001");
          doc.netsuiteId.should.equal('1234');
        });
    });
    it('Should fetch user document by identity', function () {
      return User.fetch('me', fixture);
    });
  });

  describe("#list()", function() {
    it("Should fetch list of users", function () {
      return User.list({})
        .then(function (docs) {
          docs.should.be.length(1);
          docs[0].username.should.equal("TEST001");
          docs[0].netsuiteId.should.equal('1234');
        });
    });
    it("Should fetch list of users for supervisor", function () {
      var options = {
        supervisor: 'TEST002'
      };

      return User.list(options)
        .then(function (docs) {
          docs.should.be.length(1);
          docs[0].username.should.equal("TEST001");
          docs[0].netsuiteId.should.equal('1234');
        });
    });
  });
});
