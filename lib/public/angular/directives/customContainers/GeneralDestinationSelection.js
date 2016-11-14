/**
 *            GeneralDestinationSelection
 *
 * Created by marcusjwhelan on 11/14/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonComponents')
.component('generalDestinationSelection', {
  templateUrl: 'lib/public/angular/views/customContainers/GeneralDestinationSelection.html',
  bindings: {
    ccPanelTitle: '@',
    ccLabelOrigin: '@',
    ccLabelDestination: '@',
    ccReturnType: '@',
    ccOriginType: '@',
    ccDestinationType: '@',
    ccOriginChange: '&',
    ccDestinationChange: '&',
    ccDataOrigin: '<',
    ccDataDestination: '<',
    ccLocations: '<'
  },
  controller: ['LocationItemService', OriginDestinationLocationCtrl]
});

function OriginDestinationLocationCtrl (LocationItemService) {
  // Variables --------------------------------------------------
  var self = this;
  self.originArray = [];
  self.destinationArray = [];
  // ------------------------------------------------------------

  // Fill Origin Array ------------------------------------------
  if (self.ccOriginType === 'warehouse') {
    self.originArray = LocationItemService.getLocationWarehouseObjArray(self.ccLocations);
  } else {
    self.originArray = self.ccLocations;
  }
  // ------------------------------------------------------------

  // Fill Destination Array -------------------------------------
  if (self.ccDestinationType === 'warehouse-truck') {
    self.destinationArray = LocationItemService.getTruckObj(self.ccLocations);
  } else {
    self.destinationArray = self.ccLocations;
  }
  // ------------------------------------------------------------

  // On Changes to Either Pass Back to Parent CTRL --------------
  self.OriginChange = function (changedData) {
    self.ccOriginChange({ changedData: changedData});
  };
  self.DestinationChange = function (changedData) {
    self.ccDestinationChange({ changedData: changedData});
  };
  // ------------------------------------------------------------
}
