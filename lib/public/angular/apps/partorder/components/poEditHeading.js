/**
 *            poEditHeading
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('pesPoEditHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poEditHeading.html',
  bindings: {
    selectOriginType: '@',
    onTextChange: '&',
    onSelectChange: '&',
    locations: '<',
    partorder: '<'
  },
  controller: ['LocationItemService', PartOrderHeadingCtrl]
});

function PartOrderHeadingCtrl (LocationItemService) {
  // Variables ------------------------------------------
  var self = this;
  self.locationWarehouseObjArray = LocationItemService.getLocationWarehouseObjArray(self.locations);
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
