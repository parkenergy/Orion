var mongoose = require('mongoose');
var Promise = require('bluebird');
var should = require('should');
var nock = require('nock');
var _ = require('lodash');
var fixture = require('../fixture/workOrder.json');
var userFixture = require('../fixture/user.json');
var customerFixture = require('../fixture/customer.json');
var WorkOrder = require('../../lib/models/workOrder');
var Customer = require('../../lib/models/customer');

before(function() {
  return WorkOrder.remove({})
    .exec()
    .then(function () {
      return Customer.remove({}).exec();
    })
    .then(function () {
      return new Customer(customerFixture).save();
    });
});


after(function() {
  WorkOrder.remove({})
    .then(function () {
      return Customer.remove({}).exec();
    });
});

describe("WorkOrder Integrations", function () {
  var wo;

  before(function () {
    fixture.type = "Corrective";
    fixture.header.customerName = "APACHE CORP";

    return WorkOrder.createDoc(fixture)
      .then(function (doc) {
        wo = doc[0];
      });
  });

  it("Should sync WorkOrder to Netsuite", function () {
    nock('https://rest.na1.netsuite.com')
      .post('/app/site/hosting/restlet.nl?script=112&deploy=1', {
        pm: 'F',
        techId: 'TEST001',
        truckId: 'truck001',
        unitNumber: 'T456'
      })
      .reply(200, {
        nswoid: "1234"
      });

    wo.netsuiteSyned = true;

      return WorkOrder.updateDoc(wo.id, wo, userFixture)
        .then(function (doc) {
          doc.timeSynced.should.be.Date();

          doc.syncedBy.should.be.String();
          doc.syncedBy.should.equal('TEST001');

          doc.netsuiteId.should.be.String();
          doc.netsuiteId.should.equal('1234');
        });
  }).slow(100);
});
