var mongoose = require('mongoose');
var Promise = require('bluebird');
var should = require('should');
var _ = require('lodash');
var fixture = require('../fixture/workOrder.json');
var unitFixture = require('../fixture/unit.json');
var userFixture = require('../fixture/user.json');
var WorkOrder = require('../../lib/models/workOrder');
var User = require('../../lib/models/user');
var Unit = require('../../lib/models/unit');
var County = require('../../lib/models/county');
var State = require('../../lib/models/state');
var Area = require('../../lib/models/area');

before(function(done) {
    WorkOrder.remove({}, done);
});


after(function(done) {
  WorkOrder.remove({}, done);
});

describe("WorkOrder Units", function() {
  var unitId, userId, unitDoc, userDoc;

  before(function() {
    return User.remove({})
      .then(function() {
        return Unit.remove({})
      })
      .then(function() {
        return new User(userFixture).save()
      })
      .then(function(user) {
        userId = user._id;
        userDoc = user;

        return new Unit(unitFixture).save();
      })
      .then(function(unit) {
        unitId = unit._id;
        unitDoc = unit;
      });
  });

  after(function () {
    return User.remove({})
      .then(function () {
        return Unit.remove({});
      });
  });

  describe("#createDoc()", function() {
    it('should create and return new document', function() {
      var doc = _.cloneDeep(fixture);
      doc.technician = userDoc;
      doc.unit = unitDoc;

      return WorkOrder.createDoc(fixture)
        .then(function(doc) {
          should.exist(doc);
          doc.should.be.Array().with.length(1);
          doc[0].updated_at.should.be.a.Date();
          doc[0].should.have.property("_id");

          doc[0].header.should.have.property('unitNumber');
          doc[0].header.unitNumber.should.be.a.String();
          doc[0].header.unitNumber.should.equal('TEST1');
          should.exist(doc[0].unit);
          should.exist(doc[0].technician);
          doc[0].unit.toString().should.equal(unitId.toString());
          doc[0].technician.toString().should.equal(userId.toString());
        });
    }).slow(50);
  });

  describe("#updateDoc()", function() {

    var id;
    before(function() {
      return WorkOrder.remove({})
        .then(function() {
          return WorkOrder.createDoc(fixture);
        }).then(function(docs) {
          id = docs[0]._id;
        });
    });

    it('should update document', function() {
      var updated = _.cloneDeep(fixture);
      updated.header.unitNumber = 'TEST2';

      return WorkOrder.updateDoc(id, updated, userFixture)
        .then(function(doc) {

          doc.should.have.property('header');
          doc.should.have.property("_id");
          doc.header.should.have.property('unitNumber');
          doc.header.unitNumber.should.be.a.String();
          doc.header.unitNumber.should.equal('TEST2');
        });
    }).slow(100);
  });

  describe("#fetch()", function() {

    var id;
    before(function() {
      return WorkOrder.remove({})
        .then(function() {
          return WorkOrder.createDoc(fixture);
        }).then(function(docs) {
          id = docs[0]._id;
        });
    });

    it('should fetch one document', function() {
      return WorkOrder.fetch(id)
        .then(function(doc) {
          doc.should.have.property("_id");

          doc.should.have.property('header');
          doc.header.should.have.property('unitNumber');
          doc.header.unitNumber.should.be.a.String();
          doc.header.unitNumber.should.equal('TEST1');
        });
    }).slow(30);
  });

  describe("#list()", function() {
    before(function() {
      return WorkOrder.remove({}, function (err) {
        if (err) throw err;

        var unitDocs = _.range(25).map(function () {
          var f = _.cloneDeep(fixture);
          f.unitNumber = "123TEST";
          return f;
        });
        var techDocs = _.range(25).map(function () {
          var f = _.cloneDeep(fixture);
          f.techId = "TEST003";

          return f;
        });
        var locDocs = _.range(25).map(function () {
          var f = _.cloneDeep(fixture);
          f.header.leaseName = "TESTLOC";

          return f;
        });
        var custDocs = _.range(25).map(function () {
          var f = _.cloneDeep(fixture);
          f.header.customerName = "TESTCUST";

          return f;
        });

        var docs = _.flatten([unitDocs, techDocs, locDocs, custDocs]);

        return WorkOrder.insertMany(docs)
          .then(function () {
            var newUser = _.clone(userFixture);

            newUser.firstName = "Find";
            newUser.lastName = "Me";
            newUser.username = "TEST003";

            return new User(newUser).save();
          });
      });
    });

    it("Should list 4 pages of 25 results", function() {
      var options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
        supervised: ['TEST001', 'TEST003'],
        loc:   null,
        cust:  null,
        limit: 25,
        skip:  0
      };

      return WorkOrder.list(options)
        .then(function(docs) {
            docs.should.be.an.Array();
            docs.should.have.length(25);
            options.skip+=25;
          return WorkOrder.list(options);
        }).then(function(docs) {
          docs.should.be.an.Array();
          docs.should.have.length(25);
          options.skip+=25;

          return WorkOrder.list(options);
        }).then(function(docs) {
          docs.should.be.an.Array();
          docs.should.have.length(25);

          options.skip+=25;

          return WorkOrder.list(options);
        }).then(function(docs) {
          docs.should.be.an.Array();
          docs.should.have.length(25);


          return null;
        });
    }).slow(500);

    it("Should list workorders with specific unitNumber", function() {
      var options = {
        sort:  '-updated_at',
        unit:  '123TEST',
        tech:  null,
        supervised: ['TEST001', 'TEST003'],
        loc:   null,
        cust:  null,
        limit: 25,
        skip:  0
      };

      return WorkOrder.list(options)
        .then(function(docs) {
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(function(doc) {
            doc.unitNumber.should.equal("123TEST");
          });
        });
    }).slow(200);

    it("Should list workorders with specific technician name", function() {
      var options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  "find me",
        supervised: ['TEST001', 'TEST003'],
        loc:   null,
        cust:  null,
        limit: 25,
        skip:  0
      };

      return WorkOrder.list(options)
        .then(function(docs) {
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(function(doc) {
            doc.techId.should.equal("TEST003");
          });
        });
    }).slow(200);

    it("Should list workorders with specific leaseName", function() {
      var options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
        supervised: ['TEST001', 'TEST003'],
        loc:   "TESTLOC",
        cust:  null,
        limit: 100,
        skip:  0
      };

      return WorkOrder.list(options)
        .then(function(docs) {
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(function(doc) {
            doc.header.leaseName.should.equal("TESTLOC");
          });
        });
    }).slow(200);

    it("Should list workorders with specific customerName", function() {
      var options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
        supervised: ['TEST001', 'TEST003'],
        loc:   null,
        cust:  "TESTCUST",
        limit: 100,
        skip:  0
      };

      return WorkOrder.list(options)
        .then(function(docs) {
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(function(doc) {
            doc.header.customerName.should.equal("TESTCUST");
          });
        });
    }).slow(200);
  });

  describe("#delete()", function() {
    var id;
    before(function() {
      return WorkOrder.remove({}, function(err) {
        if(err) throw err;

        return WorkOrder.createDoc(fixture)
          .then(function(docs) {
            id = docs[0]._id;
            return docs;
          });
      });
    });

    it("Should remove workorder", function() {
      return WorkOrder.delete(id);
    });
  });
});
