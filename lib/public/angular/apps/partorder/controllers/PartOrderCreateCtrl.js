angular.module('PartOrderApp.Controllers')
.controller('PartOrderCreateCtrl', ['$scope', '$timeout', '$uibModal', '$cookies', '$location', 'AlertService', 'GeneralPartSearchService', 'LocationItemService', 'ObjectService', 'PartOrders', 'locations', 'parts', 'DateService',
function ($scope, $timeout, $uibModal, $cookies, $location, AlertService, GeneralPartSearchService, LocationItemService, ObjectService, PartOrders, locations, parts, DateService) {

  // Variables -------------------------------------
  const DS = DateService;
  $scope.partorder = newPartOrder()
  $scope.parts = parts;
  $scope.locations = locations;
  $scope.techId = $cookies.get('tech');
  $scope.valid = true;
  // -----------------------------------------------

  const setTimesToSave = (partOrder) => {
    if (partOrder.timeCreated) {
      partOrder.timeCreated = DS.saveToOrion(new Date(partOrder.timeCreated));
    }
    if (partOrder.timeSubmitted) {
      partOrder.timeSubmitted = DS.saveToOrion(new Date(partOrder.timeSubmitted));
    }
    if (partOrder.timeOrdered) {
      partOrder.timeOrdered = DS.saveToOrion(new Date(partOrder.timeOrdered));
    }
    if (partOrder.timeComplete) {
      partOrder.timeComplete = DS.saveToOrion(new Date(partOrder.timeComplete));
    }
  };
  const setTimesToDisplay = (partOrder) => {
    if (partOrder.timeCreated) {
      partOrder.timeCreated = DS.displayLocal(new Date(partOrder.timeCreated));
    }
    if (partOrder.timeSubmitted) {
      partOrder.timeSubmitted = DS.displayLocal(new Date(partOrder.timeSubmitted));
    }
    if (partOrder.timeOrdered) {
      partOrder.timeOrdered = DS.displayLocal(new Date(partOrder.timeOrdered));
    }
    if (partOrder.timeComplete) {
      partOrder.timeComplete = DS.displayLocal(new Date(partOrder.timeComplete));
    }
  };

  // Set Validity of Part Order --------------------
  $scope.$watch('partorder.originNSID', (newVal, oldVal) => {
    if ( newVal !== oldVal ) {
    }
  });
  $scope.$watch('partorder.destinationNSID', (newVal, oldVal) => {
    if(newVal !== oldVal){
      $scope.partorder.truckId = LocationItemService.getTruckFromNSID($scope.partorder.destinationNSID,$scope.locations);
    }
  });
  // -----------------------------------------------

  // Make shift part order -------------------------
  function newPartOrder () {
    return {
      partNSID: null,
      quantity: null,

      timeCreated: null,

      comment: '',
      trackingNumber: '',

      techId: '',
      originNSID: '',
      destinationNSID: '',
      part: {}
    }
  }
  //
  $scope.partSet = []

  let fakePartOrder = {
    part: {}
  }

  const partOrderProxy = new Proxy(fakePartOrder, {
    set (obj, prop, value) {
      let duplicate = false
      checkLoop: for (let i = 0; i < $scope.partSet.length; i++) {
        let part = $scope.partSet[i]

        if (value.isManual) {
          if (part.isManual) {
            if (value.number == part.number && value.vendor == part.vendor) {
              duplicate = true
              break checkLoop
            }
          }
        } else {
          if (value.componentName == part.componentName) {
            duplicate = true
            break checkLoop
          }
        }
      }

      if (duplicate) {
        AlertService.add('danger', 'part already exists in order')
      } else {
        $scope.partSet.unshift(value)
        AlertService.add('success', value.description + " added")
      }
    }
  })
  // Passed Functions to Add Part Component -------
  $scope.addManualPart = (part) => {
    partOrderProxy.part = part
  };

  $scope.deletePart = (partIndex) => {
    AlertService.add('success', $scope.partSet[partIndex].description + " removed")
    $scope.partSet.splice(partIndex, 1)
  };

  $scope.originChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };

  $scope.destinationChange = (changedData, selected) => {
    ObjectService.updateNonNestedObjectValue($scope.partorder, changedData, selected);
  };
  // -----------------------------------------------
  
  // Construction for Search Table -----------------
  $scope.partsTableModel = GeneralPartSearchService.partTableModel($scope.parts,'replace', partOrderProxy);
  // -----------------------------------------------
  function checkValidity () {
    if (!$scope.partorder.originNSID) {
      return {
          valid: false,
          msg: 'origin needs to be selected'
      }
    }
    
    if (!$scope.partorder.destinationNSID) {
      return {
          valid: false,
          msg: 'destination needs to be selected'
      }
    }

    if ($scope.partSet.length == 0) {
      return {
        valid: false,
        msg: 'you must add parts to part order'
      }
    }

    partCheckLoop: for (let i = 0; i < $scope.partSet.length; i++) {
      let part = $scope.partSet[i]

      if (part.quantity == undefined || part.quantity <= 0) {
        return {
          valid: false,
          msg: part.description + ' quantity cannot be below 1'
        }
      }
    }

    return { valid: true }
  }

  // Save Part Order -------------------------------
  $scope.save = () => {
    $scope.valid = false

    let validity = checkValidity()
    if (!validity.valid) {
      AlertService.add('danger', validity.msg)
      $scope.valid = true
    } else {
      let ordersToBeSent = []
      const newDate = new Date()

      $scope.partSet.forEach(part => {
        let partOrder = newPartOrder()

        partOrder.partNSID = part.netsuiteId
        partOrder.quantity = part.quantity
        partOrder.timeCreated = newDate
        partOrder.timeSubmitted = newDate
        partOrder.techId = $scope.techId

        partOrder.originNSID = $scope.partorder.originNSID
        partOrder.destinationNSID = $scope.partorder.destinationNSID

        partOrder.part = part

        setTimesToSave(partOrder)
        
        ordersToBeSent.push(partOrder)
      })

      PartOrders.save({}, ordersToBeSent,
        (res) => {
          AlertService.add('success', "Successfully created Part Order!")
          $location.url('/partorder')
        },
        (err) => {
          ordersToBeSent.forEach(order => {
            setTimesToDisplay(order)
          })

          AlertService.add('danger', 'An error occurred while attempting to save.')
          console.log(err)
        }
      )
    }
  };
  // -----------------------------------------------
}]);
