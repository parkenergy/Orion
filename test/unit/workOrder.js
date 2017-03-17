const mongoose = require('mongoose'),
  Promise      = require('bluebird'),
  should       = require('should'),
  _            = require('lodash'),
  fixture      = require('../fixture/workOrder.json'),
  unitFixture  = require('../fixture/unit.json'),
  userFixture  = require('../fixture/user.json'),
  WorkOrder    = require('../../lib/models/workOrder'),
  User         = require('../../lib/models/user'),
  Unit         = require('../../lib/models/unit'),
  County       = require('../../lib/models/county'),
  State        = require('../../lib/models/state'),
  Area         = require('../../lib/models/area');

before(() => WorkOrder.remove({}));

after(() => WorkOrder.remove({}));

describe("WorkOrder Units", () => {
  let unitId, userId, unitDoc, userDoc;

  before(() => {
    return User.remove({})
      .then(() => Unit.remove({}))
      .then(() => new User(userFixture).save())
      .then(user => {
        userId = user._id;
        userDoc = user;

        return new Unit(unitFixture).save();
      })
      .then(unit => {
        unitId = unit._id;
        unitDoc = unit;
      });
  });

  after(() => {
    return User.remove({})
      .then(() => Unit.remove({}));
  });

  describe("#createDoc()", () => {
    it('should create and return new document', () => {
      let doc = _.cloneDeep(fixture);
      doc.technician = userDoc;
      doc.unit = unitDoc;

      return WorkOrder.createDoc(fixture)
        .then(doc => {
          should.exist(doc);
          doc.should.be.Array().with.length(1);
          doc[0].updated_at.should.be.a.Date();
          doc[0].should.have.property("_id");

          doc[0].header.should.have.property('unitNumber');
          doc[0].header.unitNumber.should.be.a.String();
          doc[0].header.unitNumber.should.equal('TEST1');
          should.exist(doc[0].unit);
          should.exist(doc[0].technician);
          doc[0].unit.toString().should.equal(unitId.toString());
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

  describe("#list()", () => {
    before(() => {
      return new Promise((resolve, reject) => {
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
          .then(docs => WorkOrder.insertMany(docs))
          .then(() => {
            let newUser = _.clone(userFixture);

            newUser.firstName = "Find";
            newUser.lastName = "Me";
            newUser.username = "TEST003";

            return new User(newUser).save();
          })
          .then(resolve)
          .catch(reject);
      });
    });

    it("Should list 4 pages of 25 results", () => {
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

      return WorkOrder.list(options)
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

          return null;
        });
    }).slow(500);

    it("Should list workorders with specific unitNumber", () => {
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

      return WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(doc => {
            doc.unitNumber.should.equal("123TEST");
          });
        });
    }).slow(200);

    it("Should list workorders with specific technician name", () => {
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

      return WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(doc => {
            doc.techId.should.equal("TEST003");
          });
        });
    }).slow(200);

    it("Should list workorders with specific leaseName", () => {
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

      return WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(doc => {
            doc.header.leaseName.should.equal("TESTLOC");
          });
        });
    }).slow(200);

    it("Should list workorders with specific customerName", () => {
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

      return WorkOrder.list(options)
        .then(docs => {
          should.exist(docs);
          docs.should.be.an.Array();
          docs.should.be.length(25);

          docs.forEach(doc => {
            doc.header.customerName.should.equal("TESTCUST");
          });
        });
    }).slow(200);
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
