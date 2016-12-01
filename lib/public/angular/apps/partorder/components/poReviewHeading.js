/**
 *            poReviewHeading
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('PartOrderApp.Components')
.component('pesPoReviewHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewHeading.html',
  bindings: {
    locations: '<',
    partorder: '<'
  },
  controller: ['LocationItemService', PartOrderReviewHeadingCtrl]
});

function PartOrderReviewHeadingCtrl (LocationItemService) {
  // Variable --------------------------------------
  var self = this;
  console.log(self.partorder);
  // Change origin and destination NSID to name for display
  self.originLocation = LocationItemService.getNameFromNSID(self.partorder.originNSID, self.locations);
  self.destinationLocation = LocationItemService.getNameFromNSID(self.partorder.destinationNSID, self.locations);
  // -----------------------------------------------
}
