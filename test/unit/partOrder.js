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

before((done) => {
  PartOrder.remove({}, done);
});

after((done) => {
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
  }); /* End of 'describe' 'before' PartOrder Unit Tests */
  
  after(() => {
    return User.remove({})
      .then(() => {
        return Part.remove({});
      });
  }); /* End of 'describe' 'after' PartOrder Unit Tests */
  
  describe("#createDoc()", () => {
    let manualPartFixture = _.cloneDeep(fixture);
    
    it("Should create a non manual partOrder document", () => {
      return PartOrder.createDoc(fixture)
        .then((doc) => {
          should.exist(doc);
          doc.should.not.be.Array();
          doc.timeCreated.should.be.a.Date();
          should.exist(doc.timeSubmitted);
          doc.timeSubmitted.should.be.a.Date();
          doc.should.have.property("_id");
          
          doc.part.should.be.an.instanceOf(Object);
          doc.part.should.have.property('isManual');
          doc.part.MPN.should.equal('111000/TEST');
        });
    }); /* End of 'it' #createDoc() create new non manual doc */
  
    it("Should create a manual partOrder document", () => {
      manualPartFixture.partNSID = 0;
      manualPartFixture.part.isManual = true;
      
      return PartOrder.createDoc(manualPartFixture)
        .then((doc) => {
          should.exist(doc);
          doc.should.not.be.Array();
          doc.timeCreated.should.be.a.Date();
          should.exist(doc.timeSubmitted);
          doc.timeSubmitted.should.be.a.Date();
          doc.should.have.property("_id");

          doc.part.should.be.an.instanceOf(Object);
          doc.part.should.have.property('isManual');
          doc.part.MPN.should.equal('111-000');
          doc.part.isManual.should.equal(true);
        });
    }); /* End of 'it' #createDoc() create new manual doc */
  }); /* End of 'describe' #createDoc() */
  
  describe("#updateDoc()", () => {
    
  }); /* End of 'describe' #updateDoc() */
  
}); /* End of 'describe' PartOrder Unit Tests */
