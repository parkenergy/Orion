angular.module('PartOrderApp.Components')
  .component('posEditHeading', {
    templateUrl: '/lib/public/angular/apps/partorder/views/component-views/posEditHeading.html',
    bindings: {
      selectOriginType: '@',
      onTextChange: '&',
      onSelectChange: '&',
      onSelection: '&',
      changeCheckBoxes: '&',
      disabled: '<',
      locations: '<',
      status: '<',
      partorders: '<'
    },
    controller: ['LocationItemService', class PartOrderEditHeadingCtrl {
      constructor (LocationItemService) {
        this.LocationItemService = LocationItemService;
        this.poNumber = '';
        this.originNSID = 0;
      }

      $onInit() {
        this.locationWarehouseObjArray = this.LocationItemService.getLocationWarehouseObjArray(this.locations);
      }

      // Pass back Changes ----------------------------------
      selectFieldChange(changedData, selected) {
        this.onSelectChange({ changedData, selected});
      };

      textFieldChange(changedData, selected) {
        this.onTextChange({ changedData, selected });
      };
      // ----------------------------------------------------

      // Send Back Changed Data and Type --------------------
      thisBoxDataChange(changedData, selected) {
        if ( selected !== 'canceled' ){
          this.partorders.forEach((po) => po.comment = '');
          /// this.partorder.comment = '';
        }
        if( changedData === true ) {
          this.changeCheckBoxes({changedData, selected});
          this.onSelection({ changedData, selected });
        }
      };
      // ----------------------------------------------------
    }]
  });
