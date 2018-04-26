 const User = require('../../lib/models/user'),
  mongoose  = require('mongoose'),
  config    = require('../../config'),
  should    = require('should'),
  _         = require('lodash'),
  fixture   = require('../fixture/user.json')[0];

describe("User Units", () => {
  before(() => User.remove({}));

  after(() => User.remove({}));

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
      const fix = _.cloneDeep(fixture);
      fix.netsuiteId = '1234';
      return User.updateDoc('TEST001', fix)
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
          docs.should.be.Array().with.length(1);
          docs[0].username.should.equal("TEST001");
          docs[0].netsuiteId.should.equal('1234');
        });
    });
  });

  describe("#getTechsForSupervisor()", () => {
    it("should get 1 user for supervisor", () => User.getTechsForSupervisor("TEST002")
      .then(users => {
        should.exist(users);

        users.should.be.Array().with.length(1);
        users[0].should.equal("TEST001");
      })
    );
  });
});
