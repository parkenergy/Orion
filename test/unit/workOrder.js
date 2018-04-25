const mongoose = require('mongoose'),
  Promise      = require('bluebird'),
  should       = require('should'),
  _            = require('lodash'),
  fixture      = require('../fixture/workOrder.json')[0],
  unitFixture  = require('../fixture/unit.json')[0],
  userFixture  = require('../fixture/user.json')[0],
  stateFixture = require('../fixture/state.json'),
  countyFixture= require('../fixture/county.json')[0],
  WorkOrder    = require('../../lib/models/workOrder'),
  User         = require('../../lib/models/user'),
  County       = require('../../lib/models/county'),
  State        = require('../../lib/models/state'),
  Unit         = require('../../lib/models/unit');


before(() => WorkOrder.remove({}));

after(() => WorkOrder.remove({}));

describe("WorkOrder Units", () => {
  let unitId, userId, unitDoc, userDoc, stateDoc, countyDoc;

  before(() => {
    return User.remove({})
      .then(() => Unit.remove({}))
      .then(() => County.remove({}))
      .then(() => State.remove({}))
      .then(() => new User(userFixture).save())
      .then(user => {
        userId = user._id;
        userDoc = user;

        return new Unit(unitFixture).save();
      })
      .then(unit => {
        unitId = unit._id;
        unitDoc = unit;
        return new State(stateFixture).save();
      })
      .then((state) => {
        stateDoc = state;
        return new County(countyFixture).save();
      })
      .then((county) => {
        countyDoc = county;
      });
  });

  after(() => {
    return User.remove({})
      .then(() => Unit.remove({}))
      .then(() => State.remove({}))
      .then(() => County.remove({}));
  });

  describe("#createDoc()", () => {
    it('should create and return new document', () => {

      return WorkOrder.createDoc(fixture)
        .then(doc => {
          should.exist(doc);
          doc.should.be.Array().with.length(1);
          doc[0].updated_at.should.be.a.Date();
          doc[0].should.have.property("_id");

          doc[0].header.should.have.property('unitNumber');
          doc[0].header.unitNumber.should.be.a.String();
          doc[0].header.unitNumber.should.equal('TEST1');
          //doc[0].unit.should.equal(null);
          should.exist(doc[0].technician);
          //doc[0].unit.toString().should.equal(unitId.toString());
          doc[0].technician.toString().should.equal(userId.toString());
        });
    }).slow(50);
  });

  describe("#updateDoc()", () => {
    let id;

    before(() => {
      return WorkOrder.remove({})
        .then(() => WorkOrder.createDoc(fixture))
        .then(docs => {
          id = docs[0]._id;
        });
    });

    it('should update document', () => {
      let updated = _.cloneDeep(fixture);
      updated.header.unitNumber = 'TEST2';

      return WorkOrder.updateDoc(id, updated, userFixture)
        .then(doc => {

          doc.should.have.property('header');
          doc.should.have.property("_id");
          doc.header.should.have.property('unitNumber');
          doc.header.unitNumber.should.be.a.String();
          doc.header.unitNumber.should.equal('TEST2');
        });
    }).slow(100);
  });

  describe("#fetch()", () => {
    let id;

    before(() => {
      return WorkOrder.remove({})
        .then(() => WorkOrder.createDoc(fixture))
        .then(docs => {
          id = docs[0]._id;
        });
    });

    it('should fetch one document', () => {
      return WorkOrder.fetch(id)
        .then(doc => {
          doc.should.have.property("_id");

          doc.should.have.property('header');
          doc.header.should.have.property('unitNumber');
          doc.header.unitNumber.should.be.a.String();
          doc.header.unitNumber.should.equal('TEST1');
        });
    }).slow(30);
  });



  describe('#getUnitWorkOrders()' , () => {
    const options = {
      sort: '-timeSubmitted',
      unit: '123',
      limit: 1,
      skip: 0
    };
    it("should fetch WorkOrders for Units", () => WorkOrder.getUnitWorkOrders(options)
      .then(workorders => {
        should.exist(workorders);
        workorders.should.be.Array().with.length(1);

        workorders[0].unitNumber.should.equal('123');
      })
    );

  });

  describe("#list()", () => {
    before((done) => {
      WorkOrder.remove({})
        .then(() => {
          let unitDocs = _.range(25).map(() => {
            let f = _.cloneDeep(fixture);
            f.unitNumber = "123TEST";
            return f;
          });
          let techDocs = _.range(25).map(() => {
            let f = _.cloneDeep(fixture);
            f.techId = "TEST003";

            return f;
          });
          let locDocs = _.range(25).map(() => {
            let f = _.cloneDeep(fixture);
            f.header.leaseName = "TESTLOC";

            return f;
          });
          let custDocs = _.range(25).map(() => {
            let f = _.cloneDeep(fixture);
            f.header.customerName = "TESTCUST";

            return f;
          });

          return [...unitDocs, ...techDocs, ...locDocs, ...custDocs];
        })
        .then(docs => WorkOrder.createDoc(docs))
        .then(() => {
          let newUser = _.clone(userFixture);

          newUser.netsuiteId = '12456';
          newUser.firstName = "Find";
          newUser.lastName = "Me";
          newUser.username = "TEST003";

          return new User(newUser).save();
        })
        .then(() => {
          done();
        })
    });

    it("Should list 4 pages of 25 results", (done) => {
      let options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
        supervised: ['TEST001', 'TEST003'],
        loc:   null,
        cust:  null,
        limit: 25,
        skip:  0
      };

      WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.have.length(25);
          options.skip+=25;

          return WorkOrder.list(options);
        }).then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(25);
          options.skip+=25;

          return WorkOrder.list(options);
        }).then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(25);
          options.skip+=25;

          return WorkOrder.list(options);
        }).then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(25);
          done()
        })
        .catch((err) => done(err));
    }).slow(15000);

    it("Should list workorders with specific unitNumber", (done) => {
      const options = {
        sort:  '-updated_at',
        unit:  '123TEST',
        tech:  null,
        supervised: ['TEST001', 'TEST003'],
        loc:   null,
        cust:  null,
        limit: 25,
        skip:  0
      };

      WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(doc => {
            doc.unitNumber.should.equal("123TEST");
          });
          done()
        })
        .catch((err) => console.log(err));
    }).slow(15000);

    it("Should list workorders with specific technician name", (done) => {
      const options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  "find me",
        supervised: ['TEST001', 'TEST003'],
        loc:   null,
        cust:  null,
        limit: 25,
        skip:  0
      };

      WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(doc => {
            doc.techId.should.equal("TEST003");
          });
          done()
        });
    }).slow(15000);

    it("Should list workorders with specific leaseName", (done) => {
      const options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
        supervised: ['TEST001', 'TEST003'],
        loc:   "TESTLOC",
        cust:  null,
        limit: 100,
        skip:  0
      };

      WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(doc => {
            doc.header.leaseName.should.equal("TESTLOC");
          });
          done()
        });
    }).slow(15000);

    it("Should list workorders with specific customerName", (done) => {
      const options = {
        sort:  '-updated_at',
        unit:  null,
        tech:  null,
        supervised: ['TEST001', 'TEST003'],
        loc:   null,
        cust:  "TESTCUST",
        limit: 100,
        skip:  0
      };

      WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(doc => {
            doc.header.customerName.should.equal("TESTCUST");
          });
          done()
        });
    }).slow(15000);
  });

  describe("#delete()", () => {
    let id;
    before(() => {
      return WorkOrder.remove({}, (err) => {
        if(err) throw err;

        return WorkOrder.createDoc(fixture)
          .then(docs => {
            id = docs[0]._id;
            return docs;
          });
      });
    });

    it("Should remove workorder", () => WorkOrder.delete(id));
  });
});
