const mongoose    = require('mongoose'),
  should          = require('should'),
  nock            = require('nock'),
  fixture         = require('../fixture/workOrder.json')[0],
  userFixture     = require('../fixture/user.json')[0],
  unitFixture     = require('../fixture/unit.json')[0],
  stateFixture    = require('../fixture/state.json'),
  countyFixture   = require('../fixture/county.json')[0],
  customerFixture = require('../fixture/customer.json'),
  WorkOrder       = require('../../lib/models/workOrder'),
  County          = require('../../lib/models/county'),
  State           = require('../../lib/models/state'),
  Unit            = require('../../lib/models/unit'),
  Customer        = require('../../lib/models/customer');

before(() => {
  return WorkOrder.remove({})
    .then(() => Customer.remove({}).exec())
    .then(() => new Customer(customerFixture).save());
});


after(() => {
  WorkOrder.remove({})
    .then(() => State.remove({}))
    .then(() => County.remove({}))
    .then(() => Unit.remove({}))
    .then(() => Customer.remove({}).exec());
});

describe("WorkOrder Integrations", () => {
  let wo;

  before(() => {
    fixture.type = "Corrective";
    fixture.header.customerName = "APACHE CORP";

    return State.remove({})
      .then(() => County.remove({}))
      .then(() => Unit.remove({}))
      .then(() => WorkOrder.remove({}))
      .then(() => new State(stateFixture).save())
      .then(() => new County(countyFixture).save())
      .then(() => new Unit(unitFixture).save())
      .then(() => WorkOrder.createDoc(fixture))
      .then(doc => {
        wo = doc[0];
        wo.type = "Corrective";
        wo.header.customerName = "APACHE CORP";
      });
  });

  after(() => {
    return County.remove({})
    .then(() => State.remove({}))
    .then(() => Unit.remove({}));
  });

  it("Should sync WorkOrder to Netsuite", () => {
    nock('https://rest.na1.netsuite.com/', {
        reqheaders: {
          'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
          'User-Agent': 'SuiteScript-Call'
        },
      })
      .post('/app/site/hosting/restlet.nl?script=112&deploy=1', {"dummy":"dummy","isPM":"F","techId":"TEST001","truckId":"truck001","truckNSID":"28","swap":"F","transfer":"F","troubleCall":"F","newSet":"F","release":"F","correctiveMaintenance":"T","atShop":"F","timeSubmitted":"2017-04-28T16:40:00.353Z","woStarted":"2017-04-28T12:39:42.157Z","woEnded":"2017-04-28T16:40:00.353Z","unitNumber":"T456","customerName":"616","contactName":"","county":"Pittsburg","state":"Oklahoma","leaseName":"Willard #1","rideAlong":"","startMileage":"201232","endMileage":"201313","applicationType":"3","releaseDestination":"","transferLease":"","transferCounty":"","transferState":"","swapDestination":"","swapUnitNSID":"","assetType":"5","isUnitRunningOnDeparture":"F","isCustomerUnit":"F","isRental":"T","billableToCustomer":"F","warrantyWork":"F","AFE":"F","lowDischargeKill":"0","highSuctionKill":"30","highDischargeKill":"120","lowSuctionKill":"0","highDischargeTempKill":"0","battery":"T","capAndRotor":"F","airFilter":"T","oilAndFilters":"T","magPickup":"F","belts":"T","guardsAndBrackets":"T","sparkPlugs":"T","plugWires":"F","driveLine":"F","kills":"T","airHoses":"T","coolerForCracks":"F","coolerLouverMovement":"F","coolerLouverCleaned":"F","pressureReliefValve":"F","scrubberDump":"F","plugInSkid":"F","filledDayTank":"F","fanForCracking":"F","panelWires":"T","oilPumpBelt":"F","fuelPressureFirstCut":"25","fuelPressureSecondCut":"7","visibleLeaksNotes":"n","cylinder1":"140","cylinder2":"135","cylinder3":"0","cylinder4":"0","cylinder5":"0","cylinder6":"0","cylinder7":"0","cylinder8":"0","suctionPressure":"15","dischargePressure":"65","flowMCF":"40","rpm":"0","dischargeTemp1":"0","dischargeTemp2":"0","hourReading":"0","compressorSerial":"Qb1203060062","engineSerial":"4112605681","engineOilPressure":"40","alternatorOutput":"0","compressorOilPressure":"30","engineJWTemp":"0","engineManifoldVac":"0","afrmvTarget":"0","catalystTempPre":"0","catalystTempPost":"0","permitNumber":"0","repairsDescription":"","repairsReason":"","calloutReason":"","newsetNotes":"","releaseNotes":"","indirectNotes":"Testing","timeAdjustmentNotes":"","leaseNotes":"","unitNotes":"","latitude":34.915466,"longitude":96.032698,"safety":"0","positiveAdj":"0","negativeAdj":"0","lunch":"0","custRelations":"0","telemetry":"0","environmental":"0","diagnostic":"0","serviceTravel":"90","optimizeUnit":"75","pm":"60","washUnit":"15","inventory":"0","training":"0","oilAndFilter":"0","addOil":"0","compression":"0","replaceEngine":"0","replaceCylHead":"0","coolingSystem":"0","fuelSystem":"0","ignition":"0","starter":"0","lubrication":"0","exhaust":"0","alternator":"0","driveOrCoupling":"0","sealsAndGaskets":"0","install":"0","test":"0","repair":"0","panel":"0","electrical":"0","inspect":"0","replace":"0","cooling":"0","dumpControl":"0","reliefValve":"0","suctionValve":"0","parts":[]})
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
  }).slow(100);
});
