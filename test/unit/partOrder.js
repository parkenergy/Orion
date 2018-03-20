/**
 *            partOrder
 *
 * Created by marcuswhelan on 1/18/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
const PartOrder   = require('../../lib/models/partOrder'),
  Part            = require('../../lib/models/part'),
  User            = require('../../lib/models/user'),
  mongoose        = require('mongoose'),
  config          = require('../../config'),
  Promise         = require('bluebird'),
  should          = require('should'),
  _               = require('lodash'),
  fixture         = require('../fixture/partOrder.json'),
  userFixture     = require('../fixture/user.json')[0],
  partFixture     = require('../fixture/part.json');


describe("PartOrder Units", () => {
  let partId, partDoc;

  before(() => PartOrder.remove({}));

  after(() => PartOrder.remove({}));

  before(() => {
    return User.remove({})
      .then(() => Part.remove({}))
      .then(() => new User(userFixture).save())
      .then(() => new Part(partFixture).save())
      .then((part) => {
        partId = part._id;
        partDoc = part;
      });
  });

  after(() => {
    return User.remove({})
      .then(() => Part.remove({}));
  });

  describe("#createDoc()", () => {
    let manualPartFixture = _.cloneDeep(fixture);

    it("Should create a non manual partOrder document", () => {
      return PartOrder.createDoc(fixture)
        .then(docs => {
          should.exist(docs[0]);
          docs[0].should.not.be.Array();
          docs[0].timeCreated.should.be.a.Date();
          should.exist(docs[0].timeSubmitted);
          docs[0].timeSubmitted.should.be.a.Date();
          docs[0].should.have.property("_id");
          should.exist(docs[0].orderId);
          docs[0].orderId.should.be.a.String();

          docs[0].part.should.be.an.instanceOf(Object);
          docs[0].part.should.have.property('isManual');
          docs[0].part.MPN.should.equal('111-000');
        });
    });

    it("Should create a manual partOrder document", () => {
      manualPartFixture.partNSID = 0;
      manualPartFixture.part.isManual = true;

      return PartOrder.createDoc(manualPartFixture)
        .then(docs => {
          should.exist(docs[0]);
          docs[0].should.not.be.Array();
          docs[0].timeCreated.should.be.a.Date();
          should.exist(docs[0].timeSubmitted);
          docs[0].timeSubmitted.should.be.a.Date();
          docs[0].should.have.property("_id");
          should.exist(docs[0].orderId);
          docs[0].orderId.should.be.a.String();

          docs[0].part.should.be.an.instanceOf(Object);
          docs[0].part.should.have.property('isManual');
          docs[0].part.MPN.should.equal('111-000');
          docs[0].part.isManual.should.equal(true);
        });
    });
  }); /* End of 'describe' #createDoc() */

  describe("#updateDoc()", () => {
    let orderId, updated_at, updatingDoc;

    beforeEach(() => {
      return PartOrder.remove({})
        .then(() =>  PartOrder.createDoc(fixture))
        .then(docs => {
          updatingDoc = _.cloneDeep(docs[0]);
          updatingDoc.poNumber = '1234-5678-910';
          updatingDoc.approvedBy = 'TEST001';
          orderId = docs[0].orderId;
          updated_at = docs[0].updated_at;
        })
    });

    afterEach(() => PartOrder.remove({}));

    it("Should set timeOrdered on status change to 'ordered'", () => {
      updatingDoc.status = 'ordered';

      return PartOrder.updateDoc(orderId, updatingDoc)
        .then(doc => {
          should.exist(doc);
          doc.should.not.be.Array();
          doc.timeOrdered.should.be.a.Date();

          doc.updated_at.should.not.eql(updated_at);
          doc.poNumber.should.be.equal('1234-5678-910');
        });
    });

    it("Should set many fields on status change to 'completed'", () => {
      updatingDoc.status = 'ordered';

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

  describe('#fetch()', () => {
    let orderId;

    before(() => {
      return PartOrder.remove({})
        .then(() => PartOrder.createDoc(fixture))
        .then(docs => {
          orderId = docs[0].orderId;
        });
    });

    it("Should fetch one document", () => {
      return PartOrder.fetch(orderId)
        .then(doc => {
          should.exist(doc);
          doc.should.have.property("_id");
          doc.orderId.should.be.equal(orderId);
          doc.timeCreated.should.be.a.Date();
          doc.techId.should.be.a.String();
          doc.techId.should.be.equal('TEST001')
        });
    });

  }); /* End of 'describe' #fetch() */

  describe('#list()', () => {

    before(() => {
      return new Promise((resolve, reject) => {
        PartOrder.remove({})
          .then(() => {

            let pendingDateDocs = _.range(10).map(() => {
              let f = _.cloneDeep(fixture);
              f.techId = "TEST003";
              f.timeSubmitted = new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)');
              f.status = 'pending';
              return f;
            });

            let completedDocs = _.range(10).map(() => {
              let f = _.cloneDeep(fixture);
              f.status = 'completed';
              return f;
            });

            let canceledDocs = _.range(10).map(() => {
              let f = _.cloneDeep(fixture);
              f.status = 'canceled';
              return f;
            });

            let shippedDocs = _.range(10).map(() => {
              let f = _.cloneDeep(fixture);
              f.status = 'ordered';
              return f;
            });

            let backorderDocs = _.range(10).map(() => {
              let f = _.cloneDeep(fixture);
              f.status = 'backorder';
              return f;
            });

            return [...pendingDateDocs, ...completedDocs, ...canceledDocs, ...canceledDocs, ...shippedDocs, ...backorderDocs];
          })
          .then(docs => PartOrder.insertMany(docs))
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
    }); /* End of 'before' #list() */

    it("Should list 6 pages of 10 results", () => {
      let options = {
        sort:       '-timeCreated',
        supervised: ['TEST001', 'TEST003'],
        status: {
          pending:    true,
          backorder:  true,
          canceled:   true,
          ordered:    true,
          completed:  true
        },
        size:      10,
        page:        0
      };

      return PartOrder.list(options)
        .then((docs) => {
          docs.should.be.an.Array();
          docs.should.have.length(10);
          options.page+=10;

          return PartOrder.list(options);
        })
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(10);
          options.page+=10;

          return PartOrder.list(options);
        })
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(10);
          options.page+=10;

          return PartOrder.list(options);
        })
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(10);
          options.page+=10;

          return PartOrder.list(options);
        })
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(10);
          options.page+=10;

          return PartOrder.list(options);
        })
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.have.length(10);

          return null;
        });

    }).slow(500);

    it("Should list 10 pending partOrders", () => {
      const options = {
        sort:       '-timeCreated',
        supervised: ['TEST001', 'TEST003'],
        status: {
          pending:    true,
          backorder:  false,
          canceled:   false,
          ordered:    false,
          completed:  false
        },
        size:      50,
        page:       0
      };

      return PartOrder.list(options)
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.be.length(10);

          docs.forEach(doc => {
            doc.status.should.equal('pending');
          })
        })
    });

    it("Should list 20 of 2 different status partOrders", () => {
      const options = {
        sort:       '-timeCreated',
        supervised: ['TEST001', 'TEST003'],
        status: {
          pending:    true,
          backorder:  false,
          canceled:   false,
          ordered:    false,
          completed:  true
        },
        size:      20,
        page:       0
      };

      return PartOrder.list(options)
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.be.length(20);

          docs.forEach(doc => {
            doc.status.should.be.instanceOf(String);
            doc.status.should.be.equalOneOf(['pending','completed']);
          })
        })
    });


    it("Should list 10 partOrders with specific timeCreated", () => {
      const options = {
        sort:       '-timeSubmitted',
        supervised: ['TEST001', 'TEST003'],
        to: new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'),
        from: new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'),
        status: {
          pending:    true,
          backorder:  true,
          canceled:   true,
          ordered:    true,
          completed:  true
        },
        size:      60,
        page:       0
      };

      return PartOrder.list(options)
        .then(docs => {
          docs.should.be.an.Array();
          docs.should.be.length(10);

          docs.forEach(doc => {
            doc.timeCreated.should.be.a.Date();
            doc.timeCreated.should.eql(new Date('Wed Jan 18 2017 11:32:45 GMT-0600 (CST)'));
          })
        })
    });


  }); /* End of 'describe' #list() */

  describe("#delete()", () => {
    let id;

    before(() => {

      return PartOrder.remove({}, (err) => {
        if(err) throw err;

        return PartOrder.createDoc(fixture)
          .then(doc => {
            id = doc._id;
            return doc;
          });
      });
    });

    it("Should remove a partOrder", () => PartOrder.delete(id));
  }); /* End of 'describe' #delete() */

}); /* End of 'describe' PartOrder Unit Tests */
