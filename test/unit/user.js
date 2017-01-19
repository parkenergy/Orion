 const User = require('../../lib/models/user');
 const mongoose = require('mongoose');
 const config = require('../../config');
 const should = require('should');
 const _ = require('lodash');
 const fixture = require('../fixture/user.json');

before(() => User.remove({}));

after(() => User.remove({}));

describe("User Units", () => {

  describe("#createDoc()", () => {
    let uid, user;
    it('Should create a user document', () => {
      return User.createDoc(fixture)
        .then(docs => {
          docs.should.be.length(1);
          docs[0].username.should.equal("TEST001");
          uid = docs[0]._id;
          user = docs[0];
        });
    });
  });

  describe("#updateDoc()", () => {
    it('Should update user document', () => {
      fixture.netsuiteId = '1234';
      return User.updateDoc('TEST001', fixture)
        .then(doc => {
          doc.netsuiteId.should.equal('1234');
        });
    });
  });

  describe("#fetch()", () => {
    it('Should fetch user document by username', () => {
      return User.fetch('TEST001')
        .then(doc => {
          doc.username.should.equal("TEST001");
          doc.netsuiteId.should.equal('1234');
        });
    });
    it('Should fetch user document by identity', () => User.fetch('me', fixture));
  });

  describe("#list()", function() {
    it("Should fetch list of users", () => {
      return User.list({})
        .then(docs => {
          docs.should.be.length(1);
          docs[0].username.should.equal("TEST001");
          docs[0].netsuiteId.should.equal('1234');
        });
    });
    it("Should fetch list of users for supervisor", () => {
      const options = {
        supervisor: 'TEST002'
      };

      return User.list(options)
        .then(docs => {
          docs.should.be.length(1);
          docs[0].username.should.equal("TEST001");
          docs[0].netsuiteId.should.equal('1234');
        });
    });
  });
});
