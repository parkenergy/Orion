var mongoose = require('mongoose');
var should = require('should');
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
      WorkOrder.createDoc({})
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
      WorkOrder.updateDoc(id, {})
        .then()
    });
  });

  describe("#fetch()", function() {
    it('should fetch one document', function(done) {
      WorkOrder.fetch(id)
        .then(function(doc) {
          doc.should.have.property("_id");
          doc.should.have.property('updated_date').as.a.Date();
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