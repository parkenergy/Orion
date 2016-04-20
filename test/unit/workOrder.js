var mongoose = require('mongoose');
var config = require('../../config');
var should = require('should');
var _ = require('lodash');
var fixture = require('../fixture/workOrder.json');
var WorkOrder = require('../../lib/models/workOrder');
var Unit = require('../../lib/models/unit');

before(function(done) {
  mongoose.connect(config.mongodb);
  mongoose.connection.on('connected', function() {
    WorkOrder.remove({}, done);
  });
});

after(function(done) {
  WorkOrder.remove({}, done);
});

describe("WorkOrder", function() {

  describe("#createDoc()", function() {
    it('should create and return new document via promise', function() {
      return WorkOrder.createDoc(fixture)
        .then(function(doc) {
          should.exist(doc);
          doc.should.be.Array().with.length(1);
          doc[0].updated_at.should.be.a.Date();
          doc[0].should.have.property("_id");

          doc[0].header.should.have.property('unitNumber');
          doc[0].header.unitNumber.should.be.a.String();
          doc[0].header.unitNumber.should.equal('TEST1');
        });
    });
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

      return WorkOrder.updateDoc(id, updated)
        .then(function(doc) {

          doc.should.have.property('header');
          doc.should.have.property("_id");
          doc.header.should.have.property('unitNumber');
          doc.header.unitNumber.should.be.a.String();
          doc.header.unitNumber.should.equal('TEST2');
        });
    });
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
    });
  });

  describe("#list()", function() {
    before(function(done) {
      WorkOrder.remove({}, function (err) {
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

        WorkOrder.createDoc(docs)
          .then(function () {
            done();
          })
          .catch(done);
      });
    });

    it("Should list 4 pages of 25 results", function() {
      var options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
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
          options.skip+=25;

          return WorkOrder.list(options);
        });
    });

    it("Should list workorders with specific unitNumber", function() {
      var options = {
        sort:  '-updated_at',
        unit:  '123TEST',
        tech:  null,
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
    });
    it("Should list workorders with specific techId", function() {
      var options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  "TEST003",
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
    });
    it("Should list workorders with specific leaseName", function() {
      var options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
        loc:   "TESTLOC",
        cust:  null,
        limit: 25,
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
    });
    it("Should list workorders with specific customerName", function() {
      var options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
        loc:   null,
        cust:  "TESTCUST",
        limit: 50,
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
    });
  });

  describe("#delete()", function() {
    var id;
    before(function(done) {
      WorkOrder.remove({}, function(err) {
        if(err) throw err;

        WorkOrder.createDoc(fixture)
          .then(function(docs) {
            id = docs[0]._id;
            done();
          })
          .catch(done);
      });
    });

    it("Should remove workorder", function() {
      return WorkOrder.delete(id);
    });
  });

});
