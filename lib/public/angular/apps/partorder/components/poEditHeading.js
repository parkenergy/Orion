/**
 *            poEditHeading
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('poEditHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poEditHeading.html',
  bindings: {
    selectOriginType: '@',
    onTextChange: '&',
    onSelectChange: '&',
    locations: '<',
    partorder: '<'
  },
  controller: ['LocationItemService', PartOrderEditHeadingCtrl]
});

function PartOrderEditHeadingCtrl (LocationItemService) {
  // Variables ------------------------------------------
  var self = this;

  self.locationWarehouseObjArray = LocationItemService.getLocationWarehouseObjArray(self.locations);
  // Change origin and destination NSID to name for display
  self.originLocation = LocationItemService.getNameFromNSID(self.partorder.originNSID, self.locations);
  self.destinationLocation = LocationItemService.getNameFromNSID(self.partorder.destinationNSID, self.locations);
  // ----------------------------------------------------

  // React to changes to Part Order Obj -----------------
  self.$doCheck = function () {
    if(self.partorder.originNSID !== null){
      self.originLocation = LocationItemService.getNameFromNSID(self.partorder.originNSID, self.locations);
    }
  };
  // ----------------------------------------------------

  // Pass back Changes ----------------------------------
  self.selectFieldChange = function (changedData, selected) {
    self.onSelectChange({ changedData: changedData, selected: selected})
  };

  self.textFieldChange = function (changedData, selected) {
    self.onTextChange({ changedData: changedData, selected: selected })
  };
  // ----------------------------------------------------
}
