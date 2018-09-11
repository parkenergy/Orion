const mongoose         = require('mongoose'),
      should           = require('should'),
      _                = require('lodash'),
      County           = require('../../lib/models/county'),
      State            = require('../../lib/models/state'),
      Area             = require('../../lib/models/area'),
      WorkOrder        = require('../../lib/models/workOrder'),
      Unit             = require('../../lib/models/unit'),
      User             = require('../../lib/models/user'),
      stateFixtrue     = require('../../spec/fixture/state.json'),
      countyFixture    = require('../../spec/fixture/county.json'),
      unitFixture      = require('../../spec/fixture/unit.json')[0],
      userFixture      = require('../../spec/fixture/user.json')[0],
      //userFixture      = require('../fixture/user.json'),
      workOrderFixture = require('../../spec/fixture/workOrder.json');

mongoose.Promise = Promise;

describe("Unit Units", () => {
  before(() => Unit.remove({}));
  before(() => State.remove({}));
  before(() => County.remove({}));
  before(() => Unit.createDoc(unitFixture));
  before(() => State.createDoc(stateFixtrue));
  before(() => County.createDoc(countyFixture));
  before(() => User.createDoc(userFixture));
  before(() => WorkOrder.remove({}));

  after(() => Unit.remove({}));
  after(() => User.remove({}));
  after(() => State.remove({}));
  after(() => County.remove({}));

  describe("#fetch()", () => {
    it("should fetch Unit by number", () => Unit.fetch("123")
        .then(unit => {
          should.exist(unit);

          unit.assignedTo.should.equal('TEST001');
          unit.netsuiteId.should.equal('T123');
          unit.number.should.equal('123');
        })
    );
  });

  describe("#list", () => {

    before(() => {
      const newUser = _.clone(userFixture);
      newUser.netsuiteId = '1932';
      newUser.username = "TEST002";
      newUser.supervisor = "TEST003";

      const newUnit = _.clone(unitFixture);
      newUnit._id = "888888888888888888888888";
      newUnit.number = "321";
      newUnit.assignedTo = "TEST002";
      newUnit.netsuiteId = "s987";
      newUnit.customerName = "CUST 3210";

      return Promise.all([
        Unit.createDoc(newUnit),
        User.createDoc(newUser),
      ]);
    });

    it("should list 1 Unit with limit", () => Unit.list({size: 1})
      .then(units => {
        should.exist(units);
        units.should.be.Array().with.length(1);
      })
    );

    it("should list 2 Units with limit", () => Unit.list({size: 2})
      .then(units => {
        should.exist(units);
        units.should.be.Array().with.length(2);
      })
    );

    it("should list 1 Unit by number", () => Unit.list({number: "321"})
      .then(units => {
        should.exist(units);
        units.should.be.Array().with.length(1);

        units[0].number.should.equal("321");
      })
    );

    it("should list 1 Unit by tech", () => Unit.list({tech: "TEST002"})
      .then(units => {
        should.exist(units);
        units.should.be.Array().with.length(1);

        units[0].number.should.equal("321");
        units[0].assignedTo.should.equal("TEST002");
      })
    );

    it("should list 1 Unit by customer", () => Unit.list({customer: "CUST 0123"})
      .then(units => {
        should.exist(units);
        units.should.be.Array().with.length(1);

        units[0].number.should.equal("123");
        units[0].customerName.should.equal("CUST 0123");
      })
    );

    it("should list 1 Unit by supervisor", () => Unit.list({supervisor: "TEST002"})
      .then(units => {
        should.exist(units);
        units.should.be.Array().with.length(2);
        // now supervisor is included and the position changes.
        //units[1].assignedTo.should.equal("TEST001");
      })
    );

  });

});
