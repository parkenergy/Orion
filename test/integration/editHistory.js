const mongoose = require('mongoose');
const Promise = require('bluebird');
const config = require('../../config');
const should = require('should');
const _ = require('lodash');
const workOrderFixture = require('../fixture/workOrder.json');
const WorkOrder = require('../../lib/models/workOrder');
const EditHistory = require('../../lib/models/editHistory');

before(() => {
  return WorkOrder.remove({})
    .exec()
    .then(() => EditHistory.remove({}));
});


after(() => {
  return WorkOrder.remove({})
    .exec()
    .then(() => EditHistory.remove({}));
});

describe("EditHistory Integrations", () => {
  let workOrderId, wo;
  it("Should create WorkOrder but no EditHistory", () => {
    return WorkOrder.createDoc(workOrderFixture)
      .then(workOrder => {
        workOrderId = workOrder[0]._id;
        wo = workOrder[0];
        return EditHistory.list({workOrder: workOrderId});
      })
      .then(edits => {
        edits.should.be.Array().with.length(0);

        return null;
      });
  });

  it("Should create EditHistory on WorkOrder Update", () => {
    let newData = _.clone(JSON.parse(JSON.stringify(wo)));
    newData.header.unitNumber = "test1234";
    return WorkOrder.updateDoc(workOrderId, newData, {role: 'admin', username: 'TEST004'})
      .then(() => EditHistory.list({workOrder: workOrderId}))
      .then(edits => {
        edits.should.be.Array().with.length(1);

        edits[0].should.have.property('workOrder');
        edits[0].workOrder.toString().should.be.equal(workOrderId.toString());

        edits[0].should.have.property('user');
        edits[0].user.should.equal('TEST004');

        edits[0].should.have.property('path');
        edits[0].path.should.be.Array().with.length(2);
        edits[0].path[0].should.equal('header');
        edits[0].path[1].should.equal('unitNumber');

        edits[0].before.should.equal('TEST1');
        edits[0].after.should.equal('test1234');

        edits[0].should.have.property('editType');
        edits[0].editType.should.equal('Edit');
      });
  });
});
