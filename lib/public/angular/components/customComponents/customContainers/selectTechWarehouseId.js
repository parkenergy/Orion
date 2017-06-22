/**
 *            selectTechWarehouseId
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */

/// NEED TO FINISH UPDATING  REFERENCE General DestinationSelection.js
angular.module('CommonComponents')
.component('selectTechWarehouseId', {
  templateUrl: 'lib/public/angular/views/customComponents/selectTechWarehouseId.html',
  bindings: {
    ccPanelTitle: '@',
    ccClass: '@',
    ccLabel: '@',
    ccModelName: '@',
    ccReturnType: '@',
    ccType: '@',
    ccOnDataChange: '&',
    ccData: '<',
    ccLocations: '<'
  },
  controller: ['LocationItemService', SelectTechOrWarehouseCtrl]
});

function SelectTechOrWarehouseCtrl (LocationItemService) {
  // Variables --------------------------------------------------
  var self = this;
  self.locationWarehouseArray = [];
  self.locationWarehouseNSIDArray = [];
  // ------------------------------------------------------------

  // Push All Warehouse ID --------------------------------------
  if (self.ccType === "name") {
    // get the location id array
    self.locationWarehouseArray = LocationItemService.getLocationNameArray(self.ccTruckId, self.ccLocations);
  }
  if (self.ccType === "netsuiteId") {
    // get all location Objects plus
    self.locationTechWarehouseObjArray = LocationItemService.getLocationTechWarehouseObjArray(self.ccTruckId, self.ccLocations);
  }
  // ------------------------------------------------------------


  // Pass Back Change to Parent ---------------------------------
  self.onChange = function (changedData, selected) {
    self.ccOnDataChange({ item: changedData , type: self.ccType, selected: selected });
  };
  // ------------------------------------------------------------
}
