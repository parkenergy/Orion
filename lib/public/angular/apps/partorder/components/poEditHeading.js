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
  controller: ['LocationItemService', class PartOrderEditHeadingCtrl {
    constructor (LocationItemService) {
      this.LocationItemService = LocationItemService;
    }
  
    $onInit() {
      this.locationWarehouseObjArray = this.LocationItemService.getLocationWarehouseObjArray(this.locations);
      // Change origin and destination NSID to name for display
      this.originLocation = this.LocationItemService.getNameFromNSID(this.partorder.originNSID, this.locations);
      this.destinationLocation = this.LocationItemService.getNameFromNSID(this.partorder.destinationNSID, this.locations);
    }
    
    // React to changes to Part Order Obj -----------------
    $doCheck() {
      if(this.partorder.originNSID !== null){
        this.originLocation = this.LocationItemService.getNameFromNSID(this.partorder.originNSID, this.locations);
      }
    };
    // ----------------------------------------------------
  
    // Pass back Changes ----------------------------------
    selectFieldChange(changedData, selected) {
      this.onSelectChange({ changedData, selected});
    };
  
    textFieldChange(changedData, selected) {
      this.onTextChange({ changedData, selected });
    };
    // ----------------------------------------------------
    
  }]
});
