/**
 *            selectTechWarehouseId
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonComponents')
.component('selectTechWarehouseId', {
  templateUrl: 'lib/public/angular/views/customContainers/selectTechWarehouseId.html',
  bindings: {
    ccPanelTitle: '@',
    ccClass: '@',
    ccLabel: '@',
    ccType: '@',
    ccOnDataChange: '&',
    ccData: '<',
    ccLocations: '<',
    ccTruckId: '<'
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
  self.onChange = function (changedData) {
    self.ccOnDataChange({ item: changedData , type: self.ccType });
  };
  // ------------------------------------------------------------
}
