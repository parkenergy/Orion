const mongoose    = require('mongoose'),
  should          = require('should'),
  nock            = require('nock'),
  _               = require('lodash'),
  fixture         = require('../fixture/workOrder.json')[0],
  userFixture     = require('../fixture/user.json')[0],
  customerFixture = require('../fixture/customer.json'),
  WorkOrder       = require('../../lib/models/workOrder'),
  Customer        = require('../../lib/models/customer');

before(() => {
  return WorkOrder.remove({})
    .exec()
    .then(() => Customer.remove({}).exec())
    .then(() => new Customer(customerFixture).save());
});


after(() => {
  WorkOrder.remove({})
    .then(() => Customer.remove({}).exec());
});

describe("WorkOrder Integrations", () => {
  /*let wo;

  before(() => {
    fixture.type = "Corrective";
    fixture.header.customerName = "APACHE CORP";
    console.log(fixture);

    return WorkOrder.createDoc(fixture)
      .then(doc => {
        wo = doc[0];
      });
  });

  it("Should sync WorkOrder to Netsuite", () => {
    nock('https://rest.na1.netsuite.com')
      .post('/app/site/hosting/restlet.nl?script=112&deploy=1', {
        isPM: 'F',
        techId: 'TEST001',
        truckId: 'truck001',
        unitNumber: 'T456'
      })
      .reply(200, {
        nswoid: "1234"
      });

    wo.netsuiteSyned = true;

      return WorkOrder.updateDoc(wo.id, wo, userFixture)
        .then(doc => {
          doc.timeSynced.should.be.Date();

          doc.syncedBy.should.be.String();
          doc.syncedBy.should.equal('TEST001');

          doc.netsuiteId.should.be.String();
          doc.netsuiteId.should.equal('1234');
        });
  }).slow(100);*/
});
