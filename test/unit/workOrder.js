var mongoose = require('mongoose');
var should = require('should');
var fixture = require('../fixture/workOrder.json');
var _ = require('_');
var WorkOrder = require();

before(function(done) {
  require('../../app.js');
  mongoose.connection.on('connected', function() {
    WorkOrder.remove({}, done);
  });
});

after(function(done) {
  WorkOrder.remove({}, done);
});

describe("WorkOrder", function() {

  var id;
  describe("#createDoc()", function() {
    it('should create and return new document via promise', function(done) {
      WorkOrder.createDoc(fixture)
        .then(function(doc) {
          doc.should.have.property("_id");
          doc.should.have.property('updated_date').as.a.Date();
          id = doc._id;
          done();
        })
        .catch(function(err){
          should.not.exist(err);
          done();
        });
    });
  });

  describe("#updateDoc()", function() {

    it('should update document', function(done) {
      var updated = _.clone(fixture);
      updated.header.unitNumber = 'TEST2';

      WorkOrder.updateDoc(id, updated)
        .then(function(doc) {
          doc.should.have.property('header');
          doc.header.should.have.property('unitNumber').as.a.String();
          doc.header.unitNumber.should.equal('TEST2');

          done();
        })
        .catch(function(err){
          should.not.exist(err);
          done();
        });
    });
  });

  describe("#fetch()", function() {
    it('should fetch one document', function(done) {
      WorkOrder.fetch(id)
        .then(function(doc) {
          doc.should.have.property("_id");
          doc.should.have.property('updated_date').as.a.Date();

          doc.should.have.property('header');
          doc.header.should.have.property('unitNumber').as.a.String();
          doc.header.unitNumber.should.equal('TEST2');
        })
        .catch(function(err) {
          should.not.exist(err);
          done()
        });
    });
  });

  describe("#list()", function() {});

  describe("#delete()", function() {});

});
