/**
 *            partOrder
 *
 * Created by marcuswhelan on 1/18/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
const PartOrder   = require('../../lib/models/partOrder');
const Part        = require('../../lib/models/part');
const User        = require('../../lib/models/user');
const mongoose    = require('mongoose');
const config      = require('../../config');
const Promise     = require('bluebird');
const should      = require('should');
const _           = require('lodash');
const fixture     = require('../fixture/partOrder.json');
const userFixture = require('../fixture/user.json');
const partFixture = require('../fixture/part.json');

before(done => {
  PartOrder.remove({}, done);
});

after(done => {
  PartOrder.remove({}, done);
});

describe("PartOrder Units", () => {
  let userId, userDoc, partId, partDoc;
  
  before(() => {
    return User.remove({})
      .then(() => {
        return Part.remove({});
      })
      .then(() => {
        return new User(userFixture).save();
      })
      .then((user) => {
        userId = user._id;
        userDoc = user;
        
        return new Part(partFixture).save();
      })
      .then((part) => {
        partId = part._id;
        partDoc = part;
      });
  });
  
  after(() => {
    return User.remove({})
      .then(() => {
        return Part.remove({});
      });
  });
  
  describe("#createDoc()", () => {
    let manualPartFixture = _.cloneDeep(fixture);
    
    it("Should create a non manual partOrder document", () => {
      return PartOrder.createDoc(fixture)
        .then(doc => {
          should.exist(doc);
          doc.should.not.be.Array();
          doc.timeCreated.should.be.a.Date();
          should.exist(doc.timeSubmitted);
          doc.timeSubmitted.should.be.a.Date();
          doc.should.have.property("_id");
          should.exist(doc.orderId);
          doc.orderId.should.be.a.String();
          
          doc.part.should.be.an.instanceOf(Object);
          doc.part.should.have.property('isManual');
          doc.part.MPN.should.equal('111000/TEST');
        });
    });
  
    it("Should create a manual partOrder document", () => {
      manualPartFixture.partNSID = 0;
      manualPartFixture.part.isManual = true;
      
      return PartOrder.createDoc(manualPartFixture)
        .then(doc => {
          should.exist(doc);
          doc.should.not.be.Array();
          doc.timeCreated.should.be.a.Date();
          should.exist(doc.timeSubmitted);
          doc.timeSubmitted.should.be.a.Date();
          doc.should.have.property("_id");
          should.exist(doc.orderId);
          doc.orderId.should.be.a.String();
          
          doc.part.should.be.an.instanceOf(Object);
          doc.part.should.have.property('isManual');
          doc.part.MPN.should.equal('111-000');
          doc.part.isManual.should.equal(true);
        });
    });
  }); /* End of 'describe' #createDoc() */
  
  describe("#updateDoc()", () => {
    let orderId, updated_at, updatingDoc;
    
    beforeEach(() => {
      return PartOrder.remove({})
        .then(() => {
          return PartOrder.createDoc(fixture);
        })
        .then(doc => {
          updatingDoc = _.cloneDeep(doc);
          updatingDoc.trackingNumber = '1234-5678-910';
          updatingDoc.carrier = 'UPS';
          updatingDoc.approvedBy = 'TEST001';
          orderId = doc.orderId;
          updated_at = doc.updated_at;
        })
    });
    
    afterEach(() => {
      return PartOrder.remove({});
    });
    
    it("Should set timeShipped on status change to 'shipped'", () => {
      updatingDoc.status = 'shipped';
      
      return PartOrder.updateDoc(orderId, updatingDoc)
        .then(doc => {
          should.exist(doc);
          doc.should.not.be.Array();
          doc.timeShipped.should.be.a.Date();
          
          doc.updated_at.should.not.eql(updated_at);
          doc.trackingNumber.should.be.equal('1234-5678-910');
        });
    });
    
    it("Should set many fields on status change to 'completed'", () => {
      updatingDoc.status = 'shipped';
      
      return PartOrder.updateDoc(orderId, updatingDoc)
        .then(doc => {
          doc.status = 'completed';
          doc.completedBy = 'TEST002';
          updated_at = doc.updated_at;
          return PartOrder.updateDoc(orderId, doc);
        })
        .then(doc => {
          should.exist(doc);
          doc.timeComplete.should.be.a.Date();
          
          doc.updated_at.should.not.eql(updated_at);
          doc.completedBy.should.be.equal('TEST002');
          doc.carrier.should.be.equal('UPS');
          doc.done.should.be.equal(true);
        })
    });
  
    it("Should set many fields on status change to 'canceled'", () => {
      updatingDoc.status = 'shipped';
    
      return PartOrder.updateDoc(orderId, updatingDoc)
        .then(doc => {
          doc.status = 'canceled';
          doc.completedBy = 'TEST002';
          doc.comment = 'TestCancel';
          doc.source = 'Orion';
          updated_at = doc.updated_at;
          return PartOrder.updateDoc(orderId, doc);
        })
        .then(doc => {
          should.exist(doc);
          doc.timeComplete.should.be.a.Date();
          
          doc.updated_at.should.not.eql(updated_at);
          doc.comment.should.be.equal('TestCancel');
          doc.approvedBy.should.be.equal('TEST001');
          doc.done.should.be.equal(true);
        })
    });
    
  }); /* End of 'describe' #updateDoc() */
  
}); /* End of 'describe' PartOrder Unit Tests */
