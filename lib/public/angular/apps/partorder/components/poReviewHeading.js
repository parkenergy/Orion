angular.module('PartOrderApp.Components')
.component('poReviewHeading', {
  templateUrl: '/lib/public/angular/apps/partorder/views/component-views/poReviewHeading.html',
  bindings: {
    locations: '<',
    partorder: '<'
  },
  controller: ['LocationItemService', class PartOrderReviewHeadingCtrl {
    constructor (LocationItemService) {
      this.LocationItemService = LocationItemService;
    }
    
    $onInit() {
      // Change origin and destination NSID to name for display
      this.originLocation = this.LocationItemService.getNameFromNSID(this.partorder.originNSID, this.locations);
      this.destinationLocation = this.LocationItemService.getNameFromNSID(this.partorder.destinationNSID, this.locations);
      // -----------------------------------------------
    }
  }]
});

