/**
 *            PartOrderCtrl
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Controllers')
.controller('PartOrderCtrl',
  ['$scope', '$timeout', '$location','$q', '$cookies', 'AlertService',
function ($scope, $timeout, $location, $q, $cookies, AlertService) {
  // Variables-----------------------------------------
  $scope.partorders = [];
  $scope.spinner = true;
  // --------------------------------------------------

  // Turn Spinner Off ---------------------------------
  $scope.spinnerOff = function () {
    $scope.spinner = false;
  };
  // --------------------------------------------------

  // Look up Part Order Based on Query ----------------
  /*$scope.PartOrderLookup = function (query) {
    var deferred = $q.defer();
    console.log("Looking up Part Orders...");
    PartOrders.query(query,
      function (res) {
        console.log("Part Orders Loaded.");
        return deferred.resolve(res);
      },
      function (err) { return deferred.reject(err); }
    );
    return deferred.promise;
  };*/
  $scope.PartOrderLookup = function (query) {
    var returnParts = [];
    _.forEach($scope.partorders, function (po) {
      returnParts.push(po);
    });
    return returnParts;
  };
  // --------------------------------------------------

  // Routing ------------------------------------------
  $scope.createPartOrder = function () {
    $location.url('/partorder/create');
  };
  // --------------------------------------------------








  function ClassPartOrders() {
    return {
      _id: '2',
      partNSID: null,
      part: {
        description:    '',
        componentName:  '',
        system:         null,
        subsystem:      null,
        engine:         null,
        compressor:     null,
        component:      null,
        revision:       null,
        MPN:            '',

        vendors: [{
          vendor: null,
          vendorPartNumber:       '',
          vendorPartCost:         null,
          vendorPartDescription:  ''
        }]
      },
      quantity: null,

      status: '',

      timeCreated: Date, //when it was created by technician
      timeSubmitted: Date, //when it was submitted to Orion
      timeShipped: Date, //time order was shipped
      timeComplete: Date, //time the order was completed

      techId: '', //Username
      managerId: '',
      originNSID: '',
      destinationNSID: '', //NSID

      trackingNumber: '',

      comment: String,
    }
  }
  var part = {
    description:    'HI-TEK S-1 GEO SAE 15W40 PARK 300 & 900 SERIES',
    componentName:  '4600.002.01',
    system:         null,
    subsystem:      null,
    engine:         null,
    compressor:     null,
    component:      null,
    revision:       null,
    MPN:            'OILR157',

    vendors: [{
      vendor: null,
      vendorPartNumber:       '',
      vendorPartCost:         null,
      vendorPartDescription:  ''
    }]
  };
  $scope.newPartOrder = ClassPartOrders();
  $scope.newPartOrder.partNSID = 2858;
  $scope.newPartOrder.part = part;
  $scope.newPartOrder.quantity = 3;
  $scope.newPartOrder.status = 'pending';
  $scope.newPartOrder.timeCreated = new Date('10/17/2016 10:32:31');
  $scope.newPartOrder.timeSubmitted = new Date();
  $scope.newPartOrder.timeShipped = new Date();
  $scope.newPartOrder.techId = 'MWH001';
  $scope.newPartOrder.originNSID = '0001';
  $scope.newPartOrder.destinationNSID = '';
  $scope.newPartOrder.comment = 'This is a test';
  $scope.partorders.push($scope.newPartOrder);

  $scope.secondPartOrder = ClassPartOrders();
  $scope.secondPartOrder._id = 3;
  $scope.secondPartOrder.partNSID = 2258;
  $scope.secondPartOrder.part = part;
  $scope.secondPartOrder.quantity = 1;
  $scope.secondPartOrder.status = 'shipped';
  $scope.secondPartOrder.timeCreated = new Date('10/17/2016 10:31:30');
  $scope.secondPartOrder.timeSubmitted = new Date();
  $scope.secondPartOrder.timeShipped = new Date();
  $scope.secondPartOrder.techId = 'MWH001';
  $scope.secondPartOrder.originNSID = '0000';
  $scope.secondPartOrder.destinationNSID = 'FAR0001';
  $scope.secondPartOrder.comment = 'This is a test 2';
  $scope.partorders.push($scope.secondPartOrder);

  $scope.third = ClassPartOrders();
  $scope.third._id = 4;
  $scope.third.partNSID = 2259;
  $scope.third.part = part;
  $scope.third.quantity = 32;
  $scope.third.status = 'canceled';
  $scope.third.timeCreated = new Date('10/17/2016 10:32:30');
  $scope.third.timeSubmitted = new Date();
  $scope.third.timeShipped = new Date();
  $scope.third.techId = 'MWH001';
  $scope.third.originNSID = '0000';
  $scope.third.destinationNSID = '';
  $scope.third.comment = 'This is a test 3';
  $scope.partorders.push($scope.third);

  $scope.fourth = ClassPartOrders();
  $scope.fourth._id = '5';
  $scope.fourth.partNSID = 1259;
  $scope.fourth.part = part;
  $scope.fourth.quantity = 35;
  $scope.fourth.status = 'backorder';
  $scope.fourth.timeCreated = new Date('10/17/2016 10:29:30');
  $scope.fourth.timeSubmitted = new Date();
  $scope.fourth.timeShipped = null;
  $scope.fourth.techId = 'MWH001';
  $scope.fourth.originNSID = '0000';
  $scope.fourth.destinationNSID = '';
  $scope.fourth.comment = 'This is a test 5';
  $scope.partorders.push($scope.fourth);

  // completed
  $scope.fifth = ClassPartOrders();
  $scope.fifth._id = '10';
  $scope.fifth.partNSID = 3456;
  $scope.fifth.part = part;
  $scope.fifth.quantity = 10;
  $scope.fifth.status = 'complete';
  $scope.fifth.timeCreated = new Date('10/17/2016 10:29:30');
  $scope.fifth.timeSubmitted = new Date();
  $scope.fifth.timeShipped = new Date();
  $scope.fifth.timeComplete = new Date();
  $scope.fifth.techId = 'MWH001';
  $scope.fifth.originNSID = '0000';
  $scope.fifth.destinationNSID = 'FAR0001';
  $scope.fifth.comment = 'This is a test 5';
  $scope.partorders.push($scope.fifth);

  //---------------------------------------------------------------------
}]);
