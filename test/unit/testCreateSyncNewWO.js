/*
const mongoose      = require('mongoose'),
      Promise       = require('bluebird'),
      should        = require('should'),
      _             = require('lodash'),
      workorder     = require('../fixture/testWO.json'),
      unitFixture   = require('../fixture/testWOUnit.json'),
      userFixture   = require('../fixture/testWOuser.json'),
      stateFixtrue  = require('../fixture/testWOState.json'),
      countyFixture = require('../fixture/testWOCounty.json'),
      WorkOrder     = require('../../lib/models/workOrder'),
      User          = require('../../lib/models/user'),
      County        = require('../../lib/models/county'),
      State         = require('../../lib/models/state'),
      Unit          = require('../../lib/models/unit');

before(() => WorkOrder.remove({}));

after(() => WorkOrder.remove({}));

describe("Workorder Separate important unit", () => {
  let unitDoc, userDoc, stateDoc, countyDoc;
  
  before(() => {
    return User.remove({})
      .then(() => Unit.remove({}))
      .then(() => County.remove({}))
      .then(() => State.remove({}))
      .then(() => new User(userFixture).save())
      .then((user) => {
        userDoc = user;
        return new Unit(unitFixture).save();
      })
      .then((unit) => {
        unitDoc = unit;
        return new State(stateFixtrue).save();
      })
      .then((state) => {
        stateDoc = state;
        return new County(countyFixture).save();
      })
      .then((county) => {
        countyDoc = county;
      })
  });
  
  after(() => {
    return User.remove({})
      .then(() => Unit.remove({}))
      .then(() => State.remove({}))
      .then(() => County.remove({}));
  });
  
  describe("#createDoc()", () => {
    it('should create doc and unit info should match', () => {
      console.log(2)
      return WorkOrder.createDoc(workorder)
        .then((doc) => {
          should.exist(doc);
          doc.should.be.Array().with.length(1);
          doc[0].should.have.property("_id");
        });
    }).slow(50);
  
  });
});
*/
