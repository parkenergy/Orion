const mongoose    = require('mongoose'),
  Promise         = require('bluebird'),
  should          = require('should'),
  _               = require('lodash'),
  Unit            = require('../../lib/models/unit'),
  PmReport        = require('../../lib/models/pmReport'),
  User            = require('../../lib/models/user'),
  unitFixture     = require('../fixture/unit.json'),
  userFixture     = require('../fixture/user.json'),
  pmReportFixture = require('../fixture/pmReport.json');

mongoose.Promise = Promise;

describe("Unit Units", () => {
  before(() => Unit.createDoc(unitFixture));
  before(() => User.createDoc(userFixture));
  before(() => PmReport.createDoc(pmReportFixture));

  after(() => Unit.remove({}));
  after(() => User.remove({}));
  after(() => PmReport.remove({}));

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
      newUser.username = "TEST002";
      newUser.supervisor = "TEST003";

      const newUnit = _.clone(unitFixture);
      newUnit.number = "321";
      newUnit.assignedTo = "TEST002";
      newUnit.netsuiteId = "s987";
      newUnit.customerName = "CUST 3210";

      const newPM = _.clone(pmReportFixture);
      newPM.unitNumber = "321";
      newPM.userId = "TEST002";

      return Promise.join([
        Unit.createDoc(newUnit),
        User.createDoc(newUser),
        PmReport.createDoc(newPM)
      ]);
    });

    after(() => Promise.join([
        Unit.remove({}),
        //User.remove({}),
        PmReport.remove({})
      ])
    );

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

    /*it("should list 1 Unit by supervisor", Unit.list({supervisor: "TEST002"})
      .then(units => {
        should.exist(units);
        units.should.be.Array().with.length(1);

        units[0].number.should.equal("123");
        units[0].assignedTo.should.equal("TEST001");
      })
    );*/
  });
});
