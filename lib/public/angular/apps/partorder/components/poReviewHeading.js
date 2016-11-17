/**
 *            poReviewHeading
 *
 * Created by marcusjwhelan on 11/10/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.modul('PartOrderApp.Components')
.component('pesPoReviewHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewHeading.html',
  bindings: {
    locations: '<',
    partorder: '<'
  },
  controller: ['LocationItemService', PartOrderReviewHeadingCtrl]
});

function PartOrderReviewHeadingCtrl (LocationItemService) {
  // Variable ---------------------------------------------
  var self = this;
  // ------------------------------------------------------

  // Change origin and destination NSID to name for display
  self.originLocation = LocationItemService.getNameFromNSID(self.partorder.originNSID);
  self.destinationLocation = LocationItemService.getNameFromNSID(self.partorder.destinationNSID);
  // ------------------------------------------------------

}
