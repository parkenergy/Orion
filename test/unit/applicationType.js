var mongoose = require('mongoose');
var should = require('should');
var ApplicationType = require();

before(function(done) {
  require('../../app.js');
  mongoose.connection.on('connected', function() {
    ApplicationType.remove({}, done);
  });
});

after(function(done) {
  ApplicationType.remove({}, done);
});

describe("ApplicationType", function() {

  var id;
  describe("#createDoc()", function() {
    it('should create and return new document via promise', function(done) {
      ApplicationType.createDoc({})
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
      ApplicationType.updateDoc(id, {})
        .then()
    });
  });

  describe("#fetch()", function() {
    it('should fetch one document', function(done) {
      ApplicationType.fetch(id)
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